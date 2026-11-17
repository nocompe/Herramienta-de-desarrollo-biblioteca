<?php

namespace Tests\Feature;

use App\Models\Libro;
use App\Models\Prestamo;
use App\Models\Socio;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Regresion del issue #23: cada conteo de /api/reportes/indicadores debe
 * partir de la consulta original y no arrastrar los filtros de los anteriores.
 */
class IndicadoresTasaDevolucionTest extends TestCase
{
    use RefreshDatabase;

    public function test_la_tasa_de_devolucion_cuenta_todos_los_prestamos(): void
    {
        $libro = Libro::create([
            'titulo' => 'Domain-Driven Design', 'autor' => 'Eric Evans', 'isbn' => '9780321125217',
            'categoria' => 'Informatica', 'ejemplares_totales' => 5, 'ejemplares_disponibles' => 4,
        ]);
        $socio = Socio::create([
            'nombres' => 'Jorge', 'apellidos' => 'Salazar', 'dni' => '70000002', 'correo' => 'jorge@utp.edu.pe',
            'tipo' => 'docente', 'estado' => 'activo', 'fecha_registro' => now()->toDateString(),
        ]);

        foreach ([['devuelto', 1], ['activo', 5]] as [$estado, $diasParaVencer]) {
            Prestamo::create([
                'libro_id' => $libro->id,
                'socio_id' => $socio->id,
                'fecha_prestamo' => now()->subDays(10)->toDateString(),
                'fecha_devolucion_esperada' => now()->addDays($diasParaVencer)->toDateString(),
                'fecha_devolucion_real' => $estado === 'devuelto' ? now()->toDateString() : null,
                'estado' => $estado,
            ]);
        }

        $this->getJson('/api/reportes/indicadores')
            ->assertOk()
            ->assertJsonPath('datos.prestamos_activos', 1)
            ->assertJsonPath('datos.prestamos_vencidos', 0)
            ->assertJsonPath('datos.devoluciones_periodo', 1)
            ->assertJsonPath('datos.tasa_devolucion', '50%');
    }
}
