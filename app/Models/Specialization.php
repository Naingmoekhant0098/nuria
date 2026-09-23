<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Specialization extends Model
{
    // If you want to use mass assignment
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * A specialization has many doctors.
     */
    public function doctors(): HasMany
    {
        return $this->hasMany(Doctor::class, 'specialization_id');
    }
}
