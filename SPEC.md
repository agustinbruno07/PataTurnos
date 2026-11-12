# SPEC — PataTurnos

**Versión:** 1.0.0  
**Fecha:** 12/11/2026  
**Producto:** Sistema web de gestión de turnos para clínicas veterinarias.

## 1. Problema

Las clínicas veterinarias necesitan organizar sus turnos, evitar superposiciones y mantener información básica de clientes y mascotas. Los clientes necesitan reservar sin tener que llamar para consultar cada horario disponible. PataTurnos centraliza estos procesos en una aplicación web.

## 2. Objetivo

Construir una aplicación web full-stack, accesible desde internet, que permita gestionar clientes, mascotas, servicios, veterinarios y turnos con reglas de negocio verificables.

## 3. Alcance de la primera versión

### Incluido

- Registro e inicio de sesión de clientes.
- Autenticación mediante JWT.
- Roles `client`, `vet` y `admin`.
- Alta, consulta, edición y eliminación de fichas de mascotas (sujeto a que no tengan turnos asociados).
- Catálogo de servicios con duración y precio.
- Consulta de veterinarios disponibles.
- Consulta de horarios libres por fecha, profesional y servicio.
- Solicitud, consulta y cancelación de turnos.
- Confirmación, finalización y cancelación administrativa/profesional de turnos.
- Panel de cliente, panel de veterinario y panel administrativo.
- Reporte básico de usuarios, mascotas, servicios y turnos.

### Fuera de alcance de la primera versión

- Historias clínicas completas y recetas digitales.
- Cobros en línea y facturación fiscal.
- Notificaciones por WhatsApp, SMS o correo transaccional.
- Videoconsultas.
- Multi-sucursal y horarios individuales complejos por profesional.
- Aplicación móvil nativa.

Estas funciones pueden quedar como mejoras futuras, pero no son necesarias para la aceptación de esta versión.

## 4. Actores y permisos

| Actor | Permisos principales |
|---|---|
| Visitante | Consultar acceso, registrarse e iniciar sesión. |
| Cliente | Administrar sus mascotas, consultar servicios, consultar disponibilidad, reservar y cancelar sus propios turnos. |
| Veterinario | Consultar los turnos asignados y confirmar, completar o cancelar la atención. |
| Administrador | Consultar indicadores y usuarios, activar/desactivar cuentas y gestionar servicios. Los roles privilegiados se asignan por procedimiento seguro fuera del registro público. |

## 5. Reglas de negocio

Las reglas se validan principalmente en el backend. Los controles de frontend solo mejoran la experiencia.

| ID | Regla |
|---|---|
| RN-01 | Cada cuenta debe tener un correo electrónico único, normalizado a minúsculas. |
| RN-02 | El registro público crea siempre usuarios con rol `client`; nunca acepta un rol enviado por el cliente HTTP. |
| RN-03 | Las contraseñas deben tener al menos 8 caracteres y se almacenan mediante hash bcrypt, nunca en texto plano. |
| RN-04 | Solo los usuarios autenticados y activos pueden acceder a recursos privados. |
| RN-05 | Un cliente solo puede consultar, modificar o eliminar mascotas cuyo `owner_id` sea su propio identificador. |
| RN-06 | Una mascota debe tener nombre y especie; raza, fecha de nacimiento y observaciones son opcionales. |
| RN-07 | Una mascota con turnos asociados no se puede eliminar; debe conservarse la integridad histórica. |
| RN-08 | Solo se pueden reservar servicios activos. |
| RN-09 | La duración válida de un servicio es de 30 o 60 minutos. |
| RN-10 | Un turno debe vincular una mascota propia, un servicio activo y un usuario activo con rol `vet`. |
| RN-11 | Los turnos se programan de lunes a viernes de 09:00 a 18:00 y sábados de 09:00 a 13:00, hora de Argentina. Los domingos la clínica permanece cerrada. |
| RN-12 | Los turnos comienzan en minutos `:00` o `:30` y deben finalizar dentro del horario de atención del mismo día. |
| RN-13 | Una reserva debe realizarse con al menos 2 horas de anticipación. |
| RN-14 | No se permite reservar con más de 90 días de anticipación. |
| RN-15 | Un veterinario no puede tener dos turnos `pending` o `confirmed` cuyos intervalos se superpongan. Los intervalos contiguos sí están permitidos. |
| RN-16 | La creación de un turno debe verificar la disponibilidad dentro de una transacción con bloqueo por veterinario para evitar reservas simultáneas duplicadas. |
| RN-17 | Toda nueva reserva comienza con estado `pending`; el cliente no puede confirmar su propio turno. |
| RN-18 | Un cliente puede cancelar sus turnos pendientes o confirmados si faltan al menos 2 horas para el inicio. |
| RN-19 | El veterinario asignado o un administrador puede confirmar una reserva pendiente o cancelarla. |
| RN-20 | Un turno confirmado solo puede marcarse como `completed` después de su hora de finalización. |
| RN-21 | Los estados `completed` y `cancelled` son terminales y no pueden reabrirse ni cambiarse. |
| RN-22 | Un veterinario solo puede consultar y modificar los turnos que tiene asignados. El administrador puede consultar todos. |
| RN-23 | Los usuarios desactivados no pueden autenticarse ni reservar turnos. |
| RN-24 | Las operaciones de administración requieren rol `admin`; las operaciones clínicas requieren rol `vet` o `admin`, según el endpoint. |

## 6. Flujos principales

### 6.1 Registro de cliente

1. El visitante abre el formulario de registro.
2. Ingresa nombre, correo, contraseña y teléfono opcional.
3. El backend valida los datos y comprueba que el correo no exista.
4. El backend genera el hash de contraseña, crea una cuenta `client` y devuelve un JWT.
5. El usuario ingresa al panel y puede registrar mascotas.

### 6.2 Registro de mascota

1. El cliente abre “Mis mascotas”.
2. Carga nombre y especie; puede completar raza, nacimiento y observaciones.
3. El backend asocia la ficha al cliente autenticado.
4. La ficha aparece en el listado del cliente.

### 6.3 Reserva de turno

1. El cliente elige mascota, servicio, veterinario y fecha.
2. El frontend consulta `/api/appointments/availability`.
3. La API devuelve horarios libres calculados con duración del servicio, agenda existente y horario de atención.
4. El cliente elige un horario y confirma la solicitud.
5. El backend vuelve a validar las reglas y bloquea transaccionalmente al veterinario.
6. Si el horario sigue libre, registra el turno como `pending`; si ya fue ocupado, responde `409`.
7. El turno aparece en “Mis turnos” y en la agenda del veterinario.

### 6.4 Atención veterinaria

1. El veterinario ingresa a su agenda.
2. Puede confirmar un turno pendiente.
3. Después de la hora de finalización, puede marcarlo como completado.
4. El cambio de estado queda registrado en el turno.

### 6.5 Administración

1. El administrador consulta indicadores generales.
2. Puede activar o desactivar usuarios.
3. Puede consultar la actividad reciente.
4. La asignación de roles privilegiados se realiza mediante procedimiento seguro en la base, no desde el registro público.

## 7. Criterios de aceptación

- CA-01: un cliente puede registrarse e iniciar sesión.
- CA-02: un cliente puede crear, editar y consultar sus mascotas.
- CA-03: otro cliente no puede acceder ni modificar fichas ajenas.
- CA-04: se muestran los servicios activos con duración y precio.
- CA-05: se muestran veterinarios activos.
- CA-06: la disponibilidad excluye horarios ocupados, cierres y horarios fuera de anticipación permitida.
- CA-07: un cliente puede reservar un horario válido y la reserva queda `pending`.
- CA-08: no pueden registrarse dos turnos superpuestos para el mismo veterinario.
- CA-09: el cliente puede cancelar sus turnos dentro del plazo permitido.
- CA-10: el veterinario puede confirmar y completar turnos asignados respetando las transiciones.
- CA-11: el administrador puede consultar indicadores y activar/desactivar usuarios.
- CA-12: todos los endpoints privados rechazan usuarios no autenticados.
- CA-13: el frontend se puede compilar para producción.
- CA-14: la API y base de datos se pueden desplegar y probar desde internet con variables de entorno.
- CA-15: la documentación, el plan y el informe de pruebas se encuentran en el repositorio público.

## 8. Supuestos

- La clínica usa una agenda general por veterinario.
- Los precios son valores de ejemplo en pesos argentinos y deben ser editados por la clínica.
- La zona horaria operativa es `America/Argentina/Buenos_Aires`.
- La disponibilidad real depende de los turnos cargados y de la cantidad de veterinarios habilitados.
- La primera versión no realiza cobros ni envía notificaciones externas.

## 9. Mejoras futuras

- Recordatorios por correo/WhatsApp.
- Historia clínica, vacunas y tratamientos.
- Horarios, licencias y ausencias por veterinario.
- Pagos y comprobantes.
- Reportes de ingresos y ocupación.
