<?php

namespace App\Models;

use App\Models\Student;
use App\Models\Facility;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $table        = "bookings";
    protected $primaryKey   = "id";
    protected $keyType      = "int";

    public $timestamps      = true;
    public $incrementing    = true;

    protected $fillable = [
        'student_id',
        'facility_id',
        'start_time',
        'end_time',
        'status',
        'job_id',
    ];

    /**
     * Get the student that owns the booking
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the facility that owns the booking
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $casts = [
        'start_time'    => 'datetime:Y-m-d\TH:i:s.u\Z',
        'end_time'      => 'datetime:Y-m-d\TH:i:s.u\Z'
    ];
}
