<?php

namespace App\Models;
use App\Models\DataClass;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model
{
    protected $table        = "students";
    protected $primaryKey   = "id";
    protected $keyType      = "int";

    public $timestamps      = true;
    public $incrementing    = true;

    protected $fillable = [
        'data_class_id',
        'name'
    ];

    /**
     * Get the Class that owns the student
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function dataClass(): BelongsTo
    {
        return $this->belongsTo(DataClass::class);
    }
}
