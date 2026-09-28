<?php

namespace App\Http\Middleware;

use App\Models\Clinic;
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
