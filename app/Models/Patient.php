<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Patient extends Model
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

        'birthdate',

        'complete_address',
        'contact_number',

        'user_name',
        'status',

        'nrc_id',
        'nrc_number',
    ];

    protected $casts = [
        'birthdate' => 'date',
    ];

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

    public function reservations()
    {
        return $this->hasMany(
            Reservation::class,
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
