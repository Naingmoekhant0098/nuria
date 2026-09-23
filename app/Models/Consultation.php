<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Consultation extends Model
{
    protected $fillable = [
        'appointment_code',
        'date_of_consultation',
        'diagnosis',
        'treatment',
        'upload_prescription',
    ];

    protected $casts = [
        'date_of_consultation' => 'datetime',
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(
            Reservation::class,
            'appointment_code',
            'appointment_code'
        );
    }

    public function prescription(): HasOne
    {
        return $this->hasOne(Prescription::class);
    }
}
