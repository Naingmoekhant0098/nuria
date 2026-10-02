<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FeatureSetting;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeatureSettingController extends Controller
{
    public function index(): Response
    {
        $settings = FeatureSetting::query()->pluck('globally_enabled', 'feature');
        $subscriptionSettings = FeatureSetting::query()->pluck('subscription_enabled', 'feature');

        return Inertia::render('admin/settings/features', [
            'features' => collect(['plans_subscription' => Plan::FEATURE_CATALOG['plans_subscription']])->map(fn (string $label, string $key): array => [
                'key' => $key,
                'label' => $label,
                'globally_enabled' => (bool) ($settings[$key] ?? false),
                'subscription_enabled' => (bool) ($subscriptionSettings[$key] ?? true),
            ])->values(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'features' => ['nullable', 'array'],
            'features.*' => ['boolean'],
            'subscription_enabled' => ['nullable', 'array'],
            'subscription_enabled.*' => ['boolean'],
        ]);

        $usesLegacyPayload = ! array_key_exists('subscription_enabled', $data);
        $featureValues = $data['subscription_enabled'] ?? $data['features'] ?? [];

        foreach ($featureValues as $feature => $value) {
            if (! array_key_exists($feature, Plan::FEATURE_CATALOG)) {
                continue;
            }

            FeatureSetting::query()->updateOrCreate(
                ['feature' => $feature],
                [
                    'globally_enabled' => $usesLegacyPayload
                        ? (bool) $value
                        : false,
                    'subscription_enabled' => (bool) $value,
                ],
            );
        }

        return back()->with('success', 'Feature access settings updated.');
    }
}
