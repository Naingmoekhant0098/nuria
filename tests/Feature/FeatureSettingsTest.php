<?php

use App\Models\Clinic;
use App\Models\FeatureSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows an admin to open a feature globally', function () {
    $admin = User::factory()->create(['is_admin' => true, 'admin_role' => 'super_admin']);

    $this->actingAs($admin, 'admin')
        ->put(route('admin.settings.features.update'), ['features' => ['online_orders' => true]])
        ->assertRedirect();

    expect((bool) FeatureSetting::query()->where('feature', 'online_orders')->value('globally_enabled'))->toBeTrue();
});

it('allows an admin to turn subscription plan access off for a feature', function () {
    $admin = User::factory()->create(['is_admin' => true, 'admin_role' => 'super_admin']);

    $this->actingAs($admin, 'admin')
        ->put(route('admin.settings.features.update'), [
            'subscription_enabled' => ['online_orders' => false],
        ])
        ->assertRedirect();

    $clinic = Clinic::query()->create([
        'clinic_name' => 'Free Access Clinic',
        'clinic_permit' => 'PERMIT-'.fake()->unique()->numerify('#####'),
        'complete_address' => 'Test address',
        'status' => 'approved',
        'user_name' => 'clinic-'.fake()->unique()->numerify('#####'),
        'password' => 'password',
    ]);

    expect(FeatureSetting::isSubscriptionEnabled('online_orders'))->toBeFalse()
        ->and($clinic->hasPlanFeature('online_orders'))->toBeTrue();
});

it('disables subscription checks for every clinic when plans and subscription is off', function () {
    $admin = User::factory()->create(['is_admin' => true, 'admin_role' => 'super_admin']);

    $this->actingAs($admin, 'admin')
        ->put(route('admin.settings.features.update'), [
            'subscription_enabled' => ['plans_subscription' => false, 'online_orders' => true],
        ])
        ->assertRedirect();

    $clinic = Clinic::query()->create([
        'clinic_name' => 'All Free Clinic',
        'clinic_permit' => 'PERMIT-'.fake()->unique()->numerify('#####'),
        'complete_address' => 'Test address',
        'status' => 'approved',
        'user_name' => 'clinic-'.fake()->unique()->numerify('#####'),
        'password' => 'password',
    ]);

    expect($clinic->hasPlanFeature('online_orders'))->toBeTrue()
        ->and($clinic->hasPlanFeature('finance'))->toBeTrue();
});
