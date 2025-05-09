<?php

namespace App\Models;

use App\Models\RadioOption;
use App\Models\SupportStrategy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Question extends Model
{
    protected $table        = "questions";
    protected $primaryKey   = "id";
    protected $keyType      = "int";

    public $timestamps      = true;
    public $incrementing    = true;

    protected $fillable = [
        'support_strategy_id',
        'order',
        'text',
        'type',
    ];

    /**
     * Get the Support Strategy that owns the question
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function supportStrategy(): BelongsTo
    {
        return $this->belongsTo(SupportStrategy::class);
    }

    /**
     * Get all of the radio options for the question
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function radioOptions(): HasMany
    {
        return $this->hasMany(RadioOption::class);
    }
}
