<?php

use App\Models\Clinic;
use App\Models\ClinicDrug;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\DrugCategory;
use App\Models\DrugForm;
use App\Models\DrugUnit;
use App\Models\Manufacturer;
use App\Pharmacy\CheckoutSaleAction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('checkout deducts non-expired batches in FEFO order and writes movements', function () {
    $clinic = Clinic::create(['clinic_name' => 'Test Clinic', 'clinic_permit' => 'P-1', 'complete_address' => 'Yangon', 'status' => 'Approved', 'user_name' => 'test-clinic', 'password' => 'secret']);
    $drug = Drug::create(['drug_category_id' => DrugCategory::create(['name' => 'Pain'])->id, 'drug_form_id' => DrugForm::create(['name' => 'Tablet'])->id, 'manufacturer_id' => Manufacturer::create(['name' => 'Maker'])->id, 'name' => 'Paracetamol']);
    $unit = DrugUnit::create(['drug_id' => $drug->id, 'unit_name' => 'Tablet', 'conversion_quantity' => 1, 'sale_price' => 120, 'is_default' => true, 'is_active' => true]);
    ClinicDrug::create(['clinic_id' => $clinic->id, 'drug_id' => $drug->id, 'is_active' => true]);
    $firstBatch = DrugBatch::create(['clinic_id' => $clinic->id, 'drug_id' => $drug->id, 'batch_number' => 'EARLY', 'expiry_date' => today()->addMonth(), 'purchase_price' => 80, 'quantity' => 3]);
    $secondBatch = DrugBatch::create(['clinic_id' => $clinic->id, 'drug_id' => $drug->id, 'batch_number' => 'LATE', 'expiry_date' => today()->addMonths(2), 'purchase_price' => 80, 'quantity' => 10]);
    DrugBatch::create(['clinic_id' => $clinic->id, 'drug_id' => $drug->id, 'batch_number' => 'EXPIRED', 'expiry_date' => today()->subDay(), 'purchase_price' => 80, 'quantity' => 100]);

    $sale = app(CheckoutSaleAction::class)->execute($clinic->id, ['sale_type' => 'external', 'payment_method' => 'Cash', 'items' => [['item_type' => 'drug', 'drug_id' => $drug->id, 'drug_unit_id' => $unit->id, 'description' => 'Paracetamol', 'quantity' => 5, 'unit_price' => 120]]]);

    expect($sale->total)->toEqual('600.00');
    expect($firstBatch->fresh()->quantity)->toBe(0);
    expect($secondBatch->fresh()->quantity)->toBe(8);
    $this->assertDatabaseCount('inventory_transactions', 2);
});
