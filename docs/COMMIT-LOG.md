# Historial de commits de PataTurnos

Rama local: `main`  
Remoto configurado: `https://github.com/agustinbruno07/PataTurnos.git`  
Autor configurado: `Agustin Bruno <agustinbruno07@users.noreply.github.com>`

Cada bloque funcional se registró en un commit separado. El ZIP de entrada no tenía `.git`: el commit `627e9dc` es una base local sintética que reproduce el README recibido, no el objeto original de GitHub. El identificador del snapshot del ZIP es `9eeea07b49913732e528f2a998977395bb27543f`.

| Orden | Commit | Tarea |
|---:|---|---|
| 0 | `627e9dc` | Base local que reproduce el README de la exportación; no equivale al commit original de GitHub. |
| 1 | `cd326e4` | Preparar estructura, configuración y entorno del proyecto. |
| 2 | `f48605f` | Definir alcance, reglas de negocio, arquitectura y permisos. |
| 3 | `0163535` | Crear esquema PostgreSQL, datos iniciales y acceso a datos. |
| 4 | `3d40592` | Implementar autenticación, JWT y autorización por roles. |
| 5 | `9c137e2` | Agregar gestión de mascotas. |
| 6 | `eb6a77b` | Agregar catálogo de servicios y directorio de veterinarios. |
| 7 | `34e8009` | Implementar reglas de disponibilidad y cálculo de horarios. |
| 8 | `5c6280f` | Implementar creación, cancelación y ciclo de vida de turnos. |
| 9 | `de1fbaf` | Implementar la interfaz de clientes y el flujo de reservas. |
| 10 | `8539df5` | Implementar agenda del veterinario. |
| 11 | `d4d713b` | Implementar panel de administración. |
| 12 | `78c09a6` | Agregar pruebas automatizadas de reglas de agenda. |
| 13 | `9e2bcbf` | Configurar CI y despliegue en Render y Netlify. |
| 14 | `fe288d7` | Completar README y guías de instalación y publicación. |

El commit `3e9fc8e` agregó este registro; `47a2997` preparó la integración con el `main` remoto; y el commit actual aclara el origen del snapshot y la serie de parches. En total hay 14 commits de tareas, tres commits documentales de cierre y la base local. Los identificadores pueden comprobarse con `git log --oneline --decorate`. Todavía no se ejecutó el `git push` desde este entorno. Para integrarlos sobre el `main` real, aplicar `PataTurnos-main-commits.patch` según [`GITHUB.md`](./GITHUB.md).
