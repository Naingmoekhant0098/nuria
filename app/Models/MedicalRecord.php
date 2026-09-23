<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalRecord extends Model
{
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'record_title',
        'file_attachment',
        'appointment_code',
        'notes',
        'record_date',
    ];

    protected $casts = [
        'record_date' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(
            Patient::class,
            'patient_id',
            'id'
        );
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(
            Reservation::class,
            'appointment_code',
            'appointment_code'
        );
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(
            Doctor::class,
            'doctor_id',
            'id'
        );
    }
}
