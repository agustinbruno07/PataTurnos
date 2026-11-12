# Informe de pruebas — PataTurnos

**Versión del informe:** 1.1  
**Fecha:** 12/11/2026

## 1. Alcance

Este informe separa las pruebas ejecutadas en este entorno de las pruebas de integración y producción que todavía dependen de servicios externos y credenciales.

## 2. Pruebas automatizadas ejecutadas

Entorno: Node.js `v22.16.0`, npm `10.9.2`.

Comando ejecutado desde la raíz del proyecto:

```bash
npm test
```

**Resultado: 9 aprobadas · 0 fallidas.**

| ID | Caso | Resultado |
|---|---|---|
| T-01 | Reserva con menos de 2 horas de anticipación | Aprobado. |
| T-02 | Reserva un domingo | Aprobado. |
| T-03 | Reserva fuera del horario de atención | Aprobado. |
| T-04 | Reserva válida de 60 minutos y cálculo de fin | Aprobado. |
| T-05 | Detección de solapamientos y aceptación de intervalos contiguos | Aprobado. |
| T-06 | Exclusión de horarios ocupados de la disponibilidad | Aprobado. |
| T-07 | Cancelación con plazo mínimo | Aprobado. |
| T-08 | Transiciones de estado y finalización después del horario | Aprobado. |
| T-09 | Rechazo de horarios con segundos fuera de :00 o :30 | Aprobado. |

## 3. Verificaciones estáticas ejecutadas

- `node --check` sobre todos los archivos JavaScript del backend: sin errores.
- Transpilación sintáctica de los 13 archivos JavaScript/JSX del frontend con TypeScript `transpileModule`: 0 errores sintácticos.
- Revisión del `.gitignore` y búsqueda de archivos `.env` reales antes de crear commits: no se encontraron archivos de entorno con secretos.

## 4. Compilación de producción

Se intentó ejecutar `npm install --ignore-scripts --no-audit --no-fund` desde la raíz. La operación agotó el tiempo de espera de 120 segundos al intentar acceder al registro de npm. Por eso no fue posible instalar Vite/React y **el comando `npm run build` queda pendiente de ejecución en una conexión con acceso al registro de npm**.

No se declara aprobado el build sin haberlo ejecutado.

## 5. Pruebas funcionales manuales pendientes

| ID | Prueba | Resultado esperado | Estado |
|---|---|---|---|
| M-01 | Registro de cliente con correo nuevo | Cuenta creada con rol `client`. | Pendiente |
| M-02 | Registro con correo duplicado | Conflicto controlado. | Pendiente |
| M-03 | Login con contraseña incorrecta | `401` sin revelar si existe el correo. | Pendiente |
| M-04 | Alta y edición de mascota propia | Cambios persistidos. | Pendiente |
| M-05 | Acceso a mascota ajena | Rechazado. | Pendiente |
| M-06 | Cliente consulta disponibilidad | Horarios según reglas de negocio. | Pendiente |
| M-07 | Dos usuarios reservan el mismo horario | Solo una reserva queda creada. | Pendiente |
| M-08 | Cancelación fuera del plazo | Rechazada. | Pendiente |
| M-09 | Veterinario confirma un turno asignado | Estado `confirmed`. | Pendiente |
| M-10 | Veterinario modifica un turno ajeno | Rechazado. | Pendiente |
| M-11 | Cliente intenta usar administración | `403`. | Pendiente |
| M-12 | Despliegue en Netlify, Render y Neon | Sitio y API accesibles desde internet. | Pendiente |

## 6. Conclusión

Las nueve pruebas automatizadas del dominio de agenda pasan. Las verificaciones sintácticas de backend y frontend también pasan. La instalación completa de dependencias, la compilación de producción, la integración con PostgreSQL, las pruebas manuales de permisos y los tests de humo del despliegue siguen pendientes. No se declaran aprobadas pruebas que no se hayan ejecutado.
