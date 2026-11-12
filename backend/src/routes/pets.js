import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);
const petSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(80),
    species: z.string().trim().min(2).max(40),
    breed: z.string().trim().max(80).optional().or(z.literal('')),
    birthDate: z.iso.date().optional().or(z.literal('')),
    notes: z.string().trim().max(1000).optional().or(z.literal('')),
  }), params: z.object({}), query: z.object({}),
});
const idSchema = z.object({ body: z.object({}).default({}), params: z.object({ id: z.uuid() }), query: z.object({}) });

router.get('/', async (req, res) => {
  const values = [];
  let where = '';
  if (req.user.role === 'client') { values.push(req.user.id); where = 'WHERE p.owner_id = $1'; }
  const result = await pool.query(
    `SELECT p.id, p.name, p.species, p.breed, p.birth_date AS "birthDate", p.notes,
            p.owner_id AS "ownerId", u.full_name AS "ownerName"
     FROM pets p JOIN users u ON u.id = p.owner_id ${where}
     ORDER BY p.created_at DESC`, values,
  );
  res.json({ pets: result.rows });
});

router.post('/', requireRole('client'), validate(petSchema), async (req, res) => {
  const { name, species, breed, birthDate, notes } = req.validated.body;
  const result = await pool.query(
    `INSERT INTO pets (owner_id, name, species, breed, birth_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, species, breed, birth_date AS "birthDate", notes`,
    [req.user.id, name, species, breed || null, birthDate || null, notes || null],
  );
  res.status(201).json({ pet: result.rows[0] });
});

router.put('/:id', requireRole('client'), validate(petSchema.extend({ params: z.object({ id: z.uuid() }) })), async (req, res) => {
  const { name, species, breed, birthDate, notes } = req.validated.body;
  const result = await pool.query(
    `UPDATE pets SET name=$1, species=$2, breed=$3, birth_date=$4, notes=$5, updated_at=NOW()
     WHERE id=$6 AND owner_id=$7
     RETURNING id, name, species, breed, birth_date AS "birthDate", notes`,
    [name, species, breed || null, birthDate || null, notes || null, req.params.id, req.user.id],
  );
  if (!result.rowCount) return res.status(404).json({ error: 'No encontramos esa mascota en tu cuenta.' });
  res.json({ pet: result.rows[0] });
});

router.delete('/:id', requireRole('client'), validate(idSchema), async (req, res) => {
  const result = await pool.query('DELETE FROM pets WHERE id=$1 AND owner_id=$2 RETURNING id', [req.params.id, req.user.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'No encontramos esa mascota en tu cuenta.' });
  res.status(204).send();
});

export default router;
