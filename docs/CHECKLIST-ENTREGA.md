# Checklist de la consigna — PataTurnos

| Requisito | Archivo o evidencia | Estado |
|---|---|---|
| Proyecto propio (no ReservaClub) | `SPEC.md`, README | Preparado |
| Reglas de negocio numeradas | `SPEC.md`, sección 5 (`RN-01` a `RN-24`) | Completo en documentación |
| Instrucciones para agentes | `AGENTS.md` | Completo |
| Tareas marcadas | `PLAN.md` | Actualizado; despliegue y entrega externa pendientes |
| Frontend con pantallas de uso | `frontend/src/pages/` | Implementado; falta ejecutar build de producción |
| Backend | `backend/src/` | Implementado; falta validación integral con PostgreSQL de producción |
| Base de datos | `backend/src/db/schema.sql`, `seed.sql` | Esquema y datos iniciales incluidos |
| Tests automatizados | `backend/test/appointments.test.js` | 9 de 9 pruebas unitarias aprobadas |
| Informe de pruebas | `TEST-REPORT.md` | Incluido; pruebas manuales y producción pendientes |
| Un commit por tarea | `PLAN.md`, `docs/GITHUB.md` | Secuencia sugerida; crear commits al trabajar en el repo propio |
| Sin secretos en Git | `.gitignore`, `.env.example` | Preparado; revisar antes de cada push |
| README | `README.md` | Completo |
| Repositorio público | Crear desde GitHub siguiendo `docs/GITHUB.md` | Pendiente de cuenta/acción del propietario |
| Backend y DB publicados | `docs/DEPLOY.md`, `render.yaml` | Configuración incluida; despliegue pendiente |
| Frontend publicado | `netlify.toml`, `docs/DEPLOY.md` | Configuración incluida; despliegue pendiente |
| URL pública probada | `TEST-REPORT.md`, sección 4 | Pendiente de despliegue real |

## Observación importante

El código y la documentación se entregan como un paquete inicial completo. El ZIP no puede contener tus credenciales ni crear por sí solo recursos en tus cuentas de GitHub, Render, Netlify o Neon. La parte de publicación se completa al crear esos recursos, cargar las variables y ejecutar las pruebas de humo descritas en `docs/DEPLOY.md`.
