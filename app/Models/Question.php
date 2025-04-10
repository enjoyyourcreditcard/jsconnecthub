<?php

namespace App\Models;

use App\Models\SupportStrategy;
use Illuminate\Database\Eloquent\Model;
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
        'text'
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
}
