<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Socio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * MODULO 2 - Gestion de Socios
 * Registro, actualizacion, suspension y consulta de socios.
 */
class SocioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $consulta = Socio::query();

        if ($buscar = $request->query('buscar')) {
            $consulta->where(function ($q) use ($buscar) {
                $q->where('nombres', 'like', "%{$buscar}%")
                  ->orWhere('apellidos', 'like', "%{$buscar}%")
                  ->orWhere('dni', 'like', "%{$buscar}%")
                  ->orWhere('correo', 'like', "%{$buscar}%");
            });
        }

        if ($estado = $request->query('estado')) {
            $consulta->where('estado', $estado);
        }

        return response()->json([
            'datos' => $consulta->orderBy('apellidos')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombres' => ['required', 'string', 'max:255'],
            'apellidos' => ['required', 'string', 'max:255'],
            'dni' => ['required', 'digits:8', 'unique:socios,dni'],
            'correo' => ['required', 'email', 'max:255', 'unique:socios,correo'],
            'telefono' => ['nullable', 'string', 'max:15'],
            'tipo' => ['required', Rule::in(['estudiante', 'docente', 'externo'])],
        ]);

        $datos['estado'] = 'activo';
        $datos['fecha_registro'] = now()->toDateString();

        $socio = Socio::create($datos);

        return response()->json([
            'mensaje' => 'Socio registrado correctamente.',
            'datos' => $socio,
        ], 201);
    }

    public function show(Socio $socio): JsonResponse
    {
        return response()->json(['datos' => $socio]);
    }

    public function update(Request $request, Socio $socio): JsonResponse
    {
        $datos = $request->validate([
            'nombres' => ['sometimes', 'required', 'string', 'max:255'],
            'apellidos' => ['sometimes', 'required', 'string', 'max:255'],
            'dni' => ['sometimes', 'required', 'digits:8', Rule::unique('socios', 'dni')->ignore($socio->id)],
            'correo' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('socios', 'correo')->ignore($socio->id)],
            'telefono' => ['nullable', 'string', 'max:15'],
            'tipo' => ['sometimes', 'required', Rule::in(['estudiante', 'docente', 'externo'])],
            'estado' => ['sometimes', 'required', Rule::in(['activo', 'suspendido'])],
        ]);

        $socio->update($datos);

        return response()->json([
            'mensaje' => 'Socio actualizado correctamente.',
            'datos' => $socio->fresh(),
        ]);
    }

    /**
     * Cambia el estado del socio entre activo y suspendido.
     */
    public function cambiarEstado(Socio $socio): JsonResponse
    {
        $socio->update([
            'estado' => $socio->estado === 'activo' ? 'suspendido' : 'activo',
        ]);

        return response()->json([
            'mensaje' => "El socio ahora esta {$socio->estado}.",
            'datos' => $socio->fresh(),
        ]);
    }

    public function destroy(Socio $socio): JsonResponse
    {
        $socio->delete();

        return response()->json(['mensaje' => 'Socio eliminado correctamente.']);
    }
}
