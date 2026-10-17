<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla de socios (usuarios habilitados para pedir prestamos).
     */
    public function up(): void
    {
        Schema::create('socios', function (Blueprint $table) {
            $table->id();
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('dni', 8)->unique();
            $table->string('correo')->unique();
            $table->string('telefono', 15)->nullable();
            $table->enum('tipo', ['estudiante', 'docente', 'externo'])->default('estudiante');
            $table->enum('estado', ['activo', 'suspendido'])->default('activo');
            $table->date('fecha_registro');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('socios');
    }
};
