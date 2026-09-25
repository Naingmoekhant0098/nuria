<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'doctor_id', 'is_admin', 'admin_role'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    protected string $guard_name = 'admin';

    /** @return array<string, array{label: string, permissions: list<string>}> */
    public static function adminRoles(): array
    {
        return [
            'super_admin' => [
                'label' => 'Super admin',
                'permissions' => ['dashboard.view', 'clinics.manage', 'admins.manage', 'doctors.view', 'patients.view', 'reservations.view', 'inventory.manage', 'reports.view', 'finance.view', 'roles.manage', 'permissions.view', 'orders.manage'],
            ],
            'operations_manager' => [
                'label' => 'Operations manager',
                'permissions' => ['dashboard.view', 'clinics.manage', 'doctors.view', 'patients.view', 'reservations.view', 'reports.view', 'finance.view', 'orders.manage'],
            ],
            'inventory_manager' => [
                'label' => 'Inventory manager',
                'permissions' => ['dashboard.view', 'inventory.manage', 'reports.view'],
            ],
            'report_viewer' => [
                'label' => 'Report viewer',
                'permissions' => ['dashboard.view', 'doctors.view', 'patients.view', 'reservations.view', 'reports.view', 'finance.view'],
            ],
        ];
    }

    /** @return array<string, string> */
    public static function adminPermissionLabels(): array
    {
        return [
            'dashboard.view' => 'View dashboard',
            'clinics.manage' => 'Manage clinics',
            'admins.manage' => 'Manage admin accounts',
            'doctors.view' => 'View doctors',
            'patients.view' => 'View patients',
            'reservations.view' => 'View reservations',
            'inventory.manage' => 'Manage drug and medical product inventory',
            'reports.view' => 'View inventory reports',
            'finance.view' => 'View financial reports',
            'roles.manage' => 'Manage roles and role permissions',
            'permissions.view' => 'View permission catalog',
            'orders.manage' => 'View and manage online orders',
        ];
    }

    /** @return list<string> */
    public function adminPermissions(): array
    {
        if (! $this->is_admin) {
            return [];
        }

        if (! $this->roles()->exists()) {
            return self::adminRoles()[$this->admin_role ?? '']['permissions'] ?? [];
        }

        return $this->getAllPermissions()->pluck('name')->values()->all();
    }

    public function hasAdminPermission(string $permission): bool
    {
        return $this->is_admin && in_array($permission, $this->adminPermissions(), true);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    public function scopeFilter(Builder $query, array $filters): void
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        });
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_admin' => 'boolean',
            'password' => 'hashed',
        ];
    }
}
