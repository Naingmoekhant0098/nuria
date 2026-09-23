<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicService extends Model
{
    protected $table = 'clinic_services';

    protected $fillable = [
        'clinic_id',
        'doctor_id',
        'service_name',
        'service_description',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'id');
    }

    public function scopeFilter(): void {}
}
