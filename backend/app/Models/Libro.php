<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Libro extends Model
{
    use HasFactory;

    protected $table = 'libros';

    protected $fillable = [
        'titulo',
        'autor',
        'isbn',
        'editorial',
        'categoria',
        'anio_publicacion',
        'ejemplares_totales',
        'ejemplares_disponibles',
    ];

    protected $casts = [
        'anio_publicacion' => 'integer',
        'ejemplares_totales' => 'integer',
        'ejemplares_disponibles' => 'integer',
    ];

    /**
     * Indica si queda al menos un ejemplar libre para prestar.
     */
    public function hayDisponibilidad(): bool
    {
        return $this->ejemplares_disponibles > 0;
    }
}
