<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla del catalogo de libros de la biblioteca.
     */
    public function up(): void
    {
        Schema::create('libros', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('autor');
            $table->string('isbn', 20)->unique();
            $table->string('editorial')->nullable();
            $table->string('categoria', 60)->default('General');
            $table->year('anio_publicacion')->nullable();
            $table->unsignedInteger('ejemplares_totales')->default(1);
            $table->unsignedInteger('ejemplares_disponibles')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('libros');
    }
};
