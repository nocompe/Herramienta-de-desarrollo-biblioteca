# Changelog

Todos los cambios relevantes de BiblioTech UTP. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las versiones siguen [Versionado Semántico](https://semver.org/lang/es/).

## [1.1.0] - 2026-11-17

### Añadido
- Pipeline de entrega continua: imagen Docker del backend en GHCR, frontend en GitHub Pages y GitHub Releases por tag (#25, #26).
- Integración continua con GitHub Actions: pruebas del backend, lint y build del frontend en cada PR (#15, #19).
- Carnet digital del socio, historial de préstamos, exportación a CSV y vista tabla/tarjetas (#17, #21).
- Catálogo de libros en tarjetas con portada y estado de disponibilidad (#5, #6).
- Filtro por categoría y mejoras de navegación en el frontend (#7).
- Búsqueda de libros con espera para no lanzar una petición por tecla (#6).
- Exportación de informes de préstamo en PDF (#2).
- Filtros por rango de fechas en el dashboard (#4).
- Rediseño de la interfaz de socios con modal de registro, filtros y tarjetas KPI.
- Contador de resultados en las búsquedas de socios y préstamos.
- Pantalla de inicio de sesión y rediseño visual del dashboard.

### Corregido
- La tasa de devolución del dashboard salía 0% aunque hubiera devoluciones (#23, #24).
- Desbordamiento horizontal en pantallas de 320 px y diseño responsive en todas las páginas.

## [1.0.1] - 2026-09-08

### Corregido
- Las rutas `/api/*` devolvían HTML en los errores de validación; ahora siempre responden JSON (#14).

## [1.0.0] - 2026-09-08

### Añadido
- Módulo 1: catálogo de libros (#8).
- Módulo 2: gestión de socios (#9).
- Módulo 3: préstamos y devoluciones (#10).
- Módulo 4: reportes y dashboard (#11).

[1.1.0]: https://github.com/nocompe/Herramienta-de-desarrollo-biblioteca/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/nocompe/Herramienta-de-desarrollo-biblioteca/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/nocompe/Herramienta-de-desarrollo-biblioteca/releases/tag/v1.0.0
