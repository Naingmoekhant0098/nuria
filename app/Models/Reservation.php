<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reservation extends Model
{
    protected $fillable = [
        'appointment_code',
        'patient_id',
        'doctor_id',
        'clinic_id',
        'service_id',
        'schedule_id',
        'appointment_at',
        'appointment_type',
        'status',
        'remarks',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'appointment_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'id');
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class, 'clinic_id', 'id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(
            ClinicService::class,
            'service_id',
            'id'
        );
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(
            DoctorClinicSchedule::class,
            'schedule_id',
            'id'
        );
    }

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(
            MedicalRecord::class,
            'appointment_code',
            'appointment_code'
        );
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'reservation_id', 'id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'reservation_id', 'id');
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function consultation(): HasOne
    {
        return $this->hasOne(
            Consultation::class,
            'appointment_code',
            'appointment_code'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['search'] ?? null, function (Builder $query, $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query
                        ->where('appointment_code', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhere('appointment_type', 'like', "%{$search}%")
                        ->orWhereHas('patient', function (Builder $query) use ($search) {
                            $query->where('first_name', 'like', "%{$search}%")
                                ->orWhere('middle_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('doctor', function (Builder $query) use ($search) {
                            $query->where('first_name', 'like', "%{$search}%")
                                ->orWhere('middle_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['status'] ?? null, function (Builder $query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['clinic_id'] ?? null, function (Builder $query, $clinicId) {
                $query->where('clinic_id', $clinicId);
            })
            ->when($filters['doctor_id'] ?? null, function (Builder $query, $doctorId) {
                $query->where('doctor_id', $doctorId);
            })
            ->when($filters['patient_id'] ?? null, function (Builder $query, $patientId) {
                $query->where('patient_id', $patientId);
            });
    }
}
