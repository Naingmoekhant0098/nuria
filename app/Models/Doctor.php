<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class Doctor extends Model
{
    use HasApiTokens, Notifiable;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'first_name',
        'middle_name',
        'last_name',
        'specialization_id',
        'complete_address',
        'contact_number',
        'proof_of_identity',
        'photo_path',
        'user_name',
        'nrc_number',
        'nrc_id',
        'email',
        'password',
        'status',
        'clinic_id',
    ];

    protected $hidden = [
        'password',
    ];

    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path === null
            ? null
            : Storage::disk('public')->url($this->photo_path);
    }

    public function specialization(): BelongsTo
    {
        return $this->belongsTo(Specialization::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    public function nrc(): BelongsTo
    {
        return $this->belongsTo(
            Nrc::class,
            'nrc_id'
        );
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(
            Reservation::class,
            'doctor_id',
            'id'
        );
    }

    public function clinics(): BelongsToMany
    {
        return $this->belongsToMany(Clinic::class, 'clinic_doctor', 'doctor_id', 'clinic_id')
            ->withPivot(['compensation_type', 'compensation_rate'])
            ->withTimestamps();
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
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('user_name', 'like', "%{$search}%");
                });
            }
        );
    }
}
