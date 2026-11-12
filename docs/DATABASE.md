# Modelo de datos

## Entidades

### `users`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador primario. |
| `full_name` | VARCHAR(120) | Nombre completo. |
| `email` | VARCHAR(255) UNIQUE | Correo normalizado y único. |
| `password_hash` | TEXT | Hash bcrypt. |
| `role` | VARCHAR(20) | `client`, `vet` o `admin`. |
| `phone` | VARCHAR(30) | Teléfono opcional. |
| `is_active` | BOOLEAN | Permite bloquear el acceso. |
| `created_at`, `updated_at` | TIMESTAMPTZ | Fechas de auditoría básicas. |

### `pets`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador primario. |
| `owner_id` | UUID FK users | Propietario de la mascota. |
| `name` | VARCHAR(80) | Nombre obligatorio. |
| `species` | VARCHAR(40) | Especie obligatoria. |
| `breed` | VARCHAR(80) | Raza opcional. |
| `birth_date` | DATE | Fecha de nacimiento opcional. |
| `notes` | VARCHAR(1000) | Observaciones opcionales. |

### `services`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador primario. |
| `name` | VARCHAR(100) UNIQUE | Nombre del servicio. |
| `description` | VARCHAR(500) | Descripción. |
| `duration_minutes` | INTEGER | Solo 30 o 60. |
| `price` | NUMERIC(10,2) | Precio no negativo. |
| `is_active` | BOOLEAN | Controla la publicación del servicio. |

### `appointments`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador primario. |
| `pet_id` | UUID FK pets | Mascota atendida. |
| `client_id` | UUID FK users | Cliente que reserva. |
| `vet_id` | UUID FK users | Profesional asignado. |
| `service_id` | UUID FK services | Servicio elegido. |
| `start_at`, `end_at` | TIMESTAMPTZ | Intervalo de atención. |
| `status` | VARCHAR(20) | `pending`, `confirmed`, `completed`, `cancelled`. |
| `notes` | VARCHAR(1000) | Comentarios opcionales. |

## Relaciones

- Un usuario cliente puede tener muchas mascotas.
- Una mascota pertenece a un cliente.
- Un cliente puede tener muchos turnos.
- Un veterinario puede tener muchos turnos.
- Un servicio puede aparecer en muchos turnos.
- Cada turno se vincula a una mascota, un cliente, un veterinario y un servicio.

## Integridad y concurrencia

- Las claves foráneas de mascotas/turnos usan `ON DELETE RESTRICT` para proteger el historial.
- Los servicios no se eliminan en cascada desde los turnos.
- Los índices cubren propietario de mascota, cliente, veterinario/fecha y estado.
- La aplicación toma `pg_advisory_xact_lock(hashtext(vet_id))` antes de consultar colisiones e insertar una reserva. La verificación considera turnos `pending` y `confirmed` y usa la condición de solapamiento `start_existente < end_nuevo AND end_existente > start_nuevo`.
- El intervalo se considera semiabierto `[inicio, fin)`: un turno puede comenzar exactamente cuando termina otro.

## Inicialización

El esquema está en `backend/src/db/schema.sql`. Los servicios iniciales están en `backend/src/db/seed.sql`. Ambos se aplican desde el arranque del backend o con `npm run migrate --workspace backend`.
