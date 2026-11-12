# Repositorio GitHub y publicación de cambios

El repositorio de entrega configurado para este proyecto es:

- `https://github.com/agustinbruno07/PataTurnos`
- Rama de trabajo: `main`

## Publicar los commits locales

El paquete de trabajo contiene un historial de commits separado por tarea y tiene configurado el remoto `origin`. Una vez que el repositorio se haya extraído en la computadora y se hayan revisado las credenciales de GitHub, ejecutar desde la carpeta raíz:

```bash
git remote -v
git status
git log --oneline --decorate -20
git push -u origin main
```

Si Git informa que `origin` no existe, configurarlo con:

```bash
git remote add origin https://github.com/agustinbruno07/PataTurnos.git
```

Si GitHub rechaza el push porque la rama remota contiene commits nuevos, no usar `--force`. Primero ejecutar `git pull --rebase origin main`, resolver los conflictos y luego volver a intentar `git push`.

## Convención

Se creó un commit por tarea, con mensajes Conventional Commits en español. El detalle se encuentra en [`COMMIT-LOG.md`](./COMMIT-LOG.md).

## Antes de cada push

```bash
npm test
npm run build
git status
```

No subir `.env`, `backend/.env`, `frontend/.env.local`, volcados con datos reales, cadenas de conexión ni credenciales. Los archivos de entorno locales están excluidos por `.gitignore`.
