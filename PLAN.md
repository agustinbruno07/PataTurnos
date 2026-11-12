# Plan de trabajo — PataTurnos

**Fecha de planificación:** 12/11/2026  
**Fecha límite académica:** 31/12/2026

El plan separa los elementos construidos en el paquete de las tareas que necesitan cuentas, credenciales o validación real en los proveedores de hosting.

## Estado general

- [x] Definir un proyecto propio y su alcance.
- [x] Escribir la especificación funcional y reglas de negocio.
- [x] Definir actores y permisos.
- [x] Diseñar el esquema PostgreSQL.
- [x] Implementar API REST inicial.
- [x] Implementar autenticación y roles.
- [x] Implementar gestión de mascotas.
- [x] Implementar servicios y veterinarios.
- [x] Implementar disponibilidad, reserva y cancelación de turnos.
- [x] Implementar paneles de cliente, veterinario y administrador.
- [x] Incorporar pruebas automatizadas de reglas de negocio.
- [x] Crear guía de agentes (`AGENTS.md`).
- [x] Crear documentación de arquitectura, API, datos y seguridad.
- [x] Crear guía de despliegue.
- [ ] Ejecutar instalación limpia de dependencias en el entorno definitivo.
- [ ] Configurar una instancia de PostgreSQL de producción en Neon.
- [ ] Desplegar backend en Render y configurar variables secretas.
- [ ] Desplegar frontend en Netlify y configurar `VITE_API_URL`.
- [ ] Ejecutar pruebas de humo sobre las URLs públicas.
- [ ] Completar el informe con resultados de pruebas de producción.
- [ ] Crear repositorio público en GitHub y subir los commits de cada tarea.
- [ ] Pegar el enlace del repositorio en el campus.

## Hitos sugeridos

| Fechas | Hito | Evidencia |
|---|---|---|
| 12–16 nov | Base del proyecto y revisión de alcance | `SPEC.md`, estructura y esquema SQL |
| 17–23 nov | Backend, autenticación y permisos | Endpoints y tests de dominio |
| 24–30 nov | Mascotas, servicios y agenda | Flujos API y pruebas funcionales |
| 1–7 dic | Frontend completo y responsive | Pantallas cliente, veterinario y administrador |
| 8–14 dic | Integración y correcciones | Build, pruebas y revisión de reglas |
| 15–21 dic | Despliegue público | URL de Netlify, Render y Neon |
| 22–27 dic | Pruebas integrales y documentación final | Informe de pruebas y README actualizado |
| 28–31 dic | Revisión final y entrega | Repo público y enlace presentado |

## Tareas técnicas sugeridas para commits

Cada elemento de esta lista debe convertirse en un commit pequeño y separado al trabajar sobre GitHub:

1. `chore: crear estructura inicial de PataTurnos`
2. `docs: definir alcance y reglas de negocio`
3. `feat: crear esquema PostgreSQL y servicios iniciales`
4. `feat: implementar autenticación y autorización por roles`
5. `feat: agregar gestión de mascotas`
6. `feat: agregar catálogo de servicios y veterinarios`
7. `feat: implementar consulta de disponibilidad`
8. `feat: implementar reserva y cancelación de turnos`
9. `feat: implementar panel de cliente`
10. `feat: implementar agenda del veterinario`
11. `feat: implementar panel administrativo`
12. `test: cubrir reglas de agenda y ciclo de vida de turnos`
13. `docs: agregar guía de instalación, pruebas y despliegue`
14. `chore: configurar CI y publicación`

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Dos clientes reservan el mismo horario simultáneamente | Transacción y advisory lock por veterinario, además de revalidación en backend. |
| Se filtran credenciales | Variables de entorno, `.gitignore`, secretos del proveedor y revisión antes de cada push. |
| No hay veterinarios cargados | Crear cuentas de prueba y asignar rol `vet` desde PostgreSQL con acceso autorizado. |
| No se consigue publicar antes de la fecha límite | Desplegar primero base y backend, luego frontend; probar cada URL de forma independiente. |
| Las reglas cambian durante la cursada | Actualizar `SPEC.md`, tests y criterios de aceptación en el mismo cambio. |
