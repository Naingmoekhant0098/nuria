<?php

namespace App\Http\Middleware;

use App\Models\Clinic;
use Illuminate\Http\Request;
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
        $user = $request->user('admin') ?? $request->user('clinic') ?? $request->user();

        $userData = null;
        $clinic = $request->user('clinic');
        $clinicSubscription = $clinic instanceof Clinic ? $clinic->currentSubscription() : null;

        if ($user) {
            // Check if it's a Clinic model or a regular User model
            $name = isset($user->clinic_name) ? $user->clinic_name : ($user->name ?? $user->user_name ?? 'User');

            $userData = [
                'id' => $user->id,
                'name' => $name,
                'email' => $user->user_name ?? $user->email ?? '',
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $userData,
                'permissions' => $request->user('admin')?->adminPermissions() ?? [],
                'features' => $clinicSubscription?->plan?->features ?? [],
                'subscription' => $clinicSubscription === null ? null : [
                    'plan_name' => $clinicSubscription->plan->name,
                    'ends_at' => $clinicSubscription->ends_at?->toIso8601String(),
                    'limits' => $clinicSubscription->plan->limits ?? [],
                ],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
