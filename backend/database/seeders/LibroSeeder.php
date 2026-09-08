<?php

namespace Database\Seeders;

use App\Models\Libro;
use Illuminate\Database\Seeder;

class LibroSeeder extends Seeder
{
    public function run(): void
    {
        $libros = [
            ['titulo' => 'Cien anos de soledad', 'autor' => 'Gabriel Garcia Marquez', 'isbn' => '9780307474728', 'editorial' => 'Sudamericana', 'categoria' => 'Novela', 'anio_publicacion' => 1967, 'ejemplares_totales' => 5],
            ['titulo' => 'La ciudad y los perros', 'autor' => 'Mario Vargas Llosa', 'isbn' => '9788432248481', 'editorial' => 'Seix Barral', 'categoria' => 'Novela', 'anio_publicacion' => 1963, 'ejemplares_totales' => 4],
            ['titulo' => 'Clean Code', 'autor' => 'Robert C. Martin', 'isbn' => '9780132350884', 'editorial' => 'Prentice Hall', 'categoria' => 'Informatica', 'anio_publicacion' => 2008, 'ejemplares_totales' => 3],
            ['titulo' => 'Pro Git', 'autor' => 'Scott Chacon', 'isbn' => '9781484200773', 'editorial' => 'Apress', 'categoria' => 'Informatica', 'anio_publicacion' => 2014, 'ejemplares_totales' => 6],
            ['titulo' => 'Los rios profundos', 'autor' => 'Jose Maria Arguedas', 'isbn' => '9789972663512', 'editorial' => 'Horizonte', 'categoria' => 'Novela', 'anio_publicacion' => 1958, 'ejemplares_totales' => 3],
            ['titulo' => 'Fundamentos de bases de datos', 'autor' => 'Abraham Silberschatz', 'isbn' => '9788448190330', 'editorial' => 'McGraw-Hill', 'categoria' => 'Informatica', 'anio_publicacion' => 2014, 'ejemplares_totales' => 2],
            ['titulo' => 'Tradiciones peruanas', 'autor' => 'Ricardo Palma', 'isbn' => '9789972205439', 'editorial' => 'Peisa', 'categoria' => 'Historia', 'anio_publicacion' => 1872, 'ejemplares_totales' => 4],
            ['titulo' => 'El arte de la guerra', 'autor' => 'Sun Tzu', 'isbn' => '9788441422018', 'editorial' => 'Edaf', 'categoria' => 'Historia', 'anio_publicacion' => 1910, 'ejemplares_totales' => 2],
        ];

        foreach ($libros as $libro) {
            $libro['ejemplares_disponibles'] = $libro['ejemplares_totales'];
            Libro::updateOrCreate(['isbn' => $libro['isbn']], $libro);
        }
    }
}
