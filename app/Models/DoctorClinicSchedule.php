<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoctorClinicSchedule extends Model
{
    protected $fillable = [
        'clinic_id',
        'doctor_id',
        'day_of_week',
        'start_time',
        'end_time',
    ];

    /**
     * Get the clinic associated with the schedule.
     */
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    /**
     * Get the doctor associated with the schedule.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'id');
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            // Filter by Doctor ID
            ->when($filters['doctor_id'] ?? null, function ($q, $doctorId) {
                $q->where('doctor_id', $doctorId);
            })
            // Filter by Clinic ID
            ->when($filters['clinic_id'] ?? null, function ($q, $clinicId) {
                $q->where('clinic_id', $clinicId);
            })
            // Filter by Day of Week (e.g., 'Monday')
            ->when($filters['day_of_week'] ?? null, function ($q, $day) {
                $q->where('day_of_week', ucfirst(strtolower($day)));
            })
            // Filter by specific active time (e.g., '14:30:00')
            ->when($filters['active_at'] ?? null, function ($q, $time) {
                $q->where('start_time', '<=', $time)
                    ->where('end_time', '>=', $time);
            })
            // Search doctor name via relationship
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->whereHas('doctor', function ($doctorQuery) use ($search) {
                    $doctorQuery->where('name', 'like', "%{$search}%");
                });
            });
    }
}
