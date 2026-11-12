import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  buildAvailableSlots, canClientCancel, canTransitionStatus, validateAppointmentWindow,
} from '../domain/appointments.js';

const router = Router();
router.use(authenticate);
const createSchema = z.object({
  body: z.object({
    petId: z.uuid(), serviceId: z.uuid(), vetId: z.uuid(),
    startAt: z.iso.datetime({ offset: true }),
    notes: z.string().trim().max(1000).optional().or(z.literal('')),
  }), params: z.object({}), query: z.object({}),
});
const availabilitySchema = z.object({
  body: z.object({}).default({}), params: z.object({}),
  query: z.object({ vetId: z.uuid(), serviceId: z.uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
});
const statusSchema = z.object({
  body: z.object({ status: z.enum(['confirmed', 'completed', 'cancelled']) }),
  params: z.object({ id: z.uuid() }), query: z.object({}),
});

const APPOINTMENT_SELECT = `
  SELECT a.id, a.start_at AS "startAt", a.end_at AS "endAt", a.status, a.notes,
         p.id AS "petId", p.name AS "petName", p.species AS "petSpecies",
         c.id AS "clientId", c.full_name AS "clientName", c.email AS "clientEmail", c.phone AS "clientPhone",
         v.id AS "vetId", v.full_name AS "vetName",
         s.id AS "serviceId", s.name AS "serviceName", s.duration_minutes AS "durationMinutes", s.price
  FROM appointments a
  JOIN pets p ON p.id = a.pet_id
  JOIN users c ON c.id = a.client_id
  JOIN users v ON v.id = a.vet_id
  JOIN services s ON s.id = a.service_id`;

router.get('/availability', validate(availabilitySchema), async (req, res) => {
  const { vetId, serviceId, date } = req.validated.query;
  const vetResult = await pool.query("SELECT id FROM users WHERE id=$1 AND role='vet' AND is_active=TRUE", [vetId]);
  if (!vetResult.rowCount) return res.status(404).json({ error: 'No encontramos ese veterinario.' });
  const serviceResult = await pool.query('SELECT duration_minutes FROM services WHERE id=$1 AND is_active=TRUE', [serviceId]);
  if (!serviceResult.rowCount) return res.status(404).json({ error: 'No encontramos ese servicio.' });
  const busyResult = await pool.query(
    `SELECT start_at, end_at FROM appointments
     WHERE vet_id=$1 AND status IN ('pending','confirmed')
       AND start_at < (($2::date + INTERVAL '1 day') AT TIME ZONE 'America/Argentina/Buenos_Aires')
       AND end_at > ($2::date AT TIME ZONE 'America/Argentina/Buenos_Aires')`, [vetId, date],
  );
  const slots = buildAvailableSlots(date, serviceResult.rows[0].duration_minutes, busyResult.rows);
  res.json({ date, slots });
});

router.get('/', async (req, res) => {
  const values = [];
  let where = '';
  if (req.user.role === 'client') { values.push(req.user.id); where = 'WHERE a.client_id=$1'; }
  if (req.user.role === 'vet') { values.push(req.user.id); where = 'WHERE a.vet_id=$1'; }
  if (req.query.status) {
    values.push(req.query.status);
    where += `${where ? ' AND' : 'WHERE'} a.status=$${values.length}`;
  }
  const result = await pool.query(`${APPOINTMENT_SELECT} ${where} ORDER BY a.start_at DESC LIMIT 200`, values);
  res.json({ appointments: result.rows });
});

router.post('/', requireRole('client'), validate(createSchema), async (req, res) => {
  const { petId, serviceId, vetId, startAt, notes } = req.validated.body;
  const [petResult, serviceResult, vetResult] = await Promise.all([
    pool.query('SELECT id FROM pets WHERE id=$1 AND owner_id=$2', [petId, req.user.id]),
    pool.query('SELECT id, duration_minutes FROM services WHERE id=$1 AND is_active=TRUE', [serviceId]),
    pool.query("SELECT id FROM users WHERE id=$1 AND role='vet' AND is_active=TRUE", [vetId]),
  ]);
  if (!petResult.rowCount) return res.status(400).json({ error: 'La mascota seleccionada no pertenece a tu cuenta.' });
  if (!serviceResult.rowCount) return res.status(400).json({ error: 'El servicio seleccionado no está disponible.' });
  if (!vetResult.rowCount) return res.status(400).json({ error: 'El veterinario seleccionado no está disponible.' });

  const window = validateAppointmentWindow(startAt, serviceResult.rows[0].duration_minutes);
  if (!window.ok) return res.status(400).json({ error: window.message });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Bloqueo transaccional por veterinario: evita que dos peticiones simultáneas
    // reserven el mismo horario aunque todavía no exista una fila para bloquear.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [vetId]);
    const collision = await client.query(
      `SELECT id FROM appointments
       WHERE vet_id=$1 AND status IN ('pending','confirmed')
         AND start_at < $3 AND end_at > $2
       LIMIT 1`, [vetId, window.startAt, window.endAt],
    );
    if (collision.rowCount) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Ese horario acaba de ocuparse. Elegí otro turno disponible.' });
    }
    const inserted = await client.query(
      `INSERT INTO appointments (pet_id, client_id, vet_id, service_id, start_at, end_at, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [petId, req.user.id, vetId, serviceId, window.startAt, window.endAt, notes || null],
    );
    await client.query('COMMIT');
    const result = await pool.query(`${APPOINTMENT_SELECT} WHERE a.id=$1`, [inserted.rows[0].id]);
    res.status(201).json({ appointment: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

router.patch('/:id/cancel', requireRole('client'), validate(z.object({ body: z.object({}).default({}), params: z.object({ id: z.uuid() }), query: z.object({}) })), async (req, res) => {
  const result = await pool.query(
    `SELECT id, start_at, status FROM appointments WHERE id=$1 AND client_id=$2`, [req.params.id, req.user.id],
  );
  const appointment = result.rows[0];
  if (!appointment) return res.status(404).json({ error: 'No encontramos ese turno en tu cuenta.' });
  if (!['pending', 'confirmed'].includes(appointment.status)) return res.status(400).json({ error: 'Este turno ya no se puede cancelar.' });
  if (!canClientCancel(appointment.start_at)) return res.status(400).json({ error: 'Para cancelar desde la app faltan al menos 2 horas para el turno. Contactá a la clínica.' });
  const updated = await pool.query(
    `UPDATE appointments SET status='cancelled', updated_at=NOW() WHERE id=$1 RETURNING id, status`, [req.params.id],
  );
  res.json({ appointment: updated.rows[0] });
});

router.patch('/:id/status', requireRole('vet', 'admin'), validate(statusSchema), async (req, res) => {
  const result = await pool.query(
    `${APPOINTMENT_SELECT} WHERE a.id=$1 ${req.user.role === 'vet' ? 'AND a.vet_id=$2' : ''}`,
    req.user.role === 'vet' ? [req.params.id, req.user.id] : [req.params.id],
  );
  const appointment = result.rows[0];
  if (!appointment) return res.status(404).json({ error: 'No encontramos ese turno.' });
  const transition = canTransitionStatus(appointment.status, req.validated.body.status, appointment.endAt);
  if (!transition.ok) return res.status(400).json({ error: transition.message });
  const updated = await pool.query(
    `UPDATE appointments SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING id, status`,
    [req.validated.body.status, req.params.id],
  );
  res.json({ appointment: updated.rows[0] });
});

export default router;
