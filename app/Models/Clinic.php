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
