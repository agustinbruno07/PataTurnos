import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import dotenv from 'dotenv';
import { pool } from './pool.js';

dotenv.config();
const here = dirname(fileURLToPath(import.meta.url));

try {
  const schema = await readFile(resolve(here, 'schema.sql'), 'utf8');
  const seed = await readFile(resolve(here, 'seed.sql'), 'utf8');
  await pool.query(schema);
  await pool.query(seed);
  console.log('Migración y datos iniciales aplicados correctamente.');
} catch (error) {
  console.error('No se pudo inicializar la base de datos:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
