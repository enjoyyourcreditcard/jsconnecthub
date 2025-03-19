<?php

namespace App\Models;

use App\Models\Student;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Checkin extends Model
{
    protected $table        = "checkins";
    protected $primaryKey   = "id";
    protected $keyType      = "int";

    public $timestamps      = false;
    public $incrementing    = true;

    protected $fillable = [
        'student_id',
        'checkin_time',
        'checkout_time',
        'reason'
    ];

    /**
     * Get the student that owns the checkin
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'checkin_time'  => 'datetime:Y-m-d',
            'checkout_time' => 'datetime:Y-m-d'
        ];
    }
}
