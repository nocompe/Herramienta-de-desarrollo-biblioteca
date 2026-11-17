<?php

namespace Tests\Feature;

use App\Models\Libro;
use App\Models\Prestamo;
use App\Models\Socio;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * MODULO 4 - Reportes y dashboard: pruebas de /api/reportes/*.
 */
class ReporteApiTest extends TestCase
{
    use RefreshDatabase;

    private Libro $libro;

    private Socio $socio;

    protected function setUp(): void
    {
        parent::setUp();

        $this->libro = Libro::create([
            'titulo' => 'Refactoring', 'autor' => 'Martin Fowler', 'isbn' => '9780134757599',
            'categoria' => 'Informatica', 'ejemplares_totales' => 5, 'ejemplares_disponibles' => 3,
        ]);
        $this->socio = Socio::create([
            'nombres' => 'Rosa', 'apellidos' => 'Mamani', 'dni' => '70000001', 'correo' => 'rosa@utp.edu.pe',
            'tipo' => 'docente', 'estado' => 'activo', 'fecha_registro' => now()->toDateString(),
        ]);
    }

    private function prestamo(string $estado, int $diasParaVencer): Prestamo
    {
        return Prestamo::create([
            'libro_id' => $this->libro->id,
            'socio_id' => $this->socio->id,
            'fecha_prestamo' => now()->subDays(10)->toDateString(),
            'fecha_devolucion_esperada' => now()->addDays($diasParaVencer)->toDateString(),
            'fecha_devolucion_real' => $estado === 'devuelto' ? now()->toDateString() : null,
            'estado' => $estado,
        ]);
    }

    public function test_los_indicadores_cuentan_libros_y_socios(): void
    {
        $this->getJson('/api/reportes/indicadores')
            ->assertOk()
            ->assertJsonPath('datos.titulos_registrados', 1)
            ->assertJsonPath('datos.ejemplares_totales', 5)
            ->assertJsonPath('datos.ejemplares_disponibles', 3)
            ->assertJsonPath('datos.socios_activos', 1);
    }

    public function test_lista_los_prestamos_vencidos_con_sus_dias_de_atraso(): void
    {
        $this->prestamo('activo', -4);   // vencido hace 4 dias
        $this->prestamo('activo', 3);    // todavia en plazo

        $this->getJson('/api/reportes/prestamos-vencidos')
            ->assertOk()
            ->assertJsonCount(1, 'datos')
            ->assertJsonPath('datos.0.dias_vencido', 4);
    }

    public function test_el_ranking_ordena_los_libros_por_cantidad_de_prestamos(): void
    {
        $this->prestamo('devuelto', 1);
        $this->prestamo('activo', 5);

        $this->getJson('/api/reportes/libros-mas-prestados')
            ->assertOk()
            ->assertJsonPath('datos.0.titulo', 'Refactoring')
            ->assertJsonPath('datos.0.total_prestamos', 2);
    }
}
