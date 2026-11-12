import { Router } from 'express';
import { pool } from '../db/pool.js';
const router = Router();
router.get('/', async (req, res) => {
  const result = await pool.query(
    "SELECT id, full_name AS name FROM users WHERE role='vet' AND is_active=TRUE ORDER BY full_name",
  );
  res.json({ vets: result.rows });
});
export default router;
