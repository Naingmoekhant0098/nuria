<?php

use App\Models\Clinic;
use App\Models\Sale;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('stock report is scoped to the authenticated clinic', function () {
    $clinic = Clinic::create([
        'clinic_name' => 'Report Clinic',
        'clinic_permit' => 'R-1',
        'complete_address' => 'Yangon',
        'status' => 'Approved',
        'user_name' => 'report-clinic',
        'password' => 'secret',
    ]);

    $this->actingAs($clinic, 'clinic')
        ->get(route('reports.stock'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/stock')
            ->where('summary.available_drug_units', 0)
            ->where('summary.medical_product_units', 0));
});

test('operations report only includes the authenticated clinic sales', function () {
    $clinic = Clinic::create([
        'clinic_name' => 'Report Clinic',
        'clinic_permit' => 'R-1',
        'complete_address' => 'Yangon',
        'status' => 'Approved',
        'user_name' => 'report-clinic',
        'password' => 'secret',
    ]);
    $otherClinic = Clinic::create([
        'clinic_name' => 'Other Clinic',
        'clinic_permit' => 'R-2',
        'complete_address' => 'Mandalay',
        'status' => 'Approved',
        'user_name' => 'other-clinic',
        'password' => 'secret',
    ]);
    Sale::create([
        'clinic_id' => $clinic->id,
        'sale_type' => 'external',
        'subtotal' => 1500,
        'discount' => 0,
        'tax' => 0,
        'total' => 1500,
        'payment_method' => 'Cash',
        'payment_status' => 'Paid',
    ]);
    Sale::create([
        'clinic_id' => $otherClinic->id,
        'sale_type' => 'external',
        'subtotal' => 900,
        'discount' => 0,
        'tax' => 0,
        'total' => 900,
        'payment_method' => 'Cash',
        'payment_status' => 'Paid',
    ]);

    $this->actingAs($clinic, 'clinic')
        ->get(route('reports.operations'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/operations')
            ->where('summary.sales_count', 1)
            ->where('recentSales.0.total', '1500.00'));
});
