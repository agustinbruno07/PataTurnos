import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const registerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(120),
    email: z.email().transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(72),
    phone: z.string().trim().max(30).optional().or(z.literal('')),
  }), params: z.object({}), query: z.object({}),
});
const loginSchema = z.object({
  body: z.object({ email: z.email().transform((value) => value.toLowerCase()), password: z.string().min(1).max(72) }),
  params: z.object({}), query: z.object({}),
});

function issueToken(user) {
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  return { token, user };
}

router.post('/register', validate(registerSchema), async (req, res) => {
  const { fullName, email, password, phone } = req.validated.body;
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name AS "fullName", email, role, phone`,
    [fullName, email, passwordHash, phone || null],
  );
  res.status(201).json(issueToken(result.rows[0]));
});

router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.validated.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !user.is_active || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'El correo o la contraseña son incorrectos.' });
  }
  res.json(issueToken({ id: user.id, fullName: user.full_name, email: user.email, role: user.role, phone: user.phone }));
});

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

export default router;
