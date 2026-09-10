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

// --- API LOGIN SIMPLE (MOCK) ---
Route::post('/login', function (\Illuminate\Http\Request $request) {
    if ($request->email === 'admin@bibliotech.com' && $request->password === 'password123') {
        return response()->json([
            'token' => 'fake-jwt-token-12345',
            'user' => [
                'name' => 'Admin BiblioTech',
                'email' => 'admin@bibliotech.com'
            ]
        ]);
    }
    return response()->json(['message' => 'Credenciales inválidas'], 401);
});

// --- ZONA MODULO 1: CATALOGO DE LIBROS (feature/catalogo-libros) ---
Route::apiResource('libros', \App\Http\Controllers\Api\LibroController::class);

// --- ZONA MODULO 2: GESTION DE SOCIOS (feature/gestion-socios) ---
Route::apiResource('socios', \App\Http\Controllers\Api\SocioController::class);
Route::patch('socios/{socio}/estado', [\App\Http\Controllers\Api\SocioController::class, 'cambiarEstado']);

// --- ZONA MODULO 3: PRESTAMOS Y DEVOLUCIONES (feature/prestamos) ---
Route::get('prestamos', [\App\Http\Controllers\Api\PrestamoController::class, 'index']);
Route::post('prestamos', [\App\Http\Controllers\Api\PrestamoController::class, 'store']);
Route::patch('prestamos/{prestamo}/devolucion', [\App\Http\Controllers\Api\PrestamoController::class, 'registrarDevolucion']);

// --- ZONA MODULO 4: REPORTES Y DASHBOARD (feature/reportes-dashboard) ---
Route::get('reportes/indicadores', [\App\Http\Controllers\Api\ReporteController::class, 'indicadores']);
Route::get('reportes/libros-mas-prestados', [\App\Http\Controllers\Api\ReporteController::class, 'librosMasPrestados']);
Route::get('reportes/prestamos-vencidos', [\App\Http\Controllers\Api\ReporteController::class, 'prestamosVencidos']);
