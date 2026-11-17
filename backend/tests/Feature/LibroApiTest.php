<?php

namespace Tests\Feature;

use App\Models\Libro;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * MODULO 1 - Catalogo de libros: pruebas de la API /api/libros.
 */
class LibroApiTest extends TestCase
{
    use RefreshDatabase;

    private function datosLibro(array $cambios = []): array
    {
        return array_merge([
            'titulo' => 'Pro Git',
            'autor' => 'Scott Chacon',
            'isbn' => '9781484200773',
            'editorial' => 'Apress',
            'categoria' => 'Informatica',
            'anio_publicacion' => 2014,
            'ejemplares_totales' => 3,
        ], $cambios);
    }

    public function test_registra_un_libro_con_todos_sus_ejemplares_disponibles(): void
    {
        $respuesta = $this->postJson('/api/libros', $this->datosLibro());

        $respuesta->assertCreated()
            ->assertJsonPath('datos.titulo', 'Pro Git')
            ->assertJsonPath('datos.ejemplares_disponibles', 3);
        $this->assertDatabaseHas('libros', ['isbn' => '9781484200773']);
    }

    public function test_no_permite_dos_libros_con_el_mismo_isbn(): void
    {
        $this->postJson('/api/libros', $this->datosLibro())->assertCreated();

        $this->postJson('/api/libros', $this->datosLibro(['titulo' => 'Otro']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('isbn');
    }

    public function test_valida_los_campos_obligatorios_y_responde_en_json(): void
    {
        $this->postJson('/api/libros', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['titulo', 'autor', 'isbn', 'ejemplares_totales']);
    }

    public function test_busca_por_titulo_autor_o_isbn(): void
    {
        Libro::create($this->datosLibro() + ['ejemplares_disponibles' => 3]);
        Libro::create($this->datosLibro([
            'titulo' => 'Clean Code',
            'autor' => 'Robert C. Martin',
            'isbn' => '9780132350884',
        ]) + ['ejemplares_disponibles' => 3]);

        $this->getJson('/api/libros?buscar=Martin')
            ->assertOk()
            ->assertJsonCount(1, 'datos')
            ->assertJsonPath('datos.0.titulo', 'Clean Code');
    }

    public function test_al_reducir_ejemplares_conserva_los_que_estan_prestados(): void
    {
        $libro = Libro::create($this->datosLibro(['ejemplares_totales' => 5]) + ['ejemplares_disponibles' => 3]);

        $this->putJson("/api/libros/{$libro->id}", ['ejemplares_totales' => 4])
            ->assertOk()
            ->assertJsonPath('datos.ejemplares_disponibles', 2);
    }

    public function test_no_elimina_un_libro_con_ejemplares_prestados(): void
    {
        $libro = Libro::create($this->datosLibro() + ['ejemplares_disponibles' => 2]);

        $this->deleteJson("/api/libros/{$libro->id}")->assertStatus(409);
        $this->assertDatabaseHas('libros', ['id' => $libro->id]);
    }
}
