<?php

use App\Models\Clinic;
use App\Models\PaymentMethod;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('payment methods show only the supported methods and can be activated or deactivated', function () {
    $clinic = Clinic::create([
        'clinic_name' => 'Test Clinic',
        'clinic_permit' => 'P-1',
        'complete_address' => 'Yangon',
        'status' => 'Approved',
        'user_name' => 'test-clinic',
        'password' => 'secret',
    ]);

    $cash = PaymentMethod::create(['name' => 'Cash', 'status' => 'Active']);
    PaymentMethod::create(['name' => 'KBZPay', 'status' => 'Active']);
    PaymentMethod::create(['name' => 'Wave Money', 'status' => 'Inactive']);
    PaymentMethod::create(['name' => 'CB Pay', 'status' => 'Active']);

    $response = $this->actingAs($clinic, 'clinic')->get(route('payment-methods.index'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('payment-methods/index')
        ->has('paymentMethods', 3)
        ->where('paymentMethods.0.name', 'Cash')
        ->where('paymentMethods.1.name', 'KBZPay')
        ->where('paymentMethods.2.name', 'Wave Money'));

    $this->put(route('payment-methods.update', $cash), ['status' => 'Inactive'])
        ->assertRedirect();

    expect($cash->fresh()->status)->toBe('Inactive');
});

test('the transaction report can be viewed separately from payment methods', function () {
    $clinic = Clinic::create([
        'clinic_name' => 'Test Clinic',
        'clinic_permit' => 'P-2',
        'complete_address' => 'Yangon',
        'status' => 'Approved',
        'user_name' => 'report-clinic',
        'password' => 'secret',
    ]);

    $response = $this->actingAs($clinic, 'clinic')->get(route('payments.index'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('payment-report/index')
        ->has('payments.data', 0));
});
