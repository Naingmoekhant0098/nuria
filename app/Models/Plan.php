<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    /** @var array<string, string> */
    public const FEATURE_CATALOG = [
        'doctors' => 'Doctor management',
        'schedules' => 'Doctor schedules',
        'patients' => 'Patient management',
        'services' => 'Clinic services',
        'reservations' => 'Reservations',
        'consultations' => 'Consultations',
        'medical_records' => 'Medical records',
        'pharmacy' => 'Pharmacy and inventory',
        'online_orders' => 'Online orders',
        'plans_subscription' => 'Plans & subscription',
        'reports' => 'Reports',
        'finance' => 'Payments and finance',
    ];

    /** @var array<string, string> */
    public const LIMIT_CATALOG = [
        'doctors' => 'Maximum doctors',
        'patients' => 'Maximum patients',
        'monthly_reservations' => 'Reservations per month',
    ];

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'duration_days',
        'features',
        'limits',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration_days' => 'integer',
            'features' => 'array',
            'limits' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(ClinicSubscription::class);
    }
}
