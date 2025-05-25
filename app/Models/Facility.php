<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Facility extends Model
{
    protected $table        = "facilities";
    protected $primaryKey   = "id";
    protected $keyType      = "int";

    public $timestamps      = true;
    public $incrementing    = true;

    protected $fillable = [
        'name',
        'parent_id',
    ];

    /**
     * Get all of the bookings for the facility
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Relasi ke parent (self-referencing)
     *
     * @return BelongsTo
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Facility::class, 'parent_id');
    }

    /**
     * Relasi ke children (self-referencing)
     *
     * @return HasMany
     */
    public function children(): HasMany
    {
        return $this->hasMany(Facility::class, 'parent_id');
    }
}
