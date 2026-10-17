<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Socio extends Model
{
    use HasFactory;

    protected $table = 'socios';

    /** Limite de prestamos simultaneos segun el tipo de socio. */
    public const LIMITE_PRESTAMOS = [
        'estudiante' => 3,
        'docente' => 5,
        'externo' => 1,
    ];

    protected $fillable = [
        'nombres',
        'apellidos',
        'dni',
        'correo',
        'telefono',
        'tipo',
        'estado',
        'fecha_registro',
    ];

    protected $casts = [
        'fecha_registro' => 'date',
    ];

    protected $appends = ['nombre_completo'];

    public function getNombreCompletoAttribute(): string
    {
        return trim($this->nombres.' '.$this->apellidos);
    }

    public function limitePrestamos(): int
    {
        return self::LIMITE_PRESTAMOS[$this->tipo] ?? 1;
    }

    public function estaActivo(): bool
    {
        return $this->estado === 'activo';
    }
}
