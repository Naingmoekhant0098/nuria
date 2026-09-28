<?php

namespace App\Http\Middleware;

use App\Models\Clinic;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureClinicFeature
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $clinic = $request->user('clinic') ?? $request->user();

        abort_unless($clinic instanceof Clinic, 403);

        if ($clinic->hasPlanFeature($feature)) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            abort(403, 'Your current plan does not include this feature.');
        }

        return redirect()
            ->route('clinic.plans.index')
            ->with('error', 'Your current plan does not include that feature.');
    }
}
