<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla de prestamos. Relaciona un libro con un socio y controla
     * las fechas de entrega y devolucion.
     */
    public function up(): void
    {
        Schema::create('prestamos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('libro_id')->constrained('libros')->cascadeOnDelete();
            $table->foreignId('socio_id')->constrained('socios')->cascadeOnDelete();
            $table->date('fecha_prestamo');
            $table->date('fecha_devolucion_esperada');
            $table->date('fecha_devolucion_real')->nullable();
            $table->enum('estado', ['activo', 'devuelto'])->default('activo');
            $table->unsignedInteger('dias_retraso')->default(0);
            $table->string('observaciones')->nullable();
            $table->timestamps();

            $table->index(['estado', 'fecha_devolucion_esperada']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prestamos');
    }
};
