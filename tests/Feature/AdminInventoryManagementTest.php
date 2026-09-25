<?php

use App\Models\Clinic;
use App\Models\ClinicDrug;
use App\Models\ClinicMedicalProduct;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\DrugCategory;
use App\Models\DrugForm;
use App\Models\MedicalProduct;
use App\Models\MedicalProductCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function makeInventoryAdmin(): User
{
    return User::factory()->create(['is_admin' => true]);
}

function createInventoryTestClinic(): Clinic
{
    return Clinic::query()->create([
        'clinic_name' => 'Inventory Test Clinic',
        'clinic_permit' => 'INV-TEST-001',
        'complete_address' => 'Test clinic address',
        'status' => 'Approved',
        'user_name' => 'inventory-test-clinic',
        'password' => Hash::make('password'),
    ]);
}

it('lets an admin create, update, and delete drugs and medical products', function () {
    $this->actingAs(makeInventoryAdmin(), 'admin');

    $this->post(route('admin.inventory.drugs.store'), [
        'name' => 'Paracetamol',
        'category' => 'Analgesic',
        'form' => 'Tablet',
        'manufacturer' => 'Example Pharma',
        'strength' => '500mg',
        'sku' => 'PARA-500',
        'unit_name' => 'Tablet',
        'conversion_quantity' => 1,
        'sale_price' => 100,
        'is_active' => true,
    ])->assertRedirect(route('admin.inventory.drugs'));

    $drug = Drug::query()->where('sku', 'PARA-500')->firstOrFail();
    expect($drug->units()->where('is_default', true)->value('unit_name'))->toBe('Tablet');

    $this->put(route('admin.inventory.drugs.update', $drug), [
        'name' => 'Paracetamol Forte',
        'category' => 'Analgesic',
        'form' => 'Tablet',
        'manufacturer' => 'Example Pharma',
        'strength' => '650mg',
        'sku' => 'PARA-650',
        'unit_name' => 'Tablet',
        'conversion_quantity' => 1,
        'sale_price' => 125,
        'is_active' => true,
    ])->assertRedirect(route('admin.inventory.drugs'));

    $this->post(route('admin.inventory.medical-products.store'), [
        'name' => 'Surgical Gloves',
        'category' => 'Protective Equipment',
        'sku' => 'GLOVE-001',
        'is_active' => true,
    ])->assertRedirect(route('admin.inventory.medical-products'));

    $product = MedicalProduct::query()->where('sku', 'GLOVE-001')->firstOrFail();
    $this->put(route('admin.inventory.medical-products.update', $product), [
        'name' => 'Nitrile Surgical Gloves',
        'category' => 'Protective Equipment',
        'sku' => 'GLOVE-002',
        'is_active' => true,
    ])->assertRedirect(route('admin.inventory.medical-products'));

    $this->delete(route('admin.inventory.drugs.destroy', $drug))
        ->assertRedirect(route('admin.inventory.drugs'));
    $this->delete(route('admin.inventory.medical-products.destroy', $product))
        ->assertRedirect(route('admin.inventory.medical-products'));

    $this->assertDatabaseMissing('drugs', ['id' => $drug->id]);
    $this->assertDatabaseMissing('medical_products', ['id' => $product->id]);
});

it('assigns drug batches and medical product quantities to a clinic and reports them', function () {
    $this->actingAs(makeInventoryAdmin(), 'admin');
    $clinic = createInventoryTestClinic();

    $drugCategory = DrugCategory::query()->create(['name' => 'Antibiotic']);
    $drugForm = DrugForm::query()->create(['name' => 'Capsule']);
    $drug = Drug::query()->create([
        'drug_category_id' => $drugCategory->id,
        'drug_form_id' => $drugForm->id,
        'name' => 'Amoxicillin',
        'strength' => '250mg',
        'is_active' => true,
    ]);

    $this->post(route('admin.inventory.stock.allocate'), [
        'clinic_id' => $clinic->id,
        'stock_type' => 'drug',
        'item_id' => $drug->id,
        'quantity' => 40,
        'batch_number' => 'AMX-LOT-01',
        'expiry_date' => today()->addYear()->toDateString(),
        'purchase_price' => 30,
        'reference' => 'Opening stock',
    ])->assertRedirect(route('admin.inventory.stock'));

    $this->post(route('admin.inventory.stock.allocate'), [
        'clinic_id' => $clinic->id,
        'stock_type' => 'drug',
        'item_id' => $drug->id,
        'quantity' => 10,
        'batch_number' => 'AMX-LOT-01',
        'expiry_date' => today()->addYear()->toDateString(),
        'purchase_price' => 30,
    ])->assertRedirect(route('admin.inventory.stock'));

    $productCategory = MedicalProductCategory::query()->create(['name' => 'Equipment']);
    $product = MedicalProduct::query()->create([
        'medical_product_category_id' => $productCategory->id,
        'name' => 'Bandage',
        'is_active' => true,
    ]);

    $this->post(route('admin.inventory.stock.allocate'), [
        'clinic_id' => $clinic->id,
        'stock_type' => 'medical_product',
        'item_id' => $product->id,
        'quantity' => 15,
        'sale_price' => 200,
        'reference' => 'Opening stock',
    ])->assertRedirect(route('admin.inventory.stock'));

    $this->put(route('admin.inventory.drugs.update', $drug), [
        'name' => 'Amoxicillin',
        'category' => 'Antibiotic',
        'form' => 'Capsule',
        'strength' => '250mg',
        'sku' => '',
        'unit_name' => 'Capsule',
        'conversion_quantity' => 1,
        'sale_price' => 50,
        'is_active' => false,
    ])->assertRedirect(route('admin.inventory.drugs'));

    $this->put(route('admin.inventory.medical-products.update', $product), [
        'name' => 'Bandage',
        'category' => 'Equipment',
        'sku' => '',
        'is_active' => false,
    ])->assertRedirect(route('admin.inventory.medical-products'));

    expect(DrugBatch::query()->where('clinic_id', $clinic->id)->where('drug_id', $drug->id)->value('quantity'))->toBe(50)
        ->and(ClinicDrug::query()->where('clinic_id', $clinic->id)->where('drug_id', $drug->id)->value('is_active'))->toBeFalse()
        ->and(ClinicMedicalProduct::query()->where('clinic_id', $clinic->id)->where('medical_product_id', $product->id)->value('quantity'))->toBe(15)
        ->and(ClinicMedicalProduct::query()->where('clinic_id', $clinic->id)->where('medical_product_id', $product->id)->value('is_active'))->toBeFalse();

    $this->get(route('admin.inventory.reports'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/inventory/reports')
            ->has('summary', 2));

    $this->get(route('admin.inventory.reports.drugs', ['clinic_id' => $clinic->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/inventory/reports/drugs')
            ->where('drugUnitTotal', 50)
            ->has('batches.data', 1));

    $this->get(route('admin.inventory.reports.medical-products', ['clinic_id' => $clinic->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/inventory/reports/medical-products')
            ->where('medicalProductUnitTotal', 15)
            ->has('medicalStock.data', 1));

    $this->get(route('admin.inventory.reports.movements', ['clinic_id' => $clinic->id, 'item_type' => 'drug']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/inventory/reports/movements')
            ->has('transactions.data', 2));

    $this->get(route('admin.reservations.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/inventory/reports/reservations')
            ->has('reservations.data'));

    $this->get(route('admin.doctors.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/inventory/reports/doctors')
            ->has('doctors.data'));

    $this->get(route('admin.patients.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/inventory/reports/patients')
            ->has('patients.data'));

    $this->get(route('admin.inventory.reports.reservation-charges'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/inventory/reports/revenue')
            ->where('reportType', 'reservation_charges')
            ->where('total', 0)
            ->has('rows.data'));

    $this->get(route('admin.inventory.reports.reservation-payments'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/inventory/reports/revenue')
            ->where('reportType', 'reservation_payments')
            ->where('total', 0)
            ->has('rows.data'));

    $this->get(route('admin.inventory.reports.prescription-sales'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/inventory/reports/revenue')
            ->where('reportType', 'prescription_sales')
            ->where('total', 0)
            ->has('rows.data'));

    $this->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard/dashboard')
            ->has('summary', 9)
            ->has('financialSummary', 3)
            ->has('reservationTrend', 6)
            ->has('revenueTrend', 6)
            ->has('reservationStatuses')
            ->has('clinicStatuses', 1)
            ->has('clinics', 1)
            ->has('reservations')
            ->has('inventoryMovements', 3));
});
