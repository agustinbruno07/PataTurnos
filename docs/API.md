# API REST

Base local: `http://localhost:4000`. Los recursos funcionales se encuentran bajo `/api`. Las rutas privadas requieren `Authorization: Bearer <JWT>`.

## Salud

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/health` | Público | Comprueba que la API responde. |

## Autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Crea cuenta cliente. |
| POST | `/api/auth/login` | Público | Inicia sesión y devuelve JWT. |
| GET | `/api/auth/me` | Autenticado | Devuelve el usuario actual. |

Ejemplo de registro:

```json
{
  "fullName": "Martina López",
  "email": "martina@example.com",
  "password": "clave-segura-123",
  "phone": "11 1234 5678"
}
```

No enviar `role`: el servidor asigna `client`.

## Mascotas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/pets` | Autenticado | Clientes ven sus mascotas; personal autorizado puede consultar todas. |
| POST | `/api/pets` | Cliente | Crea mascota propia. |
| PUT | `/api/pets/:id` | Cliente propietario | Actualiza ficha propia. |
| DELETE | `/api/pets/:id` | Cliente propietario | Elimina si no tiene referencias a turnos. |

Ejemplo de mascota:

```json
{
  "name": "Mora",
  "species": "Perro",
  "breed": "Mestiza",
  "birthDate": "2021-05-10",
  "notes": "Tiene alergia conocida a…"
}
```

## Servicios y veterinarios

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/services` | Público | Lista servicios activos. |
| GET | `/api/services/admin/all` | Admin | Lista servicios activos e inactivos para administración. |
| POST | `/api/services` | Admin | Crea servicio. |
| PUT | `/api/services/:id` | Admin | Actualiza servicio. |
| GET | `/api/vets` | Público | Lista veterinarios activos. |

Servicio de ejemplo:

```json
{
  "name": "Consulta general",
  "description": "Revisión clínica general.",
  "durationMinutes": 30,
  "price": 12000,
  "isActive": true
}
```

## Turnos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/appointments` | Autenticado | Lista los turnos según rol. Filtro opcional `?status=pending`. |
| GET | `/api/appointments/availability?vetId=UUID&serviceId=UUID&date=YYYY-MM-DD` | Autenticado | Devuelve horarios disponibles. |
| POST | `/api/appointments` | Cliente | Solicita un nuevo turno. |
| PATCH | `/api/appointments/:id/cancel` | Cliente propietario | Cancela si cumple el plazo. |
| PATCH | `/api/appointments/:id/status` | Veterinario asignado o admin | Confirma, completa o cancela. |

Ejemplo de reserva:

```json
{
  "petId": "UUID-DE-MASCOTA",
  "serviceId": "UUID-DEL-SERVICIO",
  "vetId": "UUID-DEL-VETERINARIO",
  "startAt": "2026-12-10T10:00:00-03:00",
  "notes": "Primera consulta."
}
```

Una creación exitosa devuelve `201` y estado `pending`. Si el horario se ocupa concurrentemente, devuelve `409 Conflict`.

## Administración

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/admin/summary` | Admin | Indicadores generales. |
| GET | `/api/admin/users` | Admin | Lista usuarios. |
| PATCH | `/api/admin/users/:id/active` | Admin | Activa o desactiva una cuenta. |

Ejemplo para activar/desactivar:

```json
{ "isActive": false }
```

## Códigos HTTP habituales

- `200`: consulta o actualización exitosa.
- `201`: recurso creado.
- `204`: eliminación exitosa sin cuerpo.
- `400`: datos inválidos o regla de negocio incumplida.
- `401`: falta de autenticación o token no válido.
- `403`: rol insuficiente.
- `404`: recurso inexistente o fuera del alcance del usuario.
- `409`: conflicto de unicidad o disponibilidad.
- `500`: error interno genérico.
