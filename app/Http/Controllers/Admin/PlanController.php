<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/plans/index', [
            'plans' => Plan::query()
                ->withCount('subscriptions')
                ->orderBy('price')
                ->get(),
            'featureCatalog' => Plan::FEATURE_CATALOG,
            'limitCatalog' => Plan::LIMIT_CATALOG,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedPlanData($request);
        $plan = Plan::query()->create([
            ...$data,
            'slug' => Str::slug($data['name']),
            'limits' => array_filter($data['limits'] ?? [], fn ($value): bool => $value !== null),
        ]);

        $plan->update(['slug' => Str::slug($data['name']).'-'.$plan->id]);

        return to_route('admin.plans.index')->with('success', 'Plan created.');
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $data = $this->validatedPlanData($request, $plan);
        $plan->update([
            ...$data,
            'limits' => array_filter($data['limits'] ?? [], fn ($value): bool => $value !== null),
        ]);

        return to_route('admin.plans.index')->with('success', 'Plan updated.');
    }

    /** @return array{name: string, description: ?string, price: string, duration_days: int, features: list<string>, limits: array<string, int|null>, is_active: bool} */
    private function validatedPlanData(Request $request, ?Plan $plan = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_days' => ['required', 'integer', 'min:1', 'max:3650'],
            'features' => ['present', 'array'],
            'features.*' => ['string', Rule::in(array_keys(Plan::FEATURE_CATALOG))],
            'limits' => ['nullable', 'array'],
            'limits.doctors' => ['nullable', 'integer', 'min:1'],
            'limits.patients' => ['nullable', 'integer', 'min:1'],
            'limits.monthly_reservations' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['required', 'boolean'],
        ]);
    }
}
