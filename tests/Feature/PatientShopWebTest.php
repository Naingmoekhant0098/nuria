<?php

use App\Models\Clinic;
use App\Models\ClinicMedicalProduct;
use App\Models\FeatureSetting;
use App\Models\MedicalProduct;
use App\Models\MedicalProductCategory;
use App\Models\Patient;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('requires a patient account before opening the cart', function () {
    $this->get(route('client.shop.cart'))
        ->assertRedirect(route('client.login'));
});

it('adds a medical product to the authenticated patient cart', function () {
    FeatureSetting::query()->create([
        'feature' => 'online_orders',
        'globally_enabled' => false,
        'subscription_enabled' => false,
    ]);

    $clinic = Clinic::query()->create([
        'clinic_name' => 'Cart Clinic',
        'clinic_permit' => 'PERMIT-'.fake()->unique()->numerify('#####'),
        'complete_address' => 'Test address',
        'status' => 'approved',
        'user_name' => 'clinic-'.fake()->unique()->numerify('#####'),
        'password' => 'password',
    ]);
    $patient = Patient::query()->create([
        'id' => 'P'.fake()->unique()->numerify('###'),
        'first_name' => 'Cart',
        'last_name' => 'Patient',
        'complete_address' => 'Test address',
        'contact_number' => '0900000000',
        'user_name' => 'patient-'.fake()->unique()->numerify('#####'),
        'status' => 'active',
        'password' => 'password',
        'email' => fake()->unique()->safeEmail(),
    ]);
    $category = MedicalProductCategory::query()->create(['name' => 'Test category']);
    $product = MedicalProduct::query()->create([
        'medical_product_category_id' => $category->id,
        'name' => 'Test product',
        'is_active' => true,
    ]);
    ClinicMedicalProduct::query()->create([
        'clinic_id' => $clinic->id,
        'medical_product_id' => $product->id,
        'quantity' => 5,
        'sale_price' => 1000,
        'is_active' => true,
    ]);

    $this->actingAs($patient, 'patient')
        ->post(route('client.shop.cart.add'), [
            'clinic_id' => $clinic->id,
            'item_type' => 'medical_product',
            'item_id' => $product->id,
            'quantity' => 1,
        ])
        ->assertRedirect();

    expect($patient->cartItems()->where('medical_product_id', $product->id)->value('quantity'))->toBe(1);
});
