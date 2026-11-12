INSERT INTO services (name, description, duration_minutes, price)
VALUES
  ('Consulta general', 'Revisión clínica general de la mascota.', 30, 12000),
  ('Vacunación', 'Aplicación de vacuna y control del calendario sanitario.', 30, 9000),
  ('Consulta especializada', 'Evaluación ampliada con más tiempo de atención.', 60, 18000),
  ('Control y seguimiento', 'Control posterior a una consulta o tratamiento.', 30, 8000)
ON CONFLICT (name) DO NOTHING;

-- Las cuentas de prueba se crean mediante POST /api/auth/register.
-- Para convertir una cuenta en veterinario o administrador, actualizar su rol
-- manualmente desde una consola SQL segura. Nunca se permite elegir el rol al registrarse.
