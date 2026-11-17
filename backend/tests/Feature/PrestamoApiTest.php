<?php

namespace Tests\Feature;

use App\Models\Libro;
use App\Models\Prestamo;
use App\Models\Socio;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * MODULO 3 - Prestamos y devoluciones: las cuatro reglas de negocio
 * y el calculo de dias de retraso.
 */
class PrestamoApiTest extends TestCase
{
    use RefreshDatabase;

    private function libro(int $ejemplares = 2, string $isbn = '9780132350884'): Libro
    {
        return Libro::create([
            'titulo' => 'Clean Code',
            'autor' => 'Robert C. Martin',
            'isbn' => $isbn,
            'categoria' => 'Informatica',
            'ejemplares_totales' => $ejemplares,
            'ejemplares_disponibles' => $ejemplares,
        ]);
    }

    private function socio(string $tipo = 'estudiante', string $estado = 'activo'): Socio
    {
        return Socio::create([
            'nombres' => 'Luis',
            'apellidos' => 'Huaman',
            'dni' => '7'.random_int(1000000, 9999999),
            'correo' => uniqid('socio').'@utp.edu.pe',
            'tipo' => $tipo,
            'estado' => $estado,
            'fecha_registro' => now()->toDateString(),
        ]);
    }

    public function test_registra_un_prestamo_y_descuenta_un_ejemplar(): void
    {
        $libro = $this->libro();
        $socio = $this->socio();

        $this->postJson('/api/prestamos', ['libro_id' => $libro->id, 'socio_id' => $socio->id])
            ->assertCreated()
            ->assertJsonPath('datos.estado', 'activo');

        $this->assertSame(1, $libro->fresh()->ejemplares_disponibles);
    }

    public function test_regla_1_un_socio_suspendido_no_puede_pedir_prestado(): void
    {
        $this->postJson('/api/prestamos', ['libro_id' => $this->libro()->id, 'socio_id' => $this->socio(estado: 'suspendido')->id])
            ->assertStatus(422)
            ->assertJsonPath('mensaje', 'El socio se encuentra suspendido y no puede solicitar prestamos.');
    }

    public function test_regla_2_respeta_el_limite_de_prestamos_del_tipo_de_socio(): void
    {
        $externo = $this->socio('externo'); // limite: 1
        $this->postJson('/api/prestamos', ['libro_id' => $this->libro(2, '1111111111')->id, 'socio_id' => $externo->id])->assertCreated();

        $this->postJson('/api/prestamos', ['libro_id' => $this->libro(2, '2222222222')->id, 'socio_id' => $externo->id])
            ->assertStatus(422);
    }

    public function test_regla_3_no_presta_si_no_quedan_ejemplares(): void
    {
        $libro = $this->libro(1);
        $this->postJson('/api/prestamos', ['libro_id' => $libro->id, 'socio_id' => $this->socio()->id])->assertCreated();

        $this->postJson('/api/prestamos', ['libro_id' => $libro->id, 'socio_id' => $this->socio()->id])
            ->assertStatus(422)
            ->assertJsonPath('mensaje', 'No quedan ejemplares disponibles de este libro.');
    }

    public function test_regla_4_no_presta_dos_veces_el_mismo_libro_al_mismo_socio(): void
    {
        $libro = $this->libro(3);
        $socio = $this->socio();
        $this->postJson('/api/prestamos', ['libro_id' => $libro->id, 'socio_id' => $socio->id])->assertCreated();

        $this->postJson('/api/prestamos', ['libro_id' => $libro->id, 'socio_id' => $socio->id])
            ->assertStatus(422)
            ->assertJsonPath('mensaje', 'El socio ya tiene un prestamo activo de este mismo libro.');
    }

    public function test_la_devolucion_calcula_los_dias_de_retraso_y_libera_el_ejemplar(): void
    {
        $libro = $this->libro(1);
        $libro->update(['ejemplares_disponibles' => 0]);
        $prestamo = Prestamo::create([
            'libro_id' => $libro->id,
            'socio_id' => $this->socio()->id,
            'fecha_prestamo' => now()->subDays(10)->toDateString(),
            'fecha_devolucion_esperada' => now()->subDays(3)->toDateString(),
            'estado' => 'activo',
        ]);

        $this->patchJson("/api/prestamos/{$prestamo->id}/devolucion")
            ->assertOk()
            ->assertJsonPath('datos.estado', 'devuelto')
            ->assertJsonPath('datos.dias_retraso', 3);

        $this->assertSame(1, $libro->fresh()->ejemplares_disponibles);
    }

    public function test_no_se_puede_devolver_dos_veces(): void
    {
        $prestamo = Prestamo::create([
            'libro_id' => $this->libro()->id,
            'socio_id' => $this->socio()->id,
            'fecha_prestamo' => now()->toDateString(),
            'fecha_devolucion_esperada' => now()->addDays(7)->toDateString(),
            'fecha_devolucion_real' => now()->toDateString(),
            'estado' => 'devuelto',
        ]);

        $this->patchJson("/api/prestamos/{$prestamo->id}/devolucion")->assertStatus(409);
    }
}
