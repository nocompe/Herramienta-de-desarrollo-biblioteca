# Guía para Colaboradores — BiblioTech UTP

Esta guía describe cómo trabajar en el repositorio. Todo integrante debe
seguirla antes de subir cambios.

---

## 1. Requisitos previos

| Herramienta | Versión mínima | Verificar con |
|-------------|----------------|---------------|
| Git | 2.40 | `git --version` |
| PHP | 8.2 | `php --version` |
| Composer | 2.6 | `composer --version` |
| Node.js | 20 | `node --version` |
| npm | 10 | `npm --version` |

En Windows se recomienda instalar **XAMPP** (incluye PHP) y **Node.js LTS**.

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/nocompe/Herramienta-de-desarrollo-biblioteca.git
cd Herramienta-de-desarrollo-biblioteca
```

Configura tu identidad **una sola vez** por equipo:

```bash
git config user.name "Nombre Apellido"
git config user.email "correo@utp.edu.pe"
```

---

## 3. Instalar y ejecutar el proyecto

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

La API queda disponible en `http://127.0.0.1:8000/api`.
Prueba rápida: `http://127.0.0.1:8000/api/ping`.

### Frontend (React + Vite)

En **otra terminal**:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

---

## 4. Flujo de trabajo con ramas

El repositorio usa una variante simplificada de **Git Flow**:

| Rama | Propósito | Se crea desde | Se fusiona en |
|------|-----------|---------------|---------------|
| `main` | Código estable y publicado. Solo recibe releases. | — | — |
| `develop` | Integración de todo el trabajo del equipo. | `main` | `main` |
| `feature/<nombre>` | Una funcionalidad nueva por integrante. | `develop` | `develop` |
| `hotfix/<nombre>` | Corrección urgente sobre lo ya publicado. | `main` | `main` y `develop` |

**Nunca se hace commit directo sobre `main` ni sobre `develop`.**

### Crear tu rama de trabajo

```bash
git checkout develop
git pull origin develop
git checkout -b feature/mi-funcionalidad
```

### Convención de nombres de ramas

- `feature/catalogo-libros` — módulo de catálogo
- `feature/gestion-socios` — módulo de socios
- `feature/prestamos` — módulo de préstamos y devoluciones
- `feature/reportes-dashboard` — módulo de reportes
- `hotfix/validacion-isbn` — corrección puntual sobre `main`

Usa siempre minúsculas y guiones. Nada de espacios ni tildes.

---

## 5. Commits

Se usa la convención **Conventional Commits**:

```
<tipo>(<alcance>): <descripción en imperativo, sin punto final>
```

| Tipo | Cuándo usarlo |
|------|---------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un error |
| `docs` | Solo documentación |
| `style` | Formato o estilos, sin cambiar lógica |
| `refactor` | Reestructurar código sin cambiar comportamiento |
| `test` | Agregar o corregir pruebas |
| `chore` | Configuración, dependencias, tareas de mantenimiento |

Ejemplos usados en este proyecto:

```
feat(libros): implementar LibroController con CRUD completo
fix(prestamos): impedir prestamo cuando el socio esta suspendido
docs(readme): documentar instalacion del backend y frontend
```

**Reglas:**

1. Un commit = un cambio con sentido propio. No mezclar módulos.
2. Hacer commit al terminar cada funcionalidad, no al final del día.
3. Revisar siempre con `git status` y `git diff` antes de `git add`.
4. La descripción va en imperativo: "agregar", no "agregado" ni "agregué".

```bash
git status
git diff
git add backend/app/Http/Controllers/Api/LibroController.php
git commit -m "feat(libros): implementar LibroController con CRUD completo"
```

---

## 6. Subir cambios e integrar

```bash
# 1. Publicar tu rama
git push -u origin feature/mi-funcionalidad

# 2. Antes de integrar, traer lo último de develop
git checkout develop
git pull origin develop
git checkout feature/mi-funcionalidad
git merge develop        # resuelve aquí cualquier conflicto

# 3. Integrar en develop
git checkout develop
git merge --no-ff feature/mi-funcionalidad
git push origin develop

# 4. Borrar la rama ya integrada
git branch -d feature/mi-funcionalidad
git push origin --delete feature/mi-funcionalidad
```

Se usa `--no-ff` para que el historial conserve visible el momento en que se
integró cada módulo.

---

## 7. Zonas de trabajo (acuerdo del equipo)

Los archivos compartidos (`backend/routes/api.php`, `frontend/src/App.jsx`,
`backend/database/seeders/DatabaseSeeder.php`) tienen **zonas comentadas por
módulo**. Cada integrante escribe únicamente dentro de su zona:

```php
// --- ZONA MODULO 1: CATALOGO DE LIBROS (feature/catalogo-libros) ---
```

Esto reduce drásticamente los conflictos de fusión, porque dos personas ya no
editan las mismas líneas del mismo archivo.

---

## 8. Resolver un conflicto de fusión

```bash
git merge feature/otra-rama
# CONFLICT (content): Merge conflict in frontend/src/components/Navbar.jsx

git status                       # ver qué archivos están en conflicto
code frontend/src/components/Navbar.jsx
```

En el archivo aparecerán los marcadores:

```
<<<<<<< HEAD
   (versión de la rama actual)
=======
   (versión de la rama que se está fusionando)
>>>>>>> feature/otra-rama
```

1. Editar el archivo y dejar la versión correcta (normalmente **combinando**
   ambos aportes, no eligiendo uno).
2. Borrar por completo las líneas `<<<<<<<`, `=======` y `>>>>>>>`.
3. Marcar el archivo como resuelto y cerrar la fusión:

```bash
git add frontend/src/components/Navbar.jsx
git commit                       # confirma el merge commit
```

Para abortar y volver al estado anterior: `git merge --abort`.

---

## 9. Releases

Cuando `develop` está estable se integra en `main` y se etiqueta:

```bash
git checkout main
git merge --no-ff develop
git tag -a v1.0.0 -m "Release v1.0.0 - Avance 1"
git push origin main --tags
```
