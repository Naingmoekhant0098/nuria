<?php

namespace App\Http\Middleware;

use App\Models\Clinic;
use App\Models\FeatureSetting;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $patient = $request->user('patient');
        $user = $request->user('admin') ?? $request->user('clinic') ?? $patient ?? $request->user();

        $userData = null;
        $clinic = $request->user('clinic');
        $clinicSubscription = $clinic instanceof Clinic ? $clinic->currentSubscription() : null;

        if ($user) {
            // Check if it's a Clinic model or a regular User model
            $name = isset($user->clinic_name)
                ? $user->clinic_name
                : ($user->name ?? trim(($user->first_name ?? '').' '.($user->last_name ?? '')) ?: ($user->user_name ?? 'User'));

            $userData = [
                'id' => $user->id,
                'name' => $name,
                'email' => $user->email ?? $user->user_name ?? '',
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $userData,
                'permissions' => $request->user('admin')?->adminPermissions() ?? [],
                'features' => $clinicSubscription?->plan?->features ?? [],
                'globallyEnabledFeatures' => Schema::hasTable('feature_settings')
                    ? FeatureSetting::query()->where('globally_enabled', true)->pluck('feature')->values()
                    : collect(),
                'subscriptionDisabledFeatures' => Schema::hasTable('feature_settings')
                    && Schema::hasColumn('feature_settings', 'subscription_enabled')
                    ? FeatureSetting::query()->where('subscription_enabled', false)->pluck('feature')->values()
                    : collect(),
                'subscription' => $clinicSubscription === null ? null : [
                    'plan_name' => $clinicSubscription->plan->name,
                    'ends_at' => $clinicSubscription->ends_at?->toIso8601String(),
                    'limits' => $clinicSubscription->plan->limits ?? [],
                ],
            ],
            'featureCatalog' => Plan::FEATURE_CATALOG,
            'cartCount' => Schema::hasTable('patient_cart_items') && $patient
                ? $patient->cartItems()->sum('quantity')
                : 0,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
