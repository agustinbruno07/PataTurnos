# AGENTS.md — Reglas para agentes y colaboradores

Este documento define cómo modificar PataTurnos sin romper sus reglas de negocio ni la calidad de la entrega.

## 1. Contexto del producto

PataTurnos es una aplicación de gestión de turnos veterinarios. No es un sitio institucional y no está relacionado con otros proyectos. El sistema tiene tres roles: `client`, `vet` y `admin`.

## 2. Reglas obligatorias

1. Leer `SPEC.md` antes de implementar o modificar funcionalidades.
2. Cada regla de negocio debe mantener su identificador `RN-XX` en la documentación y tener una prueba automatizada o un caso de prueba manual documentado.
3. No implementar reglas de negocio solamente en el frontend. El backend es la autoridad.
4. Nunca permitir que un usuario elija su propio rol en el registro público. El alta pública crea `client`.
5. Nunca devolver `password_hash`, tokens de terceros ni secretos en respuestas API o logs.
6. No guardar claves, tokens, URLs privadas ni credenciales en Git. Usar variables de entorno y mantener `.env` ignorado.
7. Todas las consultas SQL deben usar parámetros. No concatenar valores de usuario dentro de SQL.
8. Validar entradas en el backend. El frontend puede validar para mejorar la experiencia, pero no reemplaza la validación del servidor.
9. Respetar los permisos por rol y el alcance de propiedad: un cliente solo puede administrar sus mascotas y sus turnos.
10. Los horarios se interpretan en `America/Argentina/Buenos_Aires`.
11. No eliminar ni renombrar columnas/endpoints sin actualizar `docs/DATABASE.md`, `docs/API.md`, tests y `SPEC.md`.
12. Mantener las respuestas API en JSON y los errores con un campo `error` comprensible.
13. La interfaz debe estar en español, ser adaptable a móvil y mantener el lenguaje visual existente.
14. No agregar dependencias sin justificar su necesidad en el commit o documentación.
15. No marcar una tarea como terminada hasta ejecutar las pruebas correspondientes.

## 3. Flujo de trabajo por tarea

1. Identificar las reglas `RN-XX` y los criterios de aceptación afectados.
2. Crear una tarea pequeña y verificable.
3. Implementar backend y frontend necesarios.
4. Agregar o actualizar pruebas.
5. Ejecutar `npm test` y `npm run build`.
6. Revisar `git diff`, buscar secretos y comprobar que no se incluyan archivos `.env`.
7. Actualizar documentación si cambia el comportamiento.
8. Crear un commit por tarea, con mensaje en español.

## 4. Convención de commits

Usar Conventional Commits en español, por ejemplo:

- `feat: agregar registro de mascotas`
- `feat: implementar reserva y cancelación de turnos`
- `fix: impedir reservas superpuestas`
- `test: cubrir reglas de disponibilidad`
- `docs: actualizar guía de despliegue`

No agrupar tareas no relacionadas en un único commit.

## 5. Arquitectura

- `frontend/`: React + Vite. Consume la API con `VITE_API_URL`.
- `backend/`: Express. Autenticación JWT, validación Zod y consultas parametrizadas de PostgreSQL.
- `backend/src/domain/`: reglas que se puedan probar sin servicios externos.
- `backend/src/routes/`: controladores HTTP por recurso.
- `backend/src/db/schema.sql`: esquema idempotente de PostgreSQL.

## 6. Definición de terminado (DoD)

Una tarea está terminada cuando:

- Cumple sus criterios de aceptación.
- Aplica permisos y validaciones del servidor.
- Incluye pruebas nuevas o justifica por qué no corresponden.
- `npm test` pasa.
- `npm run build` pasa si toca frontend o contratos consumidos por frontend.
- La documentación está actualizada.
- No introduce secretos ni datos personales reales de prueba.
- Tiene un commit dedicado.

## 7. Restricciones de seguridad

- Usar `bcryptjs` con factor de costo 12 para contraseñas.
- Usar JWT con `JWT_SECRET` largo y privado.
- Mantener limitación de solicitudes en autenticación.
- Aplicar Helmet y CORS restrictivo en producción.
- No habilitar CORS `*` en producción.
- No registrar contraseñas, headers Authorization ni tokens.
- Los roles privilegiados se asignan mediante una operación administrativa controlada en PostgreSQL, no desde el formulario público.
