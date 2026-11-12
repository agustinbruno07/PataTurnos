# Seguridad y privacidad

## Controles incluidos

- Contraseñas almacenadas con bcryptjs (factor 12).
- JWT con expiración configurable.
- `JWT_SECRET` obligatorio de al menos 32 caracteres para iniciar el backend.
- Validación de payloads con Zod.
- Consultas SQL parametrizadas.
- Middleware de autenticación y autorización por roles.
- El registro público no acepta roles.
- Helmet para cabeceras HTTP.
- CORS configurable por origen.
- Rate limiting en rutas de autenticación.
- Límite de tamaño del JSON recibido.
- `.env` y variables locales excluidos de Git.

## Antes de producción

1. Generar un secreto JWT criptográficamente aleatorio y exclusivo para producción.
2. Cargar secretos desde el panel del proveedor; nunca desde el repositorio.
3. Configurar `CORS_ORIGIN` con el dominio exacto de Netlify.
4. Usar conexión TLS a PostgreSQL.
5. Restringir el acceso a Neon y rotar credenciales si se sospecha exposición.
6. Crear al menos un administrador mediante procedimiento seguro.
7. Usar datos ficticios durante pruebas y no cargar historiales reales sin autorización.
8. Habilitar HTTPS en el frontend y la API.
9. Revisar dependencias y ejecutar `npm audit` antes de la entrega.
10. No reutilizar contraseñas personales ni credenciales de servicios.

## Consideraciones

El JWT se guarda en `localStorage` en esta versión. Para un producto comercial expuesto a amenazas mayores convendría migrar a cookies `HttpOnly`, `Secure` y `SameSite`, incorporar protección CSRF donde corresponda y definir una política de refresh/revocación de tokens.

El sistema gestiona información de contacto y datos básicos de mascotas. No debe usarse para almacenar información clínica sensible real sin una revisión de privacidad, permisos, auditoría, copias de seguridad y cumplimiento normativo.
