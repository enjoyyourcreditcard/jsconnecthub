<?php

namespace App\Models;

use App\Models\Result;
use App\Models\Question;
use App\Models\RadioOption;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Answer extends Model
{
    protected $table        = "answers";
    protected $primaryKey   = "id";
    protected $keyType      = "int";

    public $timestamps      = true;
    public $incrementing    = true;

    protected $fillable = [
        'result_id',
        'question_id',
        'radio_option_id',
        'text'
    ];

    /**
     * Get the Result that owns the answer
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function result(): BelongsTo
    {
        return $this->belongsTo(Result::class);
    }

    /**
     * Get the Question that owns the answer
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Get the Question that owns the Radio Option
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function radioOption(): BelongsTo
    {
        return $this->belongsTo(RadioOption::class);
    }
}
