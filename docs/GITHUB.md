# Publicar PataTurnos en GitHub

Repositorio de entrega: `https://github.com/agustinbruno07/PataTurnos`  
Rama de destino: `main`.

## Importante sobre la base recibida

El ZIP compartido para trabajar sobre `main` no contenía la carpeta `.git`; incluía el archivo `README.md` y el identificador de la exportación (`9eeea07b49913732e528f2a998977395bb27543f`). Por eso el historial local se generó sobre una copia de ese árbol, sin fingir que se había descargado el historial original. Para conservar el `main` remoto y evitar un push forzado, se generó `PataTurnos-main-commits.patch`, que contiene los commits de tareas posteriores al snapshot.

## Aplicar todos los commits sobre el `main` real

1. Clonar el repositorio desde GitHub (o abrir tu clon existente):

   ```bash
   git clone https://github.com/agustinbruno07/PataTurnos.git
   cd PataTurnos
   git checkout main
   git pull --ff-only origin main
   ```

2. Comprobar que la rama sigue basada en el snapshot recibido:

   ```bash
   git rev-parse HEAD
   ```

   El ZIP entregado corresponde a `9eeea07b49913732e528f2a998977395bb27543f`. Si el resultado es otro hash, revisar los cambios remotos antes de aplicar los parches.

3. Copiar `PataTurnos-main-commits.patch` a la carpeta del repositorio y aplicar los commits:

   ```bash
   git am PataTurnos-main-commits.patch
   ```

4. Verificar el historial y publicar:

   ```bash
   git log --oneline -20
   npm test
   npm run build
   git status
   git push origin main
   ```

Si `git am` informa conflictos, no ejecutar `git am --abort` automáticamente: revisar los archivos indicados y conservar los cambios del `main` remoto que sean necesarios. No usar `git push --force`.

## Convención de commits

Se creó un commit por cada tarea funcional: estructura, documentación funcional, base de datos, autenticación, mascotas, servicios, disponibilidad, reservas, panel de cliente, panel veterinario, administración, tests, CI/despliegue y guías.

## Seguridad antes del push

No subir `.env`, `backend/.env`, `frontend/.env.local`, volcados con datos reales, cadenas de conexión ni credenciales. Los archivos de entorno locales están excluidos por `.gitignore`.
