<?php

namespace App\Models;

use App\Models\Checkin;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Activity extends Model
{
    protected $table        = "activities";
    protected $primaryKey   = "id";
    protected $keyType      = "int";

    public $timestamps      = true;
    public $incrementing    = true;

    protected $fillable = [
        'name',
        'description'
    ];

    /**
     * Get all of the checkin for the activity
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function checkins(): HasMany
    {
        return $this->hasMany(Checkin::class);
    }
}
