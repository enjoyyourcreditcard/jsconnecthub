<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
