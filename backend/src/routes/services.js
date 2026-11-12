import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const serviceSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional().or(z.literal('')),
    durationMinutes: z.union([z.literal(30), z.literal(60)]),
    price: z.coerce.number().min(0).max(99999999),
    isActive: z.boolean().optional(),
  }), params: z.object({}), query: z.object({}),
});

router.get('/admin/all', authenticate, requireRole('admin'), async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, description, duration_minutes AS "durationMinutes", price,
            is_active AS "isActive" FROM services ORDER BY name`,
  );
  res.json({ services: result.rows });
});

router.get('/', async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, description, duration_minutes AS "durationMinutes", price,
            is_active AS "isActive" FROM services
     ${req.query.includeInactive === 'true' && req.user?.role === 'admin' ? '' : 'WHERE is_active = TRUE'}
     ORDER BY name`,
  );
  res.json({ services: result.rows });
});

router.post('/', authenticate, requireRole('admin'), validate(serviceSchema), async (req, res) => {
  const { name, description, durationMinutes, price, isActive = true } = req.validated.body;
  const result = await pool.query(
    `INSERT INTO services (name, description, duration_minutes, price, is_active)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, name, description, duration_minutes AS "durationMinutes", price, is_active AS "isActive"`,
    [name, description || null, durationMinutes, price, isActive],
  );
  res.status(201).json({ service: result.rows[0] });
});

router.put('/:id', authenticate, requireRole('admin'), validate(serviceSchema.extend({ params: z.object({ id: z.uuid() }) })), async (req, res) => {
  const { name, description, durationMinutes, price, isActive = true } = req.validated.body;
  const result = await pool.query(
    `UPDATE services SET name=$1, description=$2, duration_minutes=$3, price=$4, is_active=$5, updated_at=NOW()
     WHERE id=$6
     RETURNING id, name, description, duration_minutes AS "durationMinutes", price, is_active AS "isActive"`,
    [name, description || null, durationMinutes, price, isActive, req.params.id],
  );
  if (!result.rowCount) return res.status(404).json({ error: 'No encontramos ese servicio.' });
  res.json({ service: result.rows[0] });
});

export default router;
