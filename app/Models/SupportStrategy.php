<?php

namespace App\Models;

use App\Models\Question;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportStrategy extends Model
{
    protected $table        = "support_strategies";
    protected $primaryKey   = "id";
    protected $keyType      = "int";

    public $timestamps      = true;
    public $incrementing    = true;

    protected $fillable = [
        'name'
    ];

    /**
     * Get all of the questions for the support strategy
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
