# BiblioTech UTP

Sistema de Gestión de Biblioteca desarrollado como Proyecto Final del curso
**Herramientas de Desarrollo** — Universidad Tecnológica del Perú.

El propósito del repositorio es aplicar un flujo completo de control de versiones
con Git y GitHub sobre una solución de software real: repositorio remoto, ramas
de trabajo, commits descriptivos, fusiones, resolución de conflictos y releases.

**Repositorio remoto:** https://github.com/nocompe/Herramienta-de-desarrollo-biblioteca

---

## Equipo y reparto de módulos

| Integrante | Módulo | Rama de trabajo |
|-----------|--------|-----------------|
| yeffdx | Catálogo de Libros | `feature/catalogo-libros` |
| ChrisA9683 | Gestión de Socios | `feature/gestion-socios` |
| aandrexx | Préstamos y Devoluciones | `feature/prestamos` |
| nocompe | Reportes y Dashboard | `feature/reportes-dashboard` |

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | PHP 8.2 + Laravel 12 (API REST) |
| Frontend | React 19 + Vite 7 + React Router 7 + Axios |
| Base de datos | SQLite (desarrollo) / MySQL 8 (opcional) |
| Control de versiones | Git 2.52 + GitHub |
| Entorno | Visual Studio Code, XAMPP, Node.js 24 |

---

## Estructura del repositorio

```
biblioteca-utp/
├── .gitignore
├── README.md
├── CONTRIBUTING.md              Guía para colaboradores
├── backend/                     API REST (Laravel 12)
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── LibroController.php       Módulo 1
│   │   │   ├── SocioController.php       Módulo 2
│   │   │   ├── PrestamoController.php    Módulo 3
│   │   │   └── ReporteController.php     Módulo 4
│   │   └── Models/
│   │       ├── Libro.php
│   │       ├── Socio.php
│   │       └── Prestamo.php
│   ├── database/
│   │   ├── migrations/          Estructura de las tablas
│   │   └── seeders/             Datos de prueba
│   └── routes/api.php           Rutas de la API por módulo
├── frontend/                    Aplicación React (Vite)
│   └── src/
│       ├── api/client.js        Cliente Axios compartido
│       ├── components/Navbar.jsx
│       ├── pages/
│       │   ├── Inicio.jsx
│       │   ├── Libros.jsx       Módulo 1
│       │   ├── Socios.jsx       Módulo 2
│       │   ├── Prestamos.jsx    Módulo 3
│       │   └── Dashboard.jsx    Módulo 4
│       ├── App.jsx              Rutas de la aplicación
│       └── index.css            Estilos globales
└── docs/
    └── evidencias/              Salidas reales de los comandos Git
```

---

## Módulos del sistema

### 1. Catálogo de Libros
Registro, búsqueda, edición y baja de libros. Controla ejemplares totales y
disponibles, y bloquea la eliminación de un libro con ejemplares prestados.

### 2. Gestión de Socios
Alta y mantenimiento de socios (estudiante, docente, externo), con validación de
DNI y correo únicos y suspensión/reactivación de socios.

### 3. Préstamos y Devoluciones
Registro de préstamos con cuatro reglas de negocio: socio activo, límite de
préstamos según tipo de socio, disponibilidad de ejemplares y no duplicar el
mismo libro. La devolución libera el ejemplar y calcula los días de retraso.

### 4. Reportes y Dashboard
Indicadores generales, ranking de los cinco libros más prestados y listado de
préstamos vencidos.

---

## Endpoints de la API

| Método | Ruta | Descripción | Módulo |
|--------|------|-------------|--------|
| GET | `/api/ping` | Verifica que la API responde | Core |
| GET | `/api/libros` | Lista libros (`?buscar=`, `?categoria=`) | 1 |
| POST | `/api/libros` | Registra un libro | 1 |
| GET | `/api/libros/{id}` | Detalle de un libro | 1 |
| PUT | `/api/libros/{id}` | Actualiza un libro | 1 |
| DELETE | `/api/libros/{id}` | Elimina un libro | 1 |
| GET | `/api/socios` | Lista socios (`?buscar=`, `?estado=`) | 2 |
| POST | `/api/socios` | Registra un socio | 2 |
| PUT | `/api/socios/{id}` | Actualiza un socio | 2 |
| PATCH | `/api/socios/{id}/estado` | Suspende o reactiva un socio | 2 |
| DELETE | `/api/socios/{id}` | Elimina un socio | 2 |
| GET | `/api/prestamos` | Lista préstamos (`?estado=`, `?solo_vencidos=1`) | 3 |
| POST | `/api/prestamos` | Registra un préstamo | 3 |
| PATCH | `/api/prestamos/{id}/devolucion` | Registra la devolución | 3 |
| GET | `/api/reportes/indicadores` | Indicadores del dashboard | 4 |
| GET | `/api/reportes/libros-mas-prestados` | Top 5 de libros | 4 |
| GET | `/api/reportes/prestamos-vencidos` | Préstamos vencidos | 4 |

---

## Instalación y ejecución

### 1. Clonar

```bash
git clone https://github.com/nocompe/Herramienta-de-desarrollo-biblioteca.git
cd Herramienta-de-desarrollo-biblioteca
```

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

> API en `http://127.0.0.1:8000/api` — verifica con `/api/ping`.

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

> Aplicación en `http://localhost:5173`.

### Usar MySQL en lugar de SQLite (opcional)

Crea la base de datos `bibliotech` en phpMyAdmin y edita `backend/.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bibliotech
DB_USERNAME=root
DB_PASSWORD=
```

Luego ejecuta de nuevo `php artisan migrate --seed`.

---

## Flujo de trabajo con Git

El detalle completo (ramas, convención de commits, resolución de conflictos y
releases) está en [CONTRIBUTING.md](CONTRIBUTING.md).

```
main ──────────────────●─────────────────────●  v1.0.0
                        \                   /
develop ──●──────●───────●────●────●───────●
           \    /         \    \    \
            feature/catalogo-libros
                 feature/gestion-socios
                      feature/prestamos
                           feature/reportes-dashboard
```
