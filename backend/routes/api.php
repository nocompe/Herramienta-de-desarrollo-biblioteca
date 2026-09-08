<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de la API - BiblioTech UTP
|--------------------------------------------------------------------------
| Acuerdo del equipo: cada integrante escribe UNICAMENTE dentro de la zona
| marcada con el nombre de su modulo. Asi se reduce la probabilidad de
| conflictos de fusion al integrar las ramas feature/* en develop.
*/

Route::get('/ping', function () {
    return response()->json([
        'ok' => true,
        'sistema' => 'BiblioTech UTP',
        'version' => '1.0.0',
    ]);
});

// --- ZONA MODULO 1: CATALOGO DE LIBROS (feature/catalogo-libros) ---

// --- ZONA MODULO 2: GESTION DE SOCIOS (feature/gestion-socios) ---

// --- ZONA MODULO 3: PRESTAMOS Y DEVOLUCIONES (feature/prestamos) ---

// --- ZONA MODULO 4: REPORTES Y DASHBOARD (feature/reportes-dashboard) ---
