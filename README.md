# PataTurnos

**Sistema web de gestión de turnos para clínicas veterinarias.** Proyecto integrador independiente para Generación T.

PataTurnos permite que los clientes creen una cuenta, registren mascotas y soliciten turnos; que los veterinarios consulten su agenda y administren la atención; y que la administración supervise usuarios, servicios y actividad.

## Estado del proyecto

- Aplicación frontend React + Vite.
- API REST Node.js + Express.
- Persistencia PostgreSQL.
- Autenticación JWT y autorización por roles (`client`, `vet`, `admin`).
- Reglas de negocio documentadas en [`SPEC.md`](./SPEC.md).
- Instrucciones para agentes en [`AGENTS.md`](./AGENTS.md).
- Plan, arquitectura, modelo de datos, API, pruebas y despliegue documentados en [`docs/`](./docs/).
- El despliegue público todavía requiere crear/configurar las cuentas y variables de entorno del propietario del repositorio.

## Requisitos

- Node.js 22 o superior.
- npm 10 o superior.
- Docker Desktop o Docker Engine con Docker Compose, o una instancia PostgreSQL 15+.

## Ejecutar localmente

1. Clonar el repositorio y entrar en su carpeta.
2. Crear el archivo de entorno del backend (PowerShell: `Copy-Item .env.example backend/.env`; Git Bash/Linux/macOS: `cp .env.example backend/.env`):

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

6. Abrir [http://localhost:5173](http://localhost:5173). La API responde en [http://localhost:4000/health](http://localhost:4000/health).

Para apuntar el frontend a otra API, crear `frontend/.env.local` con:

```env
VITE_API_URL=http://localhost:4000/api
```

### Inicializar o actualizar el esquema manualmente

El backend aplica el esquema SQL idempotente y los servicios de ejemplo al iniciar. También se puede ejecutar:

```bash
npm run migrate --workspace backend
```

### Crear cuentas de prueba

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
├── SPEC.md                 # Reglas de negocio y criterios de aceptación
├── AGENTS.md               # Reglas para agentes de desarrollo
└── docker-compose.yml
```

## Documentación de entrega

- [`SPEC.md`](./SPEC.md): alcance, actores, flujos, reglas numeradas y criterios de aceptación.
- [`AGENTS.md`](./AGENTS.md): instrucciones para agentes y desarrolladores.
- [`PLAN.md`](./PLAN.md): tareas y estado.
- [`TEST-REPORT.md`](./TEST-REPORT.md): informe de pruebas.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): arquitectura y decisiones técnicas.
- [`docs/DATABASE.md`](./docs/DATABASE.md): modelo de datos.
- [`docs/API.md`](./docs/API.md): contrato de endpoints.
- [`docs/DEPLOY.md`](./docs/DEPLOY.md): publicación en Render, Neon y Netlify.
- [`docs/SECURITY.md`](./docs/SECURITY.md): consideraciones de seguridad.
- [`docs/CHECKLIST-ENTREGA.md`](./docs/CHECKLIST-ENTREGA.md): correspondencia con la consigna.
- [`docs/GITHUB.md`](./docs/GITHUB.md): creación del repo público y push.

## Licencia

Proyecto académico. Se puede reutilizar y modificar para la entrega educativa.
