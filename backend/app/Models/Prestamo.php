<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prestamo extends Model
{
    use HasFactory;

    protected $table = 'prestamos';

    /** Dias de plazo estandar para devolver un libro. */
    public const DIAS_PLAZO = 7;

    protected $fillable = [
        'libro_id',
        'socio_id',
        'fecha_prestamo',
        'fecha_devolucion_esperada',
        'fecha_devolucion_real',
        'estado',
        'dias_retraso',
        'observaciones',
    ];

    protected $casts = [
        'fecha_prestamo' => 'date',
        'fecha_devolucion_esperada' => 'date',
        'fecha_devolucion_real' => 'date',
        'dias_retraso' => 'integer',
    ];

    protected $appends = ['vencido'];

    public function libro(): BelongsTo
    {
        return $this->belongsTo(Libro::class);
    }

    public function socio(): BelongsTo
    {
        return $this->belongsTo(Socio::class);
    }

    public function scopeActivos(Builder $consulta): Builder
    {
        return $consulta->where('estado', 'activo');
    }

    public function scopeVencidos(Builder $consulta): Builder
    {
        return $consulta->where('estado', 'activo')
            ->whereDate('fecha_devolucion_esperada', '<', now()->toDateString());
    }

    /**
     * Un prestamo esta vencido si sigue activo y ya paso la fecha pactada.
     */
    public function getVencidoAttribute(): bool
    {
        return $this->estado === 'activo'
            && $this->fecha_devolucion_esperada !== null
            && $this->fecha_devolucion_esperada->isBefore(now()->startOfDay());
    }
}
