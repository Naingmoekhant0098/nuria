<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicSubscription;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var Clinic $clinic */
        $clinic = $request->user('clinic');

        return Inertia::render('clinic/plans/index', [
            'plans' => Plan::query()
                ->where('is_active', true)
                ->orderBy('price')
                ->get(['id', 'name', 'description', 'price', 'duration_days', 'features', 'limits']),
            'currentSubscription' => $clinic->currentSubscription()?->load('plan'),
            'subscriptions' => $clinic->subscriptions()
                ->with('plan:id,name')
                ->latest()
                ->limit(10)
                ->get(),
            'featureCatalog' => Plan::FEATURE_CATALOG,
            'limitCatalog' => Plan::LIMIT_CATALOG,
            'paymentInstructions' => config('plans.payment_instructions'),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }

    public function subscribe(Request $request, Plan $plan): RedirectResponse
    {
        abort_unless($plan->is_active, 404);

        $data = $request->validate([
            'payment_reference' => ['nullable', 'string', 'max:255'],
            'payment_proof' => [
                $plan->price > 0 ? 'required' : 'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        /** @var Clinic $clinic */
        $clinic = $request->user('clinic');

        DB::transaction(function () use ($clinic, $data, $plan, $request): void {
            Clinic::query()->whereKey($clinic->id)->lockForUpdate()->firstOrFail();

            if ($clinic->subscriptions()->where('status', 'pending')->exists()) {
                throw ValidationException::withMessages([
                    'plan' => ['You already have a plan request waiting for review.'],
                ]);
            }

            $activeNow = $clinic->currentSubscription();

            $subscription = ClinicSubscription::query()->create([
                'clinic_id' => $clinic->id,
                'plan_id' => $plan->id,
                'status' => $plan->price > 0 ? 'pending' : 'active',
                'starts_at' => $plan->price > 0 ? null : now(),
                'ends_at' => $plan->price > 0 ? null : now()->addDays($plan->duration_days),
                'price' => $plan->price,
                'payment_reference' => $data['payment_reference'] ?? null,
                'payment_proof_path' => $request->hasFile('payment_proof')
                    ? $request->file('payment_proof')->store('plan-payment-proofs', 'public')
                    : null,
                'reviewed_at' => $plan->price > 0 ? null : now(),
            ]);

            if ($plan->price <= 0 && $activeNow !== null) {
                $activeNow->update([
                    'status' => 'expired',
                    'ends_at' => now(),
                ]);
            }
        });

        return to_route('clinic.plans.index')->with(
            'success',
            $plan->price > 0
                ? 'Plan request sent. Admin will review your payment.'
                : 'Free plan activated.',
        );
    }
}
