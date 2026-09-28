<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Clinic extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'clinic_name',
        'clinic_permit',
        'complete_address',
        'latitude',
        'longitude',
        'status',
        'open_time',
        'close_time',
        'user_name',   // Make sure this is here
        'password',    // 🛑 CRITICAL: Added password so auth can read it
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function doctors(): BelongsToMany
    {
        return $this->belongsToMany(Doctor::class, 'clinic_doctor', 'clinic_id', 'doctor_id')
            ->withPivot(['compensation_type', 'compensation_rate'])
            ->withTimestamps();
    }

    public function services(): HasMany
    {
        return $this->hasMany(
            ClinicService::class,
            'clinic_id',
            'id'
        );
    }

    public function patients(): BelongsToMany
    {
        return $this->belongsToMany(Patient::class, 'patient_clinic', 'clinic_id', 'patient_id')
            ->withTimestamps();
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(ClinicSubscription::class);
    }

    public function currentSubscription(): ?ClinicSubscription
    {
        return $this->subscriptions()
            ->with('plan')
            ->where('status', 'active')
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>', now())
            ->latest('starts_at')
            ->first();
    }

    public function hasPlanFeature(string $feature): bool
    {
        return in_array(
            $feature,
            $this->currentSubscription()?->plan?->features ?? [],
            true,
        );
    }

    public function planLimit(string $limit): ?int
    {
        $value = $this->currentSubscription()?->plan?->limits[$limit] ?? null;

        return $value === null ? null : (int) $value;
    }

    public function scopeFilter(
        Builder $query,
        array $filters
    ): Builder {
        return $query->when(
            $filters['search'] ?? null,
            function (Builder $query, $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query
                        ->where('clinic_name', 'like', "%{$search}%")
                        ->orWhere('clinic_permit', 'like', "%{$search}%")
                        ->orWhere('complete_address', 'like', "%{$search}%")
                        ->orWhereHas('doctors', function (Builder $query) use ($search) { // Fixed typo 'doctor' to 'doctors' relation
                            $query
                                ->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        });
                });
            }
        );
    }
}
