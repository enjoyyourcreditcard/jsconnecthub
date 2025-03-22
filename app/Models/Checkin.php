<?php

namespace App\Models;

use App\Models\Student;
use App\Models\Activity;
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
        'activity_id',
        'checkin_time',
        'checkout_time',
        'other_activity',
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
     * Get the activity that owns the checkin
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
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
