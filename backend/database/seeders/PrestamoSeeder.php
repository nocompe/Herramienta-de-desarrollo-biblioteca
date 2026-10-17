<?php

namespace Database\Seeders;

use App\Models\Libro;
use App\Models\Prestamo;
use App\Models\Socio;
use Illuminate\Database\Seeder;

class PrestamoSeeder extends Seeder
{
    /**
     * Genera prestamos de ejemplo: algunos vigentes, uno vencido y
     * otros ya devueltos, para poder probar el dashboard de reportes.
     */
    public function run(): void
    {
        $libros = Libro::orderBy('id')->take(5)->get();
        $socios = Socio::orderBy('id')->take(4)->get();

        if ($libros->isEmpty() || $socios->isEmpty()) {
            return;
        }

        $ejemplos = [
            ['dias_atras' => 2, 'plazo' => 7, 'devuelto' => false],
            ['dias_atras' => 12, 'plazo' => 7, 'devuelto' => false],
            ['dias_atras' => 20, 'plazo' => 7, 'devuelto' => true],
            ['dias_atras' => 30, 'plazo' => 7, 'devuelto' => true],
            ['dias_atras' => 5, 'plazo' => 10, 'devuelto' => false],
        ];

        foreach ($ejemplos as $indice => $ejemplo) {
            $libro = $libros[$indice % $libros->count()];
            $socio = $socios[$indice % $socios->count()];

            $fechaPrestamo = now()->subDays($ejemplo['dias_atras']);
            $fechaEsperada = $fechaPrestamo->copy()->addDays($ejemplo['plazo']);

            $prestamo = Prestamo::create([
                'libro_id' => $libro->id,
                'socio_id' => $socio->id,
                'fecha_prestamo' => $fechaPrestamo->toDateString(),
                'fecha_devolucion_esperada' => $fechaEsperada->toDateString(),
                'estado' => $ejemplo['devuelto'] ? 'devuelto' : 'activo',
                'observaciones' => 'Registro de ejemplo generado por el seeder.',
            ]);

            if ($ejemplo['devuelto']) {
                $fechaReal = $fechaEsperada->copy()->addDays(1);
                $prestamo->update([
                    'fecha_devolucion_real' => $fechaReal->toDateString(),
                    'dias_retraso' => 1,
                ]);
            } else {
                $libro->decrement('ejemplares_disponibles');
            }
        }
    }
}
