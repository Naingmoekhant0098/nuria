<?php

use App\Models\Clinic;
use App\Models\Sale;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $clinic = Clinic::create([
        'clinic_name' => 'Dashboard Clinic',
        'clinic_permit' => 'DASH-1',
        'complete_address' => 'Yangon',
        'status' => 'Approved',
        'user_name' => 'dashboard-clinic',
        'password' => 'secret',
    ]);

    $this->actingAs($clinic, 'clinic')
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('summary')
            ->has('trends')
            ->has('reservationStatuses')
            ->has('recentReservations')
            ->has('lowStock'));
});

test('dashboard metrics only include the signed in clinic data', function () {
    $clinic = Clinic::create([
        'clinic_name' => 'Clinic One',
        'clinic_permit' => 'DASH-1',
        'complete_address' => 'Yangon',
        'status' => 'Approved',
        'user_name' => 'clinic-one',
        'password' => 'secret',
    ]);
    $otherClinic = Clinic::create([
        'clinic_name' => 'Clinic Two',
        'clinic_permit' => 'DASH-2',
        'complete_address' => 'Mandalay',
        'status' => 'Approved',
        'user_name' => 'clinic-two',
        'password' => 'secret',
    ]);

    foreach ([[$clinic, 1500], [$otherClinic, 9000]] as [$saleClinic, $total]) {
        Sale::create([
            'clinic_id' => $saleClinic->id,
            'sale_type' => 'external',
            'subtotal' => $total,
            'discount' => 0,
            'tax' => 0,
            'total' => $total,
            'payment_method' => 'Cash',
            'payment_status' => 'Paid',
        ]);
    }

    $this->actingAs($clinic, 'clinic')
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('clinic.name', 'Clinic One')
            ->where('summary.revenue', 1500));
});
