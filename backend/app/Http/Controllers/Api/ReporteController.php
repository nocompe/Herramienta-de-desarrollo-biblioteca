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
     * Soporta filtrado por rango de fechas mediante parámetros ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
     */
    public function indicadores(): JsonResponse
    {
        $desde = request('desde') ? \Carbon\Carbon::parse(request('desde')) : null;
        $hasta = request('hasta') ? \Carbon\Carbon::parse(request('hasta')) : null;

        // Base query para préstamos
        $prestamosQuery = Prestamo::query();
        $devolucionesQuery = Prestamo::where('estado', 'devuelto');

        if ($desde && $hasta) {
            $prestamosQuery->whereBetween('fecha_prestamo', [$desde, $hasta]);
            $devolucionesQuery->whereBetween('fecha_devolucion_real', [$desde, $hasta]);
        }

        return response()->json([
            'rango' => $desde && $hasta ? [
                'desde' => $desde->toDateString(),
                'hasta' => $hasta->toDateString(),
            ] : 'Todo el tiempo',
            'datos' => [
                'titulos_registrados' => Libro::count(),
                'ejemplares_totales' => (int) Libro::sum('ejemplares_totales'),
                'ejemplares_disponibles' => (int) Libro::sum('ejemplares_disponibles'),
                'socios_activos' => Socio::where('estado', 'activo')->count(),
                'socios_suspendidos' => Socio::where('estado', 'suspendido')->count(),
                'prestamos_activos' => $prestamosQuery->activos()->count(),
                'prestamos_vencidos' => $prestamosQuery->vencidos()->count(),
                'devoluciones_periodo' => $devolucionesQuery->count(),
                'tasa_devolucion' => $prestamosQuery->count() > 0
                    ? round(($devolucionesQuery->count() / $prestamosQuery->count() * 100), 2) . '%'
                    : '0%',
            ],
        ]);
    }

    /**
     * Ranking de los libros con mayor cantidad de prestamos historicos.
     * Filtrable por rango de fechas: ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
     */
    public function librosMasPrestados(): JsonResponse
    {
        $desde = request('desde') ? \Carbon\Carbon::parse(request('desde')) : null;
        $hasta = request('hasta') ? \Carbon\Carbon::parse(request('hasta')) : null;

        $query = Prestamo::select('libro_id', DB::raw('COUNT(*) as total_prestamos'))
            ->with('libro:id,titulo,autor,categoria')
            ->groupBy('libro_id')
            ->orderByDesc('total_prestamos');

        if ($desde && $hasta) {
            $query->whereBetween('fecha_prestamo', [$desde, $hasta]);
        }

        $ranking = $query->limit(5)
            ->get()
            ->map(fn ($fila) => [
                'titulo' => $fila->libro?->titulo ?? 'Sin registro',
                'autor' => $fila->libro?->autor ?? '-',
                'categoria' => $fila->libro?->categoria ?? '-',
                'total_prestamos' => (int) $fila->total_prestamos,
            ]);

        return response()->json([
            'rango' => $desde && $hasta ? [
                'desde' => $desde->toDateString(),
                'hasta' => $hasta->toDateString(),
            ] : 'Todo el tiempo',
            'datos' => $ranking,
        ]);
    }

    /**
     * Prestamos activos cuya fecha pactada de devolucion ya vencio.
     * Filtrable por rango de fechas: ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
     */
    public function prestamosVencidos(): JsonResponse
    {
        $desde = request('desde') ? \Carbon\Carbon::parse(request('desde')) : null;
        $hasta = request('hasta') ? \Carbon\Carbon::parse(request('hasta')) : null;

        $query = Prestamo::vencidos()
            ->with(['libro:id,titulo', 'socio:id,nombres,apellidos,correo']);

        if ($desde && $hasta) {
            $query->whereBetween('fecha_devolucion_esperada', [$desde, $hasta]);
        }

        $vencidos = $query->orderBy('fecha_devolucion_esperada')
            ->get()
            ->map(fn ($prestamo) => [
                'id' => $prestamo->id,
                'libro' => $prestamo->libro?->titulo,
                'socio' => $prestamo->socio?->nombre_completo,
                'correo' => $prestamo->socio?->correo,
                'fecha_devolucion_esperada' => $prestamo->fecha_devolucion_esperada?->toDateString(),
                'dias_vencido' => $prestamo->fecha_devolucion_esperada?->diffInDays(now()->startOfDay()),
            ]);

        return response()->json([
            'rango' => $desde && $hasta ? [
                'desde' => $desde->toDateString(),
                'hasta' => $hasta->toDateString(),
            ] : 'Activos',
            'datos' => $vencidos,
        ]);
    }
}
