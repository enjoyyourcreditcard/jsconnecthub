<?php

namespace App\Models;

use App\Models\Question;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RadioOption extends Model
{
    protected $table        = "radio_options";
    protected $primaryKey   = "id";
    protected $keyType      = "int";

    public $timestamps      = true;
    public $incrementing    = true;

    protected $fillable = [
        'question_id',
        'text'
    ];

    /**
     * Get the Question that owns the radio option
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
