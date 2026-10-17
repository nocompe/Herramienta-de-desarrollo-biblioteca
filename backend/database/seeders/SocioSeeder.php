<?php

namespace Database\Seeders;

use App\Models\Socio;
use Illuminate\Database\Seeder;

class SocioSeeder extends Seeder
{
    public function run(): void
    {
        $socios = [
            ['nombres' => 'Ana Lucia', 'apellidos' => 'Ramirez Torres', 'dni' => '70123456', 'correo' => 'ana.ramirez@utp.edu.pe', 'telefono' => '987654321', 'tipo' => 'estudiante'],
            ['nombres' => 'Carlos Alberto', 'apellidos' => 'Quispe Mamani', 'dni' => '71234567', 'correo' => 'carlos.quispe@utp.edu.pe', 'telefono' => '986123456', 'tipo' => 'estudiante'],
            ['nombres' => 'Maria Elena', 'apellidos' => 'Flores Vega', 'dni' => '09876543', 'correo' => 'maria.flores@utp.edu.pe', 'telefono' => '999888777', 'tipo' => 'docente'],
            ['nombres' => 'Jorge Luis', 'apellidos' => 'Salazar Rios', 'dni' => '45678912', 'correo' => 'jorge.salazar@utp.edu.pe', 'telefono' => '955443322', 'tipo' => 'docente'],
            ['nombres' => 'Rosa Maria', 'apellidos' => 'Chavez Diaz', 'dni' => '44556677', 'correo' => 'rosa.chavez@gmail.com', 'telefono' => '911223344', 'tipo' => 'externo'],
            ['nombres' => 'Diego Fernando', 'apellidos' => 'Huaman Rojas', 'dni' => '72345678', 'correo' => 'diego.huaman@utp.edu.pe', 'telefono' => '933221100', 'tipo' => 'estudiante'],
        ];

        foreach ($socios as $socio) {
            $socio['estado'] = 'activo';
            $socio['fecha_registro'] = now()->toDateString();
            Socio::updateOrCreate(['dni' => $socio['dni']], $socio);
        }
    }
}
