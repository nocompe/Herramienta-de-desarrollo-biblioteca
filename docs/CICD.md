# Integración y entrega continua (CI/CD)

BiblioTech UTP usa **GitHub Actions** para las dos cosas. Elegimos GitHub Actions porque el código ya está en GitHub: no hace falta instalar ni mantener un servidor (como en Jenkins) y los workflows viven versionados dentro del repositorio, en `.github/workflows/`.

## 1. Flujo completo

```
 push / PR                    push a main                    tag vX.Y.Z
     │                             │                              │
     ▼                             ▼                              ▼
┌─────────┐   ┌──────────┐   ┌──────────────┐              ┌──────────────┐
│ Pruebas │──▶│  Build   │──▶│   Staging    │              │  Producción  │
│  (CI)   │   │ frontend │   │ GitHub Pages │              │ GitHub       │
│ PHPUnit │   │ + imagen │   │ + imagen     │              │ Release      │
│ lint    │   │  Docker  │   │  :staging    │              │ + imagen     │
│ build   │   │          │   │              │              │  :X.Y.Z      │
└─────────┘   └──────────┘   └──────────────┘              │  :latest     │
                                                           └──────────────┘
```

## 2. CI — `.github/workflows/ci.yml`

Corre en cada **push** y **pull request** hacia `develop` y `main`. El pipeline de CD también lo reutiliza como su primera etapa (`workflow_call`).

| Job | Pasos |
|---|---|
| **Backend (Laravel)** | PHP 8.2 · `composer install` · `.env` de pruebas · `php artisan test` (SQLite en memoria) |
| **Frontend (React + Vite)** | Node 22 · `npm ci` · `npm run lint` · `npm run build` |

Si un job falla, el PR muestra la **X roja** y no se aprueba. Las pruebas están en `backend/tests/Feature/` y cubren los cuatro módulos, incluidas las cuatro reglas de negocio de préstamos.

## 3. CD — `.github/workflows/cd.yml`

| Evento | Etapas que corren | Resultado |
|---|---|---|
| **Pull request** a `develop`/`main` | Pruebas → Build | Ensayo: comprueba que el frontend compila y que la imagen Docker se construye. **No publica nada.** |
| **Push a `main`** (staging) | Pruebas → Build → Staging | Imagen `ghcr.io/nocompe/bibliotech-backend:staging` y frontend publicado en **GitHub Pages**. |
| **Tag `vX.Y.Z`** (producción) | Pruebas → Build → Producción | Imagen `:X.Y.Z` y `:latest`, y un **GitHub Release** con las notas del `CHANGELOG.md` y el frontend compilado en `.zip`. |

### Artefactos que produce

- **Frontend:** carpeta `dist/` compilada con Vite. Se guarda como artefacto del workflow y se publica en GitHub Pages: <https://nocompe.github.io/Herramienta-de-desarrollo-biblioteca/>.
- **Backend:** imagen Docker construida desde `backend/Dockerfile`. Al arrancar genera la clave de la app, crea la base SQLite con los datos de ejemplo y levanta la API en el puerto 8000:

  ```bash
  docker run -p 8000:8000 ghcr.io/nocompe/bibliotech-backend:latest
  ```

### Configuración

| Dónde | Nombre | Para qué |
|---|---|---|
| *Settings → Pages* | Source: **GitHub Actions** | Permite que el job de staging publique el frontend. |
| *Settings → Secrets and variables → Variables* | `API_URL` (opcional) | URL pública de la API para el frontend publicado. Si no existe, el frontend usa `http://127.0.0.1:8000/api` (la API corriendo en la máquina que hace la demo). |
| *Settings → Environments* | `github-pages`, `production` | Los crea GitHub la primera vez. En `production` se puede exigir aprobación manual antes de publicar. |

## 4. Cómo publicar una versión

1. Crear la rama `release/vX.Y.Z` desde `develop`, actualizar `CHANGELOG.md` y la versión.
2. Abrir el PR `release/vX.Y.Z → main`; esperar el CI en verde y la aprobación de un compañero.
3. Fusionar: el pipeline despliega **staging** automáticamente.
4. Etiquetar en `main` y subir el tag:

   ```bash
   git switch main && git pull
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin vX.Y.Z
   ```

   El pipeline publica la imagen de **producción** y crea el **GitHub Release** sin más pasos manuales.
5. Llevar `main` de vuelta a `develop`.

## 5. Reversión

Si una versión falla en producción, se vuelve a la anterior sin recompilar:

```bash
docker run -p 8000:8000 ghcr.io/nocompe/bibliotech-backend:<version-anterior>
```

y se corrige con una rama `hotfix/*` desde `main`, que termina en una nueva versión de parche (`vX.Y.Z+1`).
