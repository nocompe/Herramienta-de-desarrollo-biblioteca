<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Libro;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * MODULO 1 - Catalogo de Libros
 * CRUD completo sobre la tabla libros.
 */
class LibroController extends Controller
{
    /**
     * Lista los libros con busqueda opcional por titulo, autor o ISBN.
     */
    public function index(Request $request): JsonResponse
    {
        $consulta = Libro::query();

        if ($buscar = $request->query('buscar')) {
            $consulta->where(function ($q) use ($buscar) {
                $q->where('titulo', 'like', "%{$buscar}%")
                  ->orWhere('autor', 'like', "%{$buscar}%")
                  ->orWhere('isbn', 'like', "%{$buscar}%");
            });
        }

        if ($categoria = $request->query('categoria')) {
            $consulta->where('categoria', $categoria);
        }

        return response()->json([
            'datos' => $consulta->orderBy('titulo')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'autor' => ['required', 'string', 'max:255'],
            'isbn' => ['required', 'string', 'max:20', 'unique:libros,isbn'],
            'editorial' => ['nullable', 'string', 'max:255'],
            'categoria' => ['nullable', 'string', 'max:60'],
            'anio_publicacion' => ['nullable', 'integer', 'min:1500', 'max:2100'],
            'ejemplares_totales' => ['required', 'integer', 'min:1', 'max:999'],
        ]);

        $datos['categoria'] = $datos['categoria'] ?? 'General';
        $datos['ejemplares_disponibles'] = $datos['ejemplares_totales'];

        $libro = Libro::create($datos);

        return response()->json([
            'mensaje' => 'Libro registrado correctamente.',
            'datos' => $libro,
        ], 201);
    }

    public function show(Libro $libro): JsonResponse
    {
        return response()->json(['datos' => $libro]);
    }

    public function update(Request $request, Libro $libro): JsonResponse
    {
        $datos = $request->validate([
            'titulo' => ['sometimes', 'required', 'string', 'max:255'],
            'autor' => ['sometimes', 'required', 'string', 'max:255'],
            'isbn' => ['sometimes', 'required', 'string', 'max:20', 'unique:libros,isbn,'.$libro->id],
            'editorial' => ['nullable', 'string', 'max:255'],
            'categoria' => ['nullable', 'string', 'max:60'],
            'anio_publicacion' => ['nullable', 'integer', 'min:1500', 'max:2100'],
            'ejemplares_totales' => ['sometimes', 'required', 'integer', 'min:1', 'max:999'],
        ]);

        // Si cambia el total de ejemplares se ajusta el stock disponible
        // conservando los ejemplares que estan prestados en este momento.
        if (isset($datos['ejemplares_totales'])) {
            $prestados = $libro->ejemplares_totales - $libro->ejemplares_disponibles;
            $datos['ejemplares_disponibles'] = max(0, $datos['ejemplares_totales'] - $prestados);
        }

        $libro->update($datos);

        return response()->json([
            'mensaje' => 'Libro actualizado correctamente.',
            'datos' => $libro->fresh(),
        ]);
    }

    public function destroy(Libro $libro): JsonResponse
    {
        if ($libro->ejemplares_disponibles < $libro->ejemplares_totales) {
            return response()->json([
                'mensaje' => 'No se puede eliminar: el libro tiene ejemplares prestados.',
            ], 409);
        }

        $libro->delete();

        return response()->json(['mensaje' => 'Libro eliminado correctamente.']);
    }
}
