import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Tenés que iniciar sesión para continuar.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, full_name AS "fullName", email, role, phone, is_active AS "isActive" FROM users WHERE id = $1',
      [payload.sub],
    );
    const user = result.rows[0];
    if (!user || !user.isActive) return res.status(401).json({ error: 'La cuenta no está disponible.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'La sesión venció o no es válida. Iniciá sesión nuevamente.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tenés permisos para realizar esta acción.' });
    }
    next();
  };
}
