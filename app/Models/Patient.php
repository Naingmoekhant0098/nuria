<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class Patient extends Authenticatable
{
    use HasApiTokens, Notifiable;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'email',
        'password',

        'first_name',
        'middle_name',
        'last_name',

        'birthdate',
        'gender',

        'complete_address',
        'region',
        'contact_number',

        'user_name',
        'status',

        'nrc_id',
        'nrc_number',
        'photo_path',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'password' => 'hashed',
    ];

    protected $hidden = [
        'password',
    ];

    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute(): ?string
    {
        if ($this->photo_path === null) {
            return null;
        }

        return str_starts_with($this->photo_path, 'http') || str_starts_with($this->photo_path, '/')
            ? $this->photo_path
            : Storage::disk('public')->url($this->photo_path);
    }

    /**
     * Patient's NRC
     */
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
            'patient_id',
            'id'
        );
    }

    public function sales(): HasMany
    {
        return $this->hasMany(
            Sale::class,
            'patient_id',
            'id'
        );
    }

    public function clinics(): BelongsToMany
    {
        return $this->belongsToMany(Clinic::class, 'patient_clinic', 'patient_id', 'clinic_id')
            ->withTimestamps();
    }

    public function medicalRecords()
    {
        return $this->hasMany(
            MedicalRecord::class,
            'patient_id',
            'id'
        );
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'patient_id', 'id');
    }

    /**
     * Patient's User account
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    /**
     * Search / Filter
     */
    public function scopeFilter(
        Builder $query,
        array $filters
    ): Builder {
        return $query->when(
            $filters['search'] ?? null,
            function (Builder $query, $search) {
                $query->where(function (Builder $query) use ($search) {
                    $query
                        ->where(
                            'first_name',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'middle_name',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'last_name',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'user_name',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'contact_number',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'nrc_number',
                            'like',
                            "%{$search}%"
                        );
                });
            }
        );
    }
}
