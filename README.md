# PataTurnos

**Sistema web de gestión de turnos para clínicas veterinarias.** Proyecto integrador independiente para Generación T.

PataTurnos permite que los clientes creen una cuenta, registren mascotas y soliciten turnos; que los veterinarios consulten su agenda y administren la atención; y que la administración supervise usuarios, servicios y actividad.

## Aplicación publicada

- **Frontend:** https://pataturnos.netlify.app/
- **Backend (API):** https://pataturnos-api.onrender.com/
- **Estado del backend:** https://pataturnos-api.onrender.com/health
- **Repositorio GitHub:** https://github.com/agustinbruno07/PataTurnos

## Estado del proyecto

- Aplicación frontend React + Vite.
- API REST Node.js + Express.
- Persistencia PostgreSQL.
- Autenticación JWT y autorización por roles (`client`, `vet`, `admin`).
- Reglas de negocio documentadas en [SPEC.md](https://github.com/agustinbruno07/PataTurnos/blob/main/SPEC.md).
- Instrucciones para agentes en [AGENTS.md](https://github.com/agustinbruno07/PataTurnos/blob/main/AGENTS.md).
- Plan, arquitectura, modelo de datos, API, pruebas y despliegue documentados en `docs/`.

## Requisitos

- Node.js 22 o superior.
- npm 10 o superior.
- Docker Desktop o Docker Engine con Docker Compose, o una instancia PostgreSQL 15+.

## Ejecutar localmente

1. Clonar el repositorio y entrar en su carpeta.

   ```bash
   git clone https://github.com/agustinbruno07/PataTurnos.git
   cd PataTurnos
   ```

2. Crear el archivo de entorno del backend:

   PowerShell:
   ```powershell
   Copy-Item .env.example backend/.env
   ```

   Git Bash/Linux/macOS:
   ```bash
   cp .env.example backend/.env
   ```

   Editar `backend/.env`: cambiar `JWT_SECRET` por un secreto aleatorio de al menos 32 caracteres. Para desarrollo local se puede dejar la URL PostgreSQL indicada en el ejemplo.

3. Levantar la base de datos:

   ```bash
   docker compose up -d db
   ```

   El contenedor crea las tablas y los servicios de ejemplo al inicializar el volumen por primera vez.

4. Instalar dependencias desde la raíz:

   ```bash
   npm install
   ```

5. Iniciar frontend y backend:

   ```bash
   npm run dev
   ```

6. Abrir:
   - Frontend: http://localhost:5173
   - API: http://localhost:4000
   - Estado de la API: http://localhost:4000/health

Para apuntar el frontend a otra API, crear `frontend/.env.local` con:

```env
VITE_API_URL=http://localhost:4000/api
```

## Inicializar o actualizar el esquema manualmente

El backend aplica el esquema SQL idempotente y los servicios de ejemplo al iniciar. También se puede ejecutar:

```bash
npm run migrate --workspace backend
```

## Crear cuentas de prueba

1. Registrarse desde `/registro`. El registro público siempre crea usuarios con rol `client`.
2. Para habilitar el panel de veterinario o de administración, una persona autorizada debe cambiar el rol desde PostgreSQL. Ejemplo:

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@tudominio.com';
   UPDATE users SET role = 'vet' WHERE email = 'veterinario@tudominio.com';
   ```

3. Cerrar sesión y volver a ingresar para que el token refleje el rol actualizado.

No hay contraseñas maestras ni usuarios administrativos predeterminados.

## Comandos

| Comando | Función |
|---|---|
| `npm run dev` | Ejecuta API y frontend en modo desarrollo. |
| `npm run build` | Compila el frontend para producción. |
| `npm run verify` | Ejecuta tests y build de producción. |
| `npm test` | Ejecuta las pruebas automatizadas del backend. |
| `npm start` | Inicia el backend. |
| `npm run migrate --workspace backend` | Aplica esquema y datos iniciales. |

## Estructura

```text
pataturnos/
├── backend/
│   ├── src/
│   │   ├── db/             # PostgreSQL, esquema y migración
│   │   ├── domain/         # Reglas puras de turnos
│   │   ├── middleware/     # Autenticación, validación y errores
│   │   ├── routes/         # Endpoints REST
│   │   ├── app.js
│   │   └── server.js
│   └── test/               # Pruebas automatizadas
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── index.html
├── docs/                   # Plan, pruebas, arquitectura y despliegue
├── SPEC.md
├── AGENTS.md
└── docker-compose.yml
```

## Documentación de entrega

Todos los documentos están disponibles directamente desde GitHub:

- [README.md — Información general del proyecto](https://github.com/agustinbruno07/PataTurnos/blob/main/README.md)
- [SPEC.md — Alcance, reglas de negocio y criterios de aceptación](https://github.com/agustinbruno07/PataTurnos/blob/main/SPEC.md)
- [AGENTS.md — Instrucciones para agentes de desarrollo](https://github.com/agustinbruno07/PataTurnos/blob/main/AGENTS.md)
- [PLAN.md — Plan de trabajo y tareas](https://github.com/agustinbruno07/PataTurnos/blob/main/PLAN.md)
- [TEST-REPORT.md — Informe de pruebas](https://github.com/agustinbruno07/PataTurnos/blob/main/TEST-REPORT.md)
- [ARCHITECTURE.md — Arquitectura y decisiones técnicas](https://github.com/agustinbruno07/PataTurnos/blob/main/docs/ARCHITECTURE.md)
- [DATABASE.md — Modelo de datos](https://github.com/agustinbruno07/PataTurnos/blob/main/docs/DATABASE.md)
- [API.md — Documentación de endpoints](https://github.com/agustinbruno07/PataTurnos/blob/main/docs/API.md)
- [DEPLOY.md — Guía de publicación en Render, Neon y Netlify](https://github.com/agustinbruno07/PataTurnos/blob/main/docs/DEPLOY.md)
- [SECURITY.md — Consideraciones de seguridad](https://github.com/agustinbruno07/PataTurnos/blob/main/docs/SECURITY.md)
- [CHECKLIST-ENTREGA.md — Checklist de la consigna](https://github.com/agustinbruno07/PataTurnos/blob/main/docs/CHECKLIST-ENTREGA.md)
- [GITHUB.md — Configuración del repositorio y publicación](https://github.com/agustinbruno07/PataTurnos/blob/main/docs/GITHUB.md)

## Plataformas utilizadas

- [GitHub — Repositorio del proyecto](https://github.com/agustinbruno07/PataTurnos)
- [Netlify — Frontend publicado](https://pataturnos.netlify.app/)
- [Render — Backend publicado](https://pataturnos-api.onrender.com/)
- [Neon — Base de datos PostgreSQL](https://console.neon.tech/)

## Licencia

Proyecto académico. Se puede reutilizar y modificar para la entrega educativa.
