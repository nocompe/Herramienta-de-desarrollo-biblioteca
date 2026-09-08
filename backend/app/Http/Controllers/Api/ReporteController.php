<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Libro;
use App\Models\Prestamo;
use App\Models\Socio;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * MODULO 4 - Reportes y Dashboard
 * Consultas agregadas que alimentan el tablero de indicadores.
 */
class ReporteController extends Controller
{
    /**
     * Indicadores generales mostrados en las tarjetas del dashboard.
     */
    public function indicadores(): JsonResponse
    {
        return response()->json([
            'datos' => [
                'titulos_registrados' => Libro::count(),
                'ejemplares_totales' => (int) Libro::sum('ejemplares_totales'),
                'ejemplares_disponibles' => (int) Libro::sum('ejemplares_disponibles'),
                'socios_activos' => Socio::where('estado', 'activo')->count(),
                'socios_suspendidos' => Socio::where('estado', 'suspendido')->count(),
                'prestamos_activos' => Prestamo::activos()->count(),
                'prestamos_vencidos' => Prestamo::vencidos()->count(),
                'devoluciones_del_mes' => Prestamo::where('estado', 'devuelto')
                    ->whereMonth('fecha_devolucion_real', now()->month)
                    ->whereYear('fecha_devolucion_real', now()->year)
                    ->count(),
            ],
        ]);
    }

    /**
     * Ranking de los libros con mayor cantidad de prestamos historicos.
     */
    public function librosMasPrestados(): JsonResponse
    {
        $ranking = Prestamo::select('libro_id', DB::raw('COUNT(*) as total_prestamos'))
            ->with('libro:id,titulo,autor,categoria')
            ->groupBy('libro_id')
            ->orderByDesc('total_prestamos')
            ->limit(5)
            ->get()
            ->map(fn ($fila) => [
                'titulo' => $fila->libro?->titulo ?? 'Sin registro',
                'autor' => $fila->libro?->autor ?? '-',
                'categoria' => $fila->libro?->categoria ?? '-',
                'total_prestamos' => (int) $fila->total_prestamos,
            ]);

        return response()->json(['datos' => $ranking]);
    }

    /**
     * Prestamos activos cuya fecha pactada de devolucion ya vencio.
     */
    public function prestamosVencidos(): JsonResponse
    {
        $vencidos = Prestamo::vencidos()
            ->with(['libro:id,titulo', 'socio:id,nombres,apellidos,correo'])
            ->orderBy('fecha_devolucion_esperada')
            ->get()
            ->map(fn ($prestamo) => [
                'id' => $prestamo->id,
                'libro' => $prestamo->libro?->titulo,
                'socio' => $prestamo->socio?->nombre_completo,
                'correo' => $prestamo->socio?->correo,
                'fecha_devolucion_esperada' => $prestamo->fecha_devolucion_esperada?->toDateString(),
                'dias_vencido' => $prestamo->fecha_devolucion_esperada?->diffInDays(now()->startOfDay()),
            ]);

        return response()->json(['datos' => $vencidos]);
    }
}
