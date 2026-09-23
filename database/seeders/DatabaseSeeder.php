<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            NrcSeeder::class,
        ]);

        /*
        |--------------------------------------------------------------------------
        | 1. Specializations
        |--------------------------------------------------------------------------
        */

        $specId1 = DB::table('specializations')->insertGetId([
            'name' => 'General Practitioner',
            'description' => 'Primary health care and general medical consultations.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $specId2 = DB::table('specializations')->insertGetId([
            'name' => 'Cardiologist',
            'description' => 'Heart health and specialized cardiovascular evaluation.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | 2. Patients
        |--------------------------------------------------------------------------
        */

        DB::table('patients')->insert([
            [
                'id' => 'P001',
                'first_name' => 'Aung',
                'middle_name' => 'Kyaw',
                'last_name' => 'Thu',
                'user_name' => 'PAT-001',
                'password' => Hash::make('password123'),
                'birthdate' => '1995-05-12',
                'complete_address' => 'No. 123, Bahan Township, Yangon',
                'contact_number' => '09912345678',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
                'email' => 'patient1@gmail.com',
            ],
            [
                'id' => 'P002',
                'first_name' => 'Su',
                'middle_name' => 'Myat',
                'last_name' => 'Oo',
                'user_name' => 'PAT-002',
                'password' => Hash::make('password123'),
                'birthdate' => '1998-08-20',
                'complete_address' => 'No. 55, Dagon Township, Yangon',
                'contact_number' => '09987654321',
                'email' => 'patient2@gmail.com',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'P003',
                'first_name' => 'Nay',
                'middle_name' => 'Chi',
                'last_name' => 'Lin',
                'user_name' => 'PAT-003',
                'password' => Hash::make('password123'),
                'birthdate' => '1990-02-15',
                'complete_address' => 'No. 88, Chanayethazan, Mandalay',
                'contact_number' => '09791112233',
                'status' => 'Active',
                'created_at' => now(),
                'email' => 'patient3@gmail.com',
                'updated_at' => now(),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 3. Doctors
        |--------------------------------------------------------------------------
        */

        DB::table('doctors')->insert([
            [
                'id' => 'D001',
                'first_name' => 'Min',
                'middle_name' => 'Thein',
                'last_name' => 'Htike',
                'specialization_id' => $specId1,
                'complete_address' => 'No. 45, Kamayut Township, Yangon',
                'contact_number' => '09987654321',
                'proof_of_identity' => 'MD-License-98765',
                'user_name' => 'DOC-001',
                'password' => Hash::make('password123'),
                'status' => 'Active',
                'email' => 'doctor1@gmail.com',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'D002',
                'first_name' => 'Hnin',
                'middle_name' => 'Wati',
                'last_name' => 'Aung',
                'specialization_id' => $specId2,
                'complete_address' => 'No. 12, Sanchaung Township, Yangon',
                'contact_number' => '09421112233',
                'proof_of_identity' => 'MD-License-12345',
                'user_name' => 'DOC-002',
                'password' => Hash::make('password123'),
                'status' => 'Active',
                'email' => 'doctor2@gmail.com',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $clinicId1 = DB::table('clinics')->insertGetId([
            'clinic_name' => 'Apex Health Care Clinic',
            'clinic_permit' => 'PERMIT-2026-001',
            'complete_address' => 'Insein Road, Hlaing Township, Yangon',
            'latitude' => 16.8409,
            'longitude' => 96.1275,
            'user_name' => 'CLN-001',
            'password' => Hash::make('password123'),
            'status' => 'Approved',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $clinicId2 = DB::table('clinics')->insertGetId([
            'clinic_name' => 'Heart Care Speciality Clinic',
            'clinic_permit' => 'PERMIT-2026-002',
            'complete_address' => 'Pyay Road, Mayangone Township, Yangon',
            'latitude' => 16.8500,
            'longitude' => 96.1300,
            'user_name' => 'CLN-002',
            'password' => Hash::make('password123'),
            'status' => 'Approved',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('clinic_branches')->insert([
            [
                'clinic_id' => $clinicId1,
                'branch_name' => 'Hlaing Main Branch',
                'phone_number' => '01-512345',
                'address' => 'Insein Road, Hlaing Township, Yangon',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clinic_id' => $clinicId2,
                'branch_name' => 'Mayangone Branch',
                'phone_number' => '01-667788',
                'address' => 'Pyay Road, Mayangone Township, Yangon',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 6. Clinic Services
        |--------------------------------------------------------------------------
        */

        $serviceId1 = DB::table('clinic_services')->insertGetId([
            'clinic_id' => $clinicId1,
            'doctor_id' => 'D001',
            'service_name' => 'General Medical Consultation',
            'service_description' => 'Standard checkup, vital signs tracking, and diagnosis.',
            'amount' => 15000.00,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $serviceId2 = DB::table('clinic_services')->insertGetId([
            'clinic_id' => $clinicId2,
            'doctor_id' => 'D002',
            'service_name' => 'Cardiology Checkup',
            'service_description' => 'ECG and specialized heart health evaluation.',
            'amount' => 35000.00,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | 7. Doctor Clinic Schedules
        |--------------------------------------------------------------------------
        */

        DB::table('doctor_clinic_schedules')->insert([
            [
                'clinic_id' => $clinicId1,
                'doctor_id' => 'D001',
                'day_of_week' => 'Monday',
                'start_time' => '09:00:00',
                'end_time' => '12:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clinic_id' => $clinicId1,
                'doctor_id' => 'D001',
                'day_of_week' => 'Wednesday',
                'start_time' => '09:00:00',
                'end_time' => '12:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clinic_id' => $clinicId1,
                'doctor_id' => 'D001',
                'day_of_week' => 'Friday',
                'start_time' => '14:00:00',
                'end_time' => '17:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clinic_id' => $clinicId2,
                'doctor_id' => 'D002',
                'day_of_week' => 'Tuesday',
                'start_time' => '13:00:00',
                'end_time' => '17:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clinic_id' => $clinicId2,
                'doctor_id' => 'D002',
                'day_of_week' => 'Thursday',
                'start_time' => '13:00:00',
                'end_time' => '17:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clinic_id' => $clinicId2,
                'doctor_id' => 'D002',
                'day_of_week' => 'Saturday',
                'start_time' => '09:00:00',
                'end_time' => '13:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 8. Reservations
        |--------------------------------------------------------------------------
        */

        $reservationId1 = DB::table('reservations')->insertGetId([
            'appointment_code' => 'APT-2026-0001',
            'patient_id' => 'P001',
            'doctor_id' => 'D001',
            'clinic_id' => $clinicId1,
            'service_id' => $serviceId1,
            'schedule_id' => 1,
            'appointment_type' => 'In-Person',
            'status' => 'Confirmed',
            'remarks' => 'Mild fever and cough.',
            'amount' => 15000.00,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $reservationId2 = DB::table('reservations')->insertGetId([
            'appointment_code' => 'APT-2026-0002',
            'patient_id' => 'P002',
            'doctor_id' => 'D002',
            'clinic_id' => $clinicId2,
            'service_id' => $serviceId2,
            'schedule_id' => 4,
            'appointment_type' => 'In-Person',
            'status' => 'Pending',
            'remarks' => 'Chest discomfort during exercise.',
            'amount' => 35000.00,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | 9. Consultations
        |--------------------------------------------------------------------------
        */

        DB::table('consultations')->insert([
            [
                'appointment_code' => 'APT-2026-0001',
                'date_of_consultation' => Carbon::tomorrow()
                    ->setHour(9)
                    ->setMinute(30),
                'diagnosis' => 'Common Cold',
                'treatment' => 'Rest, drink warm water, take paracetamol.',
                'upload_prescription' => 'prescriptions/sample_prescription_1.pdf',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 10. Medical Records
        |--------------------------------------------------------------------------
        */

        DB::table('medical_records')->insert([
            [
                'patient_id' => 'P001',
                'doctor_id' => 'D001',
                'record_title' => 'Routine Health Assessment',
                'file_attachment' => 'records/p001_checkup.pdf',
                'notes' => 'Patient is generally healthy, minor cold symptoms recorded.',
                'record_date' => now(),
                'appointment_code' => 'APT-2026-0001',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'patient_id' => 'P002',
                'doctor_id' => 'D002',
                'appointment_code' => 'APT-2026-0002',
                'record_title' => 'Initial Heart Screening',
                'file_attachment' => 'records/p002_ecg.pdf',
                'notes' => 'Normal sinus rhythm, advised follow-up lifestyle changes.',
                'record_date' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 11. Payments
        |--------------------------------------------------------------------------
        */

        DB::table('payments')->insert([
            [
                'reservation_id' => $reservationId1,
                'amount' => 15000.00,
                'payment_method' => 'KBZPay',
                'transaction_code' => 'KBP987654321',
                'payment_status' => 'Paid',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'reservation_id' => $reservationId2,
                'amount' => 35000.00,
                'payment_method' => 'CB Pay',
                'transaction_code' => null,
                'payment_status' => 'Pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 12. Notifications
        |--------------------------------------------------------------------------
        */

        DB::table('notifications')->insert([
            [
                'user_id' => 'P001',
                'title' => 'Appointment Confirmed',
                'message' => 'Your reservation APT-2026-0001 with Dr. Min Thein Htike has been confirmed.',
                'type' => 'In-App',
                'status' => 'Unread',
                'created_at' => now(),
            ],
            [
                'user_id' => 'P002',
                'title' => 'Appointment Pending',
                'message' => 'Your reservation APT-2026-0002 has been submitted and is awaiting approval.',
                'type' => 'In-App',
                'status' => 'Unread',
                'created_at' => now(),
            ],
        ]);

        $drugCategoryId = DB::table('drug_categories')->insertGetId(['name' => 'Analgesic', 'created_at' => now(), 'updated_at' => now()]);
        $tabletFormId = DB::table('drug_forms')->insertGetId(['name' => 'Tablet', 'created_at' => now(), 'updated_at' => now()]);
        $manufacturerId = DB::table('manufacturers')->insertGetId(['name' => 'Myanmar Pharma', 'created_at' => now(), 'updated_at' => now()]);
        $drugIds = [];
        foreach ([['Paracetamol', '500mg'], ['Amoxicillin', '500mg'], ['Cetirizine', '10mg'], ['Ibuprofen', '400mg'], ['Omeprazole', '20mg']] as [$name, $strength]) {
            $drugIds[] = DB::table('drugs')->insertGetId(['drug_category_id' => $drugCategoryId, 'drug_form_id' => $tabletFormId, 'manufacturer_id' => $manufacturerId, 'name' => $name, 'strength' => $strength, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach ($drugIds as $drugId) {
            DB::table('drug_units')->insert([
                ['drug_id' => $drugId, 'unit_name' => 'Tablet', 'conversion_quantity' => 1, 'sale_price' => 120, 'is_default' => true, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['drug_id' => $drugId, 'unit_name' => 'Strip', 'conversion_quantity' => 10, 'sale_price' => 1200, 'is_default' => false, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['drug_id' => $drugId, 'unit_name' => 'Bottle', 'conversion_quantity' => 100, 'sale_price' => 12000, 'is_default' => false, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ]);
            foreach ([$clinicId1, $clinicId2] as $clinicId) {
                DB::table('clinic_drugs')->insert(['clinic_id' => $clinicId, 'drug_id' => $drugId, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
                DB::table('drug_batches')->insert(['clinic_id' => $clinicId, 'drug_id' => $drugId, 'batch_number' => "BATCH-{$clinicId}-{$drugId}", 'expiry_date' => now()->addYear()->toDateString(), 'purchase_price' => 80, 'quantity' => 500, 'created_at' => now(), 'updated_at' => now()]);
            }
        }
        $supplyCategoryId = DB::table('medical_product_categories')->insertGetId(['name' => 'Consumables', 'created_at' => now(), 'updated_at' => now()]);
        foreach (['Gauze', 'Syringe', 'Gloves', 'Bandage', 'Face Mask'] as $name) {
            $productId = DB::table('medical_products')->insertGetId(['medical_product_category_id' => $supplyCategoryId, 'name' => $name, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
            foreach ([$clinicId1, $clinicId2] as $clinicId) {
                DB::table('clinic_medical_products')->insert(['clinic_id' => $clinicId, 'medical_product_id' => $productId, 'quantity' => 100, 'sale_price' => 1250, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
            }
        }
        $consultationId = DB::table('consultations')->where('appointment_code', 'APT-2026-0001')->value('id');
        $tabletUnitId = DB::table('drug_units')->where('drug_id', $drugIds[0])->where('unit_name', 'Tablet')->value('id');
        $prescriptionId = DB::table('prescriptions')->insertGetId(['consultation_id' => $consultationId, 'clinic_id' => $clinicId1, 'notes' => 'Take after meals.', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('prescription_items')->insert(['prescription_id' => $prescriptionId, 'drug_id' => $drugIds[0], 'drug_unit_id' => $tabletUnitId, 'quantity' => 10, 'base_quantity' => 10, 'created_at' => now(), 'updated_at' => now()]);
        foreach ([['reservation', $reservationId1, 'P001', $prescriptionId], ['external', null, 'P002', null]] as [$type, $reservationId, $patientId, $salePrescriptionId]) {
            $saleId = DB::table('sales')->insertGetId(['clinic_id' => $clinicId1, 'reservation_id' => $reservationId, 'patient_id' => $patientId, 'prescription_id' => $salePrescriptionId, 'sale_type' => $type, 'subtotal' => 1200, 'discount' => 0, 'tax' => 0, 'total' => 1200, 'payment_method' => 'Cash', 'payment_status' => 'Paid', 'created_at' => now(), 'updated_at' => now()]);
            DB::table('sale_items')->insert(['sale_id' => $saleId, 'item_type' => 'drug', 'drug_id' => $drugIds[0], 'drug_unit_id' => $tabletUnitId, 'description' => 'Paracetamol 500mg', 'quantity' => 10, 'base_quantity' => 10, 'unit_price' => 120, 'line_total' => 1200, 'created_at' => now(), 'updated_at' => now()]);
            $batchId = DB::table('drug_batches')->where('clinic_id', $clinicId1)->where('drug_id', $drugIds[0])->value('id');
            DB::table('drug_batches')->where('id', $batchId)->decrement('quantity', 10);
            DB::table('inventory_transactions')->insert(['clinic_id' => $clinicId1, 'drug_id' => $drugIds[0], 'drug_batch_id' => $batchId, 'sale_id' => $saleId, 'transaction_type' => 'sale', 'quantity' => -10, 'reference' => "Seed sale {$saleId}", 'created_at' => now(), 'updated_at' => now()]);
        }
        $clinicTwoSaleId = DB::table('sales')->insertGetId(['clinic_id' => $clinicId2, 'patient_id' => 'P003', 'sale_type' => 'external', 'subtotal' => 1200, 'discount' => 0, 'tax' => 0, 'total' => 1200, 'payment_method' => 'Cash', 'payment_status' => 'Paid', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('sale_items')->insert(['sale_id' => $clinicTwoSaleId, 'item_type' => 'drug', 'drug_id' => $drugIds[0], 'drug_unit_id' => $tabletUnitId, 'description' => 'Paracetamol 500mg', 'quantity' => 10, 'base_quantity' => 10, 'unit_price' => 120, 'line_total' => 1200, 'created_at' => now(), 'updated_at' => now()]);
        $clinicTwoBatchId = DB::table('drug_batches')->where('clinic_id', $clinicId2)->where('drug_id', $drugIds[0])->value('id');
        DB::table('drug_batches')->where('id', $clinicTwoBatchId)->decrement('quantity', 10);
        DB::table('inventory_transactions')->insert(['clinic_id' => $clinicId2, 'drug_id' => $drugIds[0], 'drug_batch_id' => $clinicTwoBatchId, 'sale_id' => $clinicTwoSaleId, 'transaction_type' => 'sale', 'quantity' => -10, 'reference' => "Seed sale {$clinicTwoSaleId}", 'created_at' => now(), 'updated_at' => now()]);

        $this->call(PaymentMethodSeeder::class);
    }
}
