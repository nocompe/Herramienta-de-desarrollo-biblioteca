<?php

namespace Tests\Feature;

use App\Models\Socio;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * MODULO 2 - Gestion de socios: pruebas de la API /api/socios.
 */
class SocioApiTest extends TestCase
{
    use RefreshDatabase;

    private function datosSocio(array $cambios = []): array
    {
        return array_merge([
            'nombres' => 'Ana',
            'apellidos' => 'Quispe Rojas',
            'dni' => '71234567',
            'correo' => 'ana.quispe@utp.edu.pe',
            'telefono' => '987654321',
            'tipo' => 'estudiante',
        ], $cambios);
    }

    public function test_registra_un_socio_activo(): void
    {
        $this->postJson('/api/socios', $this->datosSocio())
            ->assertCreated()
            ->assertJsonPath('datos.estado', 'activo');
    }

    public function test_el_dni_debe_tener_8_digitos_y_ser_unico(): void
    {
        $this->postJson('/api/socios', $this->datosSocio(['dni' => '123']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('dni');

        $this->postJson('/api/socios', $this->datosSocio())->assertCreated();
        $this->postJson('/api/socios', $this->datosSocio(['correo' => 'otro@utp.edu.pe']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('dni');
    }

    public function test_solo_acepta_los_tipos_estudiante_docente_o_externo(): void
    {
        $this->postJson('/api/socios', $this->datosSocio(['tipo' => 'invitado']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('tipo');
    }

    public function test_cambiar_estado_alterna_entre_activo_y_suspendido(): void
    {
        $socio = Socio::create($this->datosSocio() + ['estado' => 'activo', 'fecha_registro' => now()->toDateString()]);

        $this->patchJson("/api/socios/{$socio->id}/estado")->assertOk()->assertJsonPath('datos.estado', 'suspendido');
        $this->patchJson("/api/socios/{$socio->id}/estado")->assertOk()->assertJsonPath('datos.estado', 'activo');
    }

    public function test_el_historial_muestra_el_limite_segun_el_tipo(): void
    {
        $socio = Socio::create($this->datosSocio(['tipo' => 'docente']) + ['estado' => 'activo', 'fecha_registro' => now()->toDateString()]);

        $this->getJson("/api/socios/{$socio->id}/prestamos")
            ->assertOk()
            ->assertJsonPath('socio.limite_prestamos', 5)
            ->assertJsonPath('total', 0);
    }
}
