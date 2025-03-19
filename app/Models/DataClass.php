<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataClass extends Model
{
    protected $fillable = [
        'name',
        'level_id'
    ];
    /**
     * Get the level that owns the DataClass
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function level(): BelongsTo
    {
        return $this->belongsTo(level::class);
    }
}
