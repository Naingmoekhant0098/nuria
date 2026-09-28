<?php

namespace App\Http\Controllers\Admin;

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

class ClinicSubscriptionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/subscriptions/index', [
            'subscriptions' => ClinicSubscription::query()
                ->with(['clinic:id,clinic_name,user_name', 'plan:id,name,price,duration_days'])
                ->latest()
                ->paginate(25),
        ]);
    }

    public function review(Request $request, ClinicSubscription $subscription): RedirectResponse
    {
        $data = $request->validate([
            'decision' => ['required', 'in:approve,reject'],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($data, $request, $subscription): void {
            $lockedSubscription = ClinicSubscription::query()
                ->whereKey($subscription->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedSubscription->status !== 'pending') {
                throw ValidationException::withMessages([
                    'decision' => ['This request has already been reviewed.'],
                ]);
            }

            if ($data['decision'] === 'approve') {
                $plan = Plan::query()->whereKey($lockedSubscription->plan_id)->firstOrFail();

                if (! $plan->is_active) {
                    throw ValidationException::withMessages([
                        'decision' => ['Activate this plan before approving the request.'],
                    ]);
                }

                Clinic::query()->whereKey($lockedSubscription->clinic_id)->lockForUpdate()->firstOrFail();
                ClinicSubscription::query()
                    ->where('clinic_id', $lockedSubscription->clinic_id)
                    ->where('status', 'active')
                    ->where('ends_at', '>', now())
                    ->lockForUpdate()
                    ->get()
                    ->each(fn (ClinicSubscription $activeSubscription) => $activeSubscription->update([
                        'status' => 'expired',
                        'ends_at' => now(),
                    ]));

                $lockedSubscription->update([
                    'status' => 'active',
                    'starts_at' => now(),
                    'ends_at' => now()->addDays($plan->duration_days),
                    'price' => $plan->price,
                    'reviewed_by' => $request->user('admin')->id,
                    'reviewed_at' => now(),
                    'admin_note' => $data['admin_note'] ?? null,
                ]);

                return;
            }

            $lockedSubscription->update([
                'status' => 'rejected',
                'reviewed_by' => $request->user('admin')->id,
                'reviewed_at' => now(),
                'admin_note' => $data['admin_note'] ?? null,
            ]);
        });

        return to_route('admin.subscriptions.index')->with('success', 'Subscription request reviewed.');
    }
}
