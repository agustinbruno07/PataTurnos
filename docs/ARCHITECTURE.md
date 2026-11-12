# Arquitectura

## Vista general

PataTurnos usa una arquitectura cliente-servidor de tres componentes:

```text
Navegador
   │ HTTPS / JSON
   ▼
Frontend React + Vite (Netlify)
   │ Authorization: Bearer <JWT>
   ▼
API REST Express (Render)
   │ SQL parametrizado / TLS
   ▼
PostgreSQL (Neon)
```

El frontend presenta las pantallas y mejora la experiencia de uso. El backend es responsable de autenticar, autorizar, validar y aplicar las reglas. PostgreSQL conserva usuarios, mascotas, servicios y turnos.

## Componentes

### Frontend

- React 19 y Vite.
- React Router para navegación.
- Context API para sesión.
- `api.js` centraliza llamadas HTTP y el token.
- `VITE_API_URL` define la URL de la API.
- Pantallas: registro, login, inicio de cliente, mascotas, reserva, turnos, agenda veterinaria y administración.

### Backend

- Node.js 22 y Express 5.
- JWT para sesiones.
- bcryptjs para contraseñas.
- Zod para validación de entradas.
- Helmet, CORS y rate limit.
- `pg` para PostgreSQL.
- Reglas de agenda extraídas a `src/domain/appointments.js` para poder probarlas sin una base real.

### Base de datos

PostgreSQL con tablas `users`, `pets`, `services` y `appointments`. Las claves foráneas evitan referencias huérfanas. Los índices soportan búsquedas por dueño, veterinario, fecha y estado.

## Decisiones relevantes

1. **El backend es la fuente de verdad.** No se confía en validaciones del navegador para autorizar ni reservar.
2. **Roles cerrados.** El registro público solo genera clientes; asignar roles privilegiados requiere acceso administrativo a la base.
3. **Reserva transaccional.** Se usa un advisory lock de PostgreSQL por veterinario para serializar las altas concurrentes y verificar colisiones dentro de la transacción.
4. **Estados terminales.** Los turnos completados o cancelados no pueden reabrirse.
5. **Zona horaria.** La agenda utiliza `America/Argentina/Buenos_Aires`; las marcas se almacenan como `TIMESTAMPTZ`.
6. **Servicios configurables.** La duración y precio se guardan en base de datos, no se fijan en la interfaz.

## Límites conocidos de la versión

- La agenda es general por veterinario y no modela licencias ni franjas individuales.
- El proyecto no integra cobros ni notificaciones externas.
- El panel administrador permite activar/desactivar cuentas y consultar indicadores; el catálogo de servicios tiene endpoints de administración aunque la pantalla CRUD visual puede ampliarse.
- No hay todavía auditoría histórica completa de cambios de estado.

## Escalabilidad futura

Se pueden incorporar tablas para sucursales, horarios semanales por profesional, disponibilidad extraordinaria, vacunas, historiales clínicos, notificaciones y pagos sin cambiar el concepto central de la aplicación.
