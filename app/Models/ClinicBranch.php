<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicBranch extends Model
{
    // Define the fillable fields to match your migration
    protected $fillable = [
        'clinic_id',
        'branch_name',
        'phone_number',
        'address',
    ];

    /**
     * Get the clinic that owns this branch.
     */
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }
}
