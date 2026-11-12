import dotenv from 'dotenv';
import app from './app.js';
import { pool } from './db/pool.js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

dotenv.config();
const port = Number(process.env.PORT || 4000);
const here = dirname(fileURLToPath(import.meta.url));

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe existir y tener al menos 32 caracteres.');
  }
  // Inicializa el esquema y los servicios de ejemplo al arrancar.
  const schema = await readFile(resolve(here, 'db/schema.sql'), 'utf8');
  const seed = await readFile(resolve(here, 'db/seed.sql'), 'utf8');
  await pool.query(schema);
  await pool.query(seed);
  await pool.query('SELECT 1');
  app.listen(port, '0.0.0.0', () => console.log(`PataTurnos API escuchando en el puerto ${port}`));
}

start().catch((error) => {
  console.error('No se pudo iniciar PataTurnos:', error.message);
  process.exit(1);
});

process.on('SIGTERM', async () => { await pool.end(); process.exit(0); });
process.on('SIGINT', async () => { await pool.end(); process.exit(0); });
