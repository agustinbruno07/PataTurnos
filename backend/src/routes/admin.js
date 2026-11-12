import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/summary', async (req, res) => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users WHERE role='client' AND is_active=TRUE) AS clients,
      (SELECT COUNT(*)::int FROM users WHERE role='vet' AND is_active=TRUE) AS vets,
      (SELECT COUNT(*)::int FROM pets) AS pets,
      (SELECT COUNT(*)::int FROM appointments WHERE (start_at AT TIME ZONE 'America/Argentina/Buenos_Aires')::date = (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date AND status <> 'cancelled') AS today_appointments,
      (SELECT COUNT(*)::int FROM appointments WHERE status='pending') AS pending_appointments,
      (SELECT COUNT(*)::int FROM services WHERE is_active=TRUE) AS active_services
  `);
  res.json({ summary: result.rows[0] });
});

router.get('/users', async (req, res) => {
  const result = await pool.query(
    `SELECT id, full_name AS "fullName", email, role, phone, is_active AS "isActive", created_at AS "createdAt"
     FROM users ORDER BY created_at DESC LIMIT 300`,
  );
  res.json({ users: result.rows });
});

router.patch('/users/:id/active', validate(z.object({
  body: z.object({ isActive: z.boolean() }), params: z.object({ id: z.uuid() }), query: z.object({}),
})), async (req, res) => {
  if (req.params.id === req.user.id && !req.validated.body.isActive) {
    return res.status(400).json({ error: 'No podés desactivar tu propia cuenta.' });
  }
  const result = await pool.query(
    'UPDATE users SET is_active=$1, updated_at=NOW() WHERE id=$2 RETURNING id, is_active AS "isActive"',
    [req.validated.body.isActive, req.params.id],
  );
  if (!result.rowCount) return res.status(404).json({ error: 'No encontramos ese usuario.' });
  res.json({ user: result.rows[0] });
});

export default router;
