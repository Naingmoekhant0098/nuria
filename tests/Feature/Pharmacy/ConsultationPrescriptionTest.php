<?php

use App\Actions\Consultations\CreateConsultationAction;
use App\Models\Clinic;
use App\Models\ClinicDrug;
use App\Models\ClinicMedicalProduct;
use App\Models\ClinicService;
use App\Models\Doctor;
use App\Models\DoctorClinicSchedule;
use App\Models\Drug;
use App\Models\DrugCategory;
use App\Models\DrugBatch;
use App\Models\DrugForm;
use App\Models\DrugUnit;
use App\Models\Manufacturer;
use App\Models\MedicalProduct;
use App\Models\MedicalProductCategory;
use App\Models\Patient;
use App\Models\Reservation;
use App\Models\Specialization;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PharmacyInventorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('consultation prescription items increase the reservation total and create sale items', function () {
    config()->set('auth.defaults.guard', 'clinic');

    $clinic = Clinic::create(['clinic_name' => 'Test Clinic', 'clinic_permit' => 'P-1', 'complete_address' => 'Yangon', 'status' => 'Approved', 'user_name' => 'test-clinic', 'password' => 'secret']);
    $this->actingAs($clinic, 'clinic');

    $specialization = Specialization::create(['name' => 'General', 'description' => 'General practice']);
    $doctor = Doctor::create(['id' => 'DOC-1', 'first_name' => 'Aye', 'last_name' => 'Chan', 'specialization_id' => $specialization->id, 'complete_address' => 'Yangon', 'email' => 'doctor@example.com', 'contact_number' => '09000000001', 'proof_of_identity' => 'ID', 'user_name' => 'doctor', 'status' => 'Active', 'password' => 'secret']);
    $patient = new Patient(['id' => 'PAT-1', 'first_name' => 'Mya', 'last_name' => 'Win', 'complete_address' => 'Yangon', 'contact_number' => '09000000002', 'user_name' => 'patient', 'status' => 'Active']);
    $patient->forceFill(['password' => 'secret', 'email' => 'patient@example.com'])->save();
    $service = ClinicService::create(['clinic_id' => $clinic->id, 'doctor_id' => $doctor->id, 'service_name' => 'Consultation', 'amount' => 1000]);
    $schedule = DoctorClinicSchedule::create(['clinic_id' => $clinic->id, 'doctor_id' => $doctor->id, 'day_of_week' => 'Monday', 'start_time' => '09:00', 'end_time' => '17:00']);
    $reservation = Reservation::create(['appointment_code' => 'APT-2026-0001', 'patient_id' => $patient->id, 'doctor_id' => $doctor->id, 'clinic_id' => $clinic->id, 'service_id' => $service->id, 'schedule_id' => $schedule->id, 'appointment_type' => 'In-Person', 'status' => 'Checked In', 'amount' => 1000]);

    $drug = Drug::create(['drug_category_id' => DrugCategory::create(['name' => 'Pain'])->id, 'drug_form_id' => DrugForm::create(['name' => 'Tablet'])->id, 'manufacturer_id' => Manufacturer::create(['name' => 'Maker'])->id, 'name' => 'Paracetamol']);
    $unit = DrugUnit::create(['drug_id' => $drug->id, 'unit_name' => 'Tablet', 'conversion_quantity' => 1, 'sale_price' => 120, 'is_default' => true, 'is_active' => true]);
    ClinicDrug::create(['clinic_id' => $clinic->id, 'drug_id' => $drug->id, 'is_active' => true, 'sale_price_override' => 150]);
    $drugBatch = DrugBatch::create(['clinic_id' => $clinic->id, 'drug_id' => $drug->id, 'batch_number' => 'B-1', 'expiry_date' => today()->addYear(), 'purchase_price' => 80, 'quantity' => 10]);
    $product = MedicalProduct::create(['medical_product_category_id' => MedicalProductCategory::create(['name' => 'Supply'])->id, 'name' => 'Bandage']);
    ClinicMedicalProduct::create(['clinic_id' => $clinic->id, 'medical_product_id' => $product->id, 'quantity' => 10, 'sale_price' => 200, 'is_active' => true]);

    $consultation = app(CreateConsultationAction::class)->execute(['appointment_code' => $reservation->appointment_code, 'date_of_consultation' => now(), 'diagnosis' => 'Pain', 'treatment' => 'Rest', 'payment_method' => 'KBZPay', 'items' => [['item_type' => 'drug', 'drug_id' => $drug->id, 'drug_unit_id' => $unit->id, 'quantity' => 2], ['item_type' => 'medical_product', 'medical_product_id' => $product->id, 'quantity' => 3]]]);

    expect($reservation->fresh()->amount)->toEqual('1900.00');
    expect($consultation->prescription)->not->toBeNull();
    expect($consultation->prescription->items)->toHaveCount(2);

    $sale = $consultation->prescription->fresh()->sales()->first();

    expect($sale->prescription_id)->toBe($consultation->prescription->id);
    expect($sale->items)->toHaveCount(2);
    expect($sale->total)->toEqual('900.00');
    expect($sale->payment_method)->toBe('KBZPay');
    expect($reservation->fresh()->status)->toBe('Checked Out');
    expect($drugBatch->fresh()->quantity)->toBe(8);
    expect(ClinicMedicalProduct::query()->where('clinic_id', $clinic->id)->where('medical_product_id', $product->id)->value('quantity'))->toBe(7);
    $this->assertDatabaseCount('inventory_transactions', 2);
});

test('pharmacy inventory seeder creates stock for each clinic without duplicates', function () {
    $clinic = Clinic::create(['clinic_name' => 'Seed Clinic', 'clinic_permit' => 'SEED-1', 'complete_address' => 'Yangon', 'status' => 'Approved', 'user_name' => 'seed-clinic', 'password' => 'secret']);

    $this->seed(PharmacyInventorySeeder::class);
    $this->seed(PharmacyInventorySeeder::class);

    expect(ClinicDrug::query()->where('clinic_id', $clinic->id)->count())->toBe(3);
    expect(ClinicMedicalProduct::query()->where('clinic_id', $clinic->id)->count())->toBe(3);
    expect(DrugBatch::query()->where('clinic_id', $clinic->id)->count())->toBe(3);
});

test('database seeder deducts stock for its sample sales', function () {
    $this->seed(DatabaseSeeder::class);

    $firstClinic = Clinic::query()->where('clinic_permit', 'PERMIT-2026-001')->firstOrFail();
    $secondClinic = Clinic::query()->where('clinic_permit', 'PERMIT-2026-002')->firstOrFail();
    $drug = Drug::query()->where('name', 'Paracetamol')->where('strength', '500mg')->firstOrFail();

    expect(DrugBatch::query()->where('clinic_id', $firstClinic->id)->where('drug_id', $drug->id)->value('quantity'))->toBe(480);
    expect(DrugBatch::query()->where('clinic_id', $secondClinic->id)->where('drug_id', $drug->id)->value('quantity'))->toBe(490);
    expect(DrugBatch::query()->where('clinic_id', $firstClinic->id)->count())->toBe(5);
    expect(DrugBatch::query()->where('clinic_id', $secondClinic->id)->count())->toBe(5);
    expect($this->app['db']->table('inventory_transactions')->where('drug_id', $drug->id)->count())->toBe(3);
});
