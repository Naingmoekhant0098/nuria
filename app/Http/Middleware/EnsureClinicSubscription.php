<?php

namespace App\Http\Middleware;

use App\Models\Clinic;
use App\Models\FeatureSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureClinicSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->routeIs('clinic.plans.index', 'clinic.plans.subscribe', 'clinic.subscription.show')) {
            return $next($request);
        }

        if (! FeatureSetting::isSubscriptionEnabled('plans_subscription')) {
            return $next($request);
        }

        $featureMiddleware = collect($request->route()?->gatherMiddleware() ?? [])
            ->first(fn (string $middleware): bool => str_starts_with($middleware, 'clinic.feature:'));

        if ($featureMiddleware !== null && ! FeatureSetting::isSubscriptionEnabled(substr($featureMiddleware, strlen('clinic.feature:')))) {
            return $next($request);
        }

        $clinic = $request->user('clinic') ?? $request->user();

        abort_unless($clinic instanceof Clinic, 403);

        if ($clinic->currentSubscription() !== null) {
            return $next($request);
        }

        return redirect()
            ->route('clinic.plans.index')
            ->with('error', 'Choose a plan to continue using the clinic system.');
    }
}
