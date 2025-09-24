<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'cca_id',
        'name',
        'code',
        'quantity',
        'active',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'active' => 'boolean',
    ];

    public function cca()
    {
        return $this->belongsTo(Cca::class, 'cca_id');
    }

    public function loans()
    {
        return $this->hasMany(EquipmentLoan::class, 'equipment_id');
    }
}
