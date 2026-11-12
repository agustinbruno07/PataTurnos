# Despliegue público

El repositorio queda preparado para Netlify + Render + Neon. La publicación efectiva requiere que el propietario cree las cuentas, configure sus propios secretos y conecte el repositorio.

## 1. PostgreSQL en Neon

1. Crear un proyecto PostgreSQL en Neon.
2. Copiar la cadena de conexión pooled o directa desde el panel.
3. Mantener `sslmode=require` si Neon lo incluye.
4. Guardar la cadena como `DATABASE_URL` en Render, no en Git.
5. Ejecutar una vez el backend o el comando de migración para crear tablas y servicios iniciales.

## 2. Backend en Render

El archivo `render.yaml` define un servicio web Node. Pasos alternativos desde el panel:

- Repository: repositorio público de GitHub.
- Root directory: `backend`.
- Build command: `npm install`.
- Start command: `npm start`.
- Environment: `NODE_ENV=production`.
- `DATABASE_URL`: URL de Neon.
- `JWT_SECRET`: secreto aleatorio de al menos 32 caracteres, creado desde Render.
- `JWT_EXPIRES_IN=8h`.
- `CORS_ORIGIN`: dominio final de Netlify, sin barra final.

Verificar `https://TU-API.onrender.com/health`. La respuesta esperada contiene `status: "ok"`.

## 3. Frontend en Netlify

El archivo `netlify.toml` define:

- Build command: `npm run build --workspace frontend`.
- Publish directory: `frontend/dist`.
- Redirect SPA para que React Router atienda rutas como `/mascotas` y `/reservar`.

Configurar la variable de entorno:

```env
VITE_API_URL=https://TU-API.onrender.com/api
```

Después de guardar la variable, volver a desplegar el sitio.

## 4. CORS

Una vez que Netlify asigne el dominio definitivo, actualizar `CORS_ORIGIN` en Render con ese origen exacto. No usar `*` en producción. Si hay dominios de preview, agregarlos explícitamente solo si se necesitan.

## 5. Crear usuarios operativos

1. Registrarse como cliente desde la aplicación desplegada.
2. En Neon SQL Editor, cambiar el rol de la cuenta elegida a `admin`:

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@tudominio.com';
   ```

3. Registrar de la misma forma una cuenta para cada profesional y cambiar el rol:

   ```sql
   UPDATE users SET role = 'vet' WHERE email = 'veterinario@tudominio.com';
   ```

4. Cerrar sesión y volver a entrar en cada cuenta.

No compartir el usuario administrador ni la cadena de Neon en la documentación pública.

## 6. Prueba de humo de producción

- Abrir la home del sitio Netlify y confirmar que no hay errores de carga.
- Consultar `/health` de Render.
- Crear una cuenta cliente de prueba.
- Registrar una mascota.
- Iniciar sesión como veterinario y revisar que la cuenta aparece en `/api/vets`.
- Consultar servicios y disponibilidad.
- Crear una reserva de prueba.
- Verificar que aparece como pendiente en la cuenta cliente y en la agenda del veterinario.
- Intentar reservar el mismo horario con otra cuenta y comprobar que el backend responde `409`.
- Confirmar el turno como veterinario.
- Comprobar que el cliente puede ver el nuevo estado.
- Eliminar los datos de prueba o identificarlos claramente como datos ficticios.

## 7. Problemas frecuentes

- **CORS:** comprobar que `CORS_ORIGIN` coincide exactamente con el dominio de Netlify.
- **Error 500 al iniciar:** revisar `DATABASE_URL`, conectividad de Neon y logs de Render.
- **No aparecen veterinarios:** verificar que haya al menos una cuenta activa con rol `vet`.
- **No hay horarios libres:** comprobar el día, horario comercial, anticipación mínima y turnos ya existentes.
- **Frontend apunta a localhost:** definir `VITE_API_URL` en Netlify y volver a desplegar.
