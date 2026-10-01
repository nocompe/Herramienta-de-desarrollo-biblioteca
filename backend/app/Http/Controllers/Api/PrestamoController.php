<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Libro;
use App\Models\Prestamo;
use App\Models\Socio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * MODULO 3 - Prestamos y Devoluciones
 *
 * Reglas de negocio implementadas:
 *  1. Solo un socio con estado "activo" puede pedir prestado.
 *  2. El socio no puede superar el limite de prestamos de su tipo.
 *  3. El libro debe tener al menos un ejemplar disponible.
 *  4. Un socio no puede tener dos prestamos activos del mismo libro.
 */
class PrestamoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $consulta = Prestamo::with(['libro:id,titulo,isbn', 'socio:id,nombres,apellidos,dni']);

        if ($estado = $request->query('estado')) {
            $consulta->where('estado', $estado);
        }

        if ($request->boolean('solo_vencidos')) {
            $consulta->vencidos();
        }

        return response()->json([
            'datos' => $consulta->orderByDesc('fecha_prestamo')->orderByDesc('id')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'libro_id' => ['required', 'exists:libros,id'],
            'socio_id' => ['required', 'exists:socios,id'],
            'dias_plazo' => ['nullable', 'integer', 'min:1', 'max:30'],
            'observaciones' => ['nullable', 'string', 'max:255'],
        ]);

        $socio = Socio::findOrFail($datos['socio_id']);
        $libro = Libro::findOrFail($datos['libro_id']);

        if (! $socio->estaActivo()) {
            return response()->json([
                'mensaje' => 'El socio se encuentra suspendido y no puede solicitar prestamos.',
            ], 422);
        }

        $activos = Prestamo::activos()->where('socio_id', $socio->id)->count();
        if ($activos >= $socio->limitePrestamos()) {
            return response()->json([
                'mensaje' => "El socio ya alcanzo su limite de {$socio->limitePrestamos()} prestamos simultaneos.",
            ], 422);
        }

        $repetido = Prestamo::activos()
            ->where('socio_id', $socio->id)
            ->where('libro_id', $libro->id)
            ->exists();
        if ($repetido) {
            return response()->json([
                'mensaje' => 'El socio ya tiene un prestamo activo de este mismo libro.',
            ], 422);
        }

        if (! $libro->hayDisponibilidad()) {
            return response()->json([
                'mensaje' => 'No quedan ejemplares disponibles de este libro.',
            ], 422);
        }

        $plazo = $datos['dias_plazo'] ?? Prestamo::DIAS_PLAZO;

        $prestamo = DB::transaction(function () use ($libro, $socio, $plazo, $datos) {
            $libro->decrement('ejemplares_disponibles');

            return Prestamo::create([
                'libro_id' => $libro->id,
                'socio_id' => $socio->id,
                'fecha_prestamo' => now()->toDateString(),
                'fecha_devolucion_esperada' => now()->addDays($plazo)->toDateString(),
                'estado' => 'activo',
                'observaciones' => $datos['observaciones'] ?? null,
            ]);
        });

        return response()->json([
            'mensaje' => 'Prestamo registrado correctamente.',
            'datos' => $prestamo->load(['libro:id,titulo,isbn', 'socio:id,nombres,apellidos,dni']),
        ], 201);
    }

    /**
     * Registra la devolucion: libera el ejemplar y calcula los dias de retraso.
     */
    public function registrarDevolucion(Prestamo $prestamo): JsonResponse
    {
        if ($prestamo->estado === 'devuelto') {
            return response()->json([
                'mensaje' => 'Este prestamo ya fue devuelto anteriormente.',
            ], 409);
        }

        $prestamoActualizado = DB::transaction(function () use ($prestamo) {
            $hoy = now()->startOfDay();
            $retraso = $hoy->isAfter($prestamo->fecha_devolucion_esperada)
                ? $prestamo->fecha_devolucion_esperada->diffInDays($hoy)
                : 0;

            $prestamo->update([
                'fecha_devolucion_real' => $hoy->toDateString(),
                'estado' => 'devuelto',
                'dias_retraso' => $retraso,
            ]);

            $prestamo->libro()->increment('ejemplares_disponibles');

            return $prestamo->fresh();
        });

        $mensaje = $prestamoActualizado->dias_retraso > 0
            ? "Devolucion registrada con {$prestamoActualizado->dias_retraso} dia(s) de retraso."
            : 'Devolucion registrada dentro del plazo.';

        return response()->json([
            'mensaje' => $mensaje,
            'datos' => $prestamoActualizado->load(['libro:id,titulo,isbn', 'socio:id,nombres,apellidos,dni']),
        ]);
    }
}
