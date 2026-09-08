<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Ejecuta los seeders de cada modulo.
     * Cada integrante registra su seeder dentro de la zona de su modulo.
     */
    public function run(): void
    {
        // --- SEEDERS MODULO 1 ---
        $this->call(LibroSeeder::class);
        // --- SEEDERS MODULO 2 ---
        $this->call(SocioSeeder::class);
        // --- SEEDERS MODULO 3 ---
    }
}
