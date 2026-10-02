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
        $now = now();
        $password = Hash::make('password123');
        $target = 120;
        $clinicImages = [
            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
        ];
        $doctorImages = [
            'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=80',
        ];
        $serviceImages = [
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1200&q=80',
        ];
        $drugImages = [
            'Paracetamol' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
            'Amoxicillin' => 'https://images.unsplash.com/photo-1550572017-edd951aa8ca9?auto=format&fit=crop&w=800&q=80',
            'Cetirizine' => 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80',
            'Ibuprofen' => 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=800&q=80',
            'Omeprazole' => 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80',
        ];
        $productImages = [
            'Gauze' => 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
            'Syringe' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
            'Gloves' => 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80',
            'Bandage' => 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
            'Face Mask' => 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80',
        ];
        $localImage = '/images/healthcare-demo.jpg';
        $clinicImages = [$localImage, $localImage];
        $doctorImages = [$localImage, $localImage, $localImage];
        $drugImages = array_fill_keys(array_keys($drugImages), $localImage);
        $productImages = array_fill_keys(array_keys($productImages), $localImage);

        /*
        |--------------------------------------------------------------------------
        | Real Yangon locations (township centres) used for clinic coordinates
        |--------------------------------------------------------------------------
        |
        | [township name, latitude, longitude]
        | Demo clinics cycle through these so every pin sits in a real
        | Yangon neighbourhood instead of a random point.
        |
        */

        $yangonLocations = [
            ['Kamayut', 16.8235, 96.1325],
            ['Hlaing', 16.8072, 96.1260],
            ['Sanchaung', 16.8158, 96.1319],
            ['Bahan', 16.8140, 96.1530],
            ['Dagon', 16.7885, 96.1540],
            ['Mayangone', 16.8600, 96.1340],
            ['Insein', 16.8930, 96.1010],
            ['Mingaladon', 16.9300, 96.1350],
            ['Thingangyun', 16.8290, 96.1930],
            ['South Okkalapa', 16.8410, 96.1800],
            ['North Okkalapa', 16.8830, 96.1650],
            ['Tamwe', 16.8120, 96.1730],
            ['Yankin', 16.8400, 96.1620],
            ['Kyauktada', 16.7770, 96.1600],
            ['Pabedan', 16.7790, 96.1550],
            ['Latha', 16.7780, 96.1530],
            ['Lanmadaw', 16.7800, 96.1450],
            ['Botahtaung', 16.7690, 96.1700],
            ['Pazundaung', 16.7800, 96.1720],
            ['Ahlone', 16.7780, 96.1290],
            ['Kyimyindaing', 16.7840, 96.1300],
            ['Mingalar Taung Nyunt', 16.7850, 96.1650],
            ['Dawbon', 16.7700, 96.1900],
            ['Hlaing Tharyar', 16.8700, 96.0700],
        ];

        /*
        |--------------------------------------------------------------------------
        | NRC
        |--------------------------------------------------------------------------
        */

        $this->call([
            NrcSeeder::class,
            AdminPermissionSeeder::class,
            AdminSeeder::class,
        ]);

        /*
        |--------------------------------------------------------------------------
        | 1. Specializations
        |--------------------------------------------------------------------------
        */

        $specializationIds = DB::table('specializations')
            ->pluck('id')
            ->all();

        if ($specializationIds === []) {
            $specializationIds[] = DB::table('specializations')->insertGetId([
                'name' => 'General Practitioner',
                'description' => 'Primary health care and general medical consultations.',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $specializationIds[] = DB::table('specializations')->insertGetId([
                'name' => 'Cardiologist',
                'description' => 'Heart health and specialized cardiovascular evaluation.',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        } else {
            /*
             * Make sure we have at least the two standard
             * specializations if this is a fresh database.
             */
            if (! DB::table('specializations')
                ->where('name', 'General Practitioner')
                ->exists()) {

                $specializationIds[] = DB::table('specializations')->insertGetId([
                    'name' => 'General Practitioner',
                    'description' => 'Primary health care and general medical consultations.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            if (! DB::table('specializations')
                ->where('name', 'Cardiologist')
                ->exists()) {

                $specializationIds[] = DB::table('specializations')->insertGetId([
                    'name' => 'Cardiologist',
                    'description' => 'Heart health and specialized cardiovascular evaluation.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            $specializationIds = DB::table('specializations')
                ->pluck('id')
                ->all();
        }

        /*
        |--------------------------------------------------------------------------
        | 2. Original Patients
        |--------------------------------------------------------------------------
        */

        $existingPatientIds = DB::table('patients')
            ->pluck('id')
            ->all();

        if (! in_array('P001', $existingPatientIds, true)) {
            DB::table('patients')->insert([
                [
                    'id' => 'P001',
                    'first_name' => 'Aung',
                    'middle_name' => 'Kyaw',
                    'last_name' => 'Thu',
                    'user_name' => 'PAT-001',
                    'password' => $password,
                    'birthdate' => '1995-05-12',
                    'complete_address' => 'No. 123, Bahan Township, Yangon',
                    'contact_number' => '09912345678',
                    'status' => 'Active',
                    'email' => 'patient1@gmail.com',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'id' => 'P002',
                    'first_name' => 'Su',
                    'middle_name' => 'Myat',
                    'last_name' => 'Oo',
                    'user_name' => 'PAT-002',
                    'password' => $password,
                    'birthdate' => '1998-08-20',
                    'complete_address' => 'No. 55, Dagon Township, Yangon',
                    'contact_number' => '09987654321',
                    'email' => 'patient2@gmail.com',
                    'status' => 'Active',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'id' => 'P003',
                    'first_name' => 'Nay',
                    'middle_name' => 'Chi',
                    'last_name' => 'Lin',
                    'user_name' => 'PAT-003',
                    'password' => $password,
                    'birthdate' => '1990-02-15',
                    'complete_address' => 'No. 88, Chanayethazan, Mandalay',
                    'contact_number' => '09791112233',
                    'status' => 'Active',
                    'email' => 'patient3@gmail.com',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 3. Original Doctors
        |--------------------------------------------------------------------------
        */

        $doctorIds = DB::table('doctors')
            ->pluck('id')
            ->all();

        $specId1 = DB::table('specializations')
            ->where('name', 'General Practitioner')
            ->value('id');

        $specId2 = DB::table('specializations')
            ->where('name', 'Cardiologist')
            ->value('id');

        if (! in_array('D001', $doctorIds, true)) {
            DB::table('doctors')->insert([
                [
                    'id' => 'D001',
                    'first_name' => 'Min',
                    'middle_name' => 'Thein',
                    'last_name' => 'Htike',
                    'specialization_id' => $specId1,
                    'complete_address' => 'No. 45, Kamayut Township, Yangon',
                    'photo_path' => $doctorImages[0],
                    'contact_number' => '09987654321',
                    'proof_of_identity' => 'MD-License-98765',
                    'user_name' => 'DOC-001',
                    'password' => $password,
                    'status' => 'Active',
                    'email' => 'doctor1@gmail.com',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'id' => 'D002',
                    'first_name' => 'Hnin',
                    'middle_name' => 'Wati',
                    'last_name' => 'Aung',
                    'specialization_id' => $specId2,
                    'complete_address' => 'No. 12, Sanchaung Township, Yangon',
                    'photo_path' => $doctorImages[1],
                    'contact_number' => '09421112233',
                    'proof_of_identity' => 'MD-License-12345',
                    'user_name' => 'DOC-002',
                    'password' => $password,
                    'status' => 'Active',
                    'email' => 'doctor2@gmail.com',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 4. Original Clinics
        |--------------------------------------------------------------------------
        |
        | Clinic 1: Insein Road, Hlaing Township  -> 16.8318, 96.1266
        | Clinic 2: Pyay Road, Mayangone Township -> 16.8460, 96.1340
        |
        */

        $clinicId1 = DB::table('clinics')
            ->where('user_name', 'CLN-001')
            ->value('id');

        if (! $clinicId1) {
            $clinicId1 = DB::table('clinics')->insertGetId([
                'clinic_name' => 'Apex Health Care Clinic',
                'clinic_permit' => 'PERMIT-2026-001',
                'complete_address' => 'Insein Road, Hlaing Township, Yangon',
                'photo_path' => $clinicImages[0],
                'latitude' => 16.8318,
                'longitude' => 96.1266,
                'user_name' => 'CLN-001',
                'password' => $password,
                'status' => 'Approved',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $clinicId2 = DB::table('clinics')
            ->where('user_name', 'CLN-002')
            ->value('id');

        if (! $clinicId2) {
            $clinicId2 = DB::table('clinics')->insertGetId([
                'clinic_name' => 'Heart Care Speciality Clinic',
                'clinic_permit' => 'PERMIT-2026-002',
                'complete_address' => 'Pyay Road, Mayangone Township, Yangon',
                'photo_path' => $clinicImages[1],
                'latitude' => 16.8460,
                'longitude' => 96.1340,
                'user_name' => 'CLN-002',
                'password' => $password,
                'status' => 'Approved',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        /*
         * Always refresh coordinates so re-running the seeder on an
         * existing database replaces the old placeholder locations.
         */
        DB::table('clinics')->where('id', $clinicId1)->update([
            'latitude' => 16.8318,
            'longitude' => 96.1266,
        ]);

        DB::table('clinics')->where('id', $clinicId2)->update([
            'latitude' => 16.8460,
            'longitude' => 96.1340,
        ]);

        DB::table('clinics')->whereIn('id', [$clinicId1, $clinicId2])->where(function ($query): void {
            $query->whereNull('photo_path')->orWhere('photo_path', 'like', 'https://images.unsplash.com/%');
        })->update(['photo_path' => $localImage]);

        /*
        |--------------------------------------------------------------------------
        | 5. Original Clinic Branches
        |--------------------------------------------------------------------------
        */

        if (
            ! DB::table('clinic_branches')
                ->where('clinic_id', $clinicId1)
                ->where('branch_name', 'Hlaing Main Branch')
                ->exists()
        ) {
            DB::table('clinic_branches')->insert([
                'clinic_id' => $clinicId1,
                'branch_name' => 'Hlaing Main Branch',
                'phone_number' => '01-512345',
                'address' => 'Insein Road, Hlaing Township, Yangon',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        if (
            ! DB::table('clinic_branches')
                ->where('clinic_id', $clinicId2)
                ->where('branch_name', 'Mayangone Branch')
                ->exists()
        ) {
            DB::table('clinic_branches')->insert([
                'clinic_id' => $clinicId2,
                'branch_name' => 'Mayangone Branch',
                'phone_number' => '01-667788',
                'address' => 'Pyay Road, Mayangone Township, Yangon',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 6. Original Clinic Doctors
        |--------------------------------------------------------------------------
        */

        DB::table('clinic_doctor')->insertOrIgnore([
            [
                'clinic_id' => $clinicId1,
                'doctor_id' => 'D001',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => $clinicId2,
                'doctor_id' => 'D002',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 7. Original Clinic Services
        |--------------------------------------------------------------------------
        */

        $serviceId1 = DB::table('clinic_services')
            ->where('clinic_id', $clinicId1)
            ->where('doctor_id', 'D001')
            ->value('id');

        if (! $serviceId1) {
            $serviceId1 = DB::table('clinic_services')->insertGetId([
                'clinic_id' => $clinicId1,
                'doctor_id' => 'D001',
                'service_name' => 'General Medical Consultation',
                'service_description' => 'Standard checkup, vital signs tracking, and diagnosis.',
                'image_path' => $serviceImages[0],
                'amount' => 15000.00,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $serviceId2 = DB::table('clinic_services')
            ->where('clinic_id', $clinicId2)
            ->where('doctor_id', 'D002')
            ->value('id');

        if (! $serviceId2) {
            $serviceId2 = DB::table('clinic_services')->insertGetId([
                'clinic_id' => $clinicId2,
                'doctor_id' => 'D002',
                'service_name' => 'Cardiology Checkup',
                'service_description' => 'ECG and specialized heart health evaluation.',
                'image_path' => $serviceImages[1],
                'amount' => 35000.00,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        DB::table('clinic_services')->where('id', $serviceId1)->whereNull('image_path')->update([
            'image_path' => $serviceImages[0],
        ]);
        DB::table('clinic_services')->where('id', $serviceId2)->whereNull('image_path')->update([
            'image_path' => $serviceImages[1],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 8. Original Doctor Clinic Schedules
        |--------------------------------------------------------------------------
        */

        $scheduleExists = DB::table('doctor_clinic_schedules')
            ->where('clinic_id', $clinicId1)
            ->where('doctor_id', 'D001')
            ->exists();

        if (! $scheduleExists) {
            DB::table('doctor_clinic_schedules')->insert([
                [
                    'clinic_id' => $clinicId1,
                    'doctor_id' => 'D001',
                    'day_of_week' => 'Monday',
                    'start_time' => '09:00:00',
                    'end_time' => '12:00:00',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'clinic_id' => $clinicId1,
                    'doctor_id' => 'D001',
                    'day_of_week' => 'Wednesday',
                    'start_time' => '09:00:00',
                    'end_time' => '12:00:00',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'clinic_id' => $clinicId1,
                    'doctor_id' => 'D001',
                    'day_of_week' => 'Friday',
                    'start_time' => '14:00:00',
                    'end_time' => '17:00:00',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ]);
        }

        $scheduleExists = DB::table('doctor_clinic_schedules')
            ->where('clinic_id', $clinicId2)
            ->where('doctor_id', 'D002')
            ->exists();

        if (! $scheduleExists) {
            DB::table('doctor_clinic_schedules')->insert([
                [
                    'clinic_id' => $clinicId2,
                    'doctor_id' => 'D002',
                    'day_of_week' => 'Tuesday',
                    'start_time' => '13:00:00',
                    'end_time' => '17:00:00',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'clinic_id' => $clinicId2,
                    'doctor_id' => 'D002',
                    'day_of_week' => 'Thursday',
                    'start_time' => '13:00:00',
                    'end_time' => '17:00:00',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'clinic_id' => $clinicId2,
                    'doctor_id' => 'D002',
                    'day_of_week' => 'Saturday',
                    'start_time' => '09:00:00',
                    'end_time' => '13:00:00',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 9. Original Reservations
        |--------------------------------------------------------------------------
        */

        $reservationId1 = DB::table('reservations')
            ->where('appointment_code', 'APT-2026-0001')
            ->value('id');

        if (! $reservationId1) {
            $reservationId1 = DB::table('reservations')->insertGetId([
                'appointment_code' => 'APT-2026-0001',
                'patient_id' => 'P001',
                'doctor_id' => 'D001',
                'clinic_id' => $clinicId1,
                'service_id' => $serviceId1,
                'schedule_id' => DB::table('doctor_clinic_schedules')
                    ->where('clinic_id', $clinicId1)
                    ->where('doctor_id', 'D001')
                    ->first()->id,
                'appointment_type' => 'In-Person',
                'status' => 'Confirmed',
                'remarks' => 'Mild fever and cough.',
                'amount' => 15000.00,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $reservationId2 = DB::table('reservations')
            ->where('appointment_code', 'APT-2026-0002')
            ->value('id');

        if (! $reservationId2) {
            $reservationId2 = DB::table('reservations')->insertGetId([
                'appointment_code' => 'APT-2026-0002',
                'patient_id' => 'P002',
                'doctor_id' => 'D002',
                'clinic_id' => $clinicId2,
                'service_id' => $serviceId2,
                'schedule_id' => DB::table('doctor_clinic_schedules')
                    ->where('clinic_id', $clinicId2)
                    ->where('doctor_id', 'D002')
                    ->first()->id,
                'appointment_type' => 'In-Person',
                'status' => 'Pending',
                'remarks' => 'Chest discomfort during exercise.',
                'amount' => 35000.00,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 10. Original Consultations
        |--------------------------------------------------------------------------
        */

        if (
            ! DB::table('consultations')
                ->where('appointment_code', 'APT-2026-0001')
                ->exists()
        ) {
            DB::table('consultations')->insert([
                'appointment_code' => 'APT-2026-0001',
                'date_of_consultation' => Carbon::tomorrow()
                    ->setHour(9)
                    ->setMinute(30),
                'diagnosis' => 'Common Cold',
                'treatment' => 'Rest, drink warm water, take paracetamol.',
                'upload_prescription' => 'prescriptions/sample_prescription_1.pdf',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 11. Original Medical Records
        |--------------------------------------------------------------------------
        */

        if (
            ! DB::table('medical_records')
                ->where('appointment_code', 'APT-2026-0001')
                ->exists()
        ) {
            DB::table('medical_records')->insert([
                [
                    'patient_id' => 'P001',
                    'doctor_id' => 'D001',
                    'record_title' => 'Routine Health Assessment',
                    'file_attachment' => 'records/p001_checkup.pdf',
                    'notes' => 'Patient is generally healthy, minor cold symptoms recorded.',
                    'record_date' => $now,
                    'appointment_code' => 'APT-2026-0001',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'patient_id' => 'P002',
                    'doctor_id' => 'D002',
                    'appointment_code' => 'APT-2026-0002',
                    'record_title' => 'Initial Heart Screening',
                    'file_attachment' => 'records/p002_ecg.pdf',
                    'notes' => 'Normal sinus rhythm, advised follow-up lifestyle changes.',
                    'record_date' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 12. Original Payments
        |--------------------------------------------------------------------------
        */

        if (
            ! DB::table('payments')
                ->where('reservation_id', $reservationId1)
                ->exists()
        ) {
            DB::table('payments')->insert([
                [
                    'reservation_id' => $reservationId1,
                    'amount' => 15000.00,
                    'payment_method' => 'KBZPay',
                    'transaction_code' => 'KBP987654321',
                    'payment_status' => 'Paid',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'reservation_id' => $reservationId2,
                    'amount' => 35000.00,
                    'payment_method' => 'CB Pay',
                    'transaction_code' => null,
                    'payment_status' => 'Pending',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 13. Original Notifications
        |--------------------------------------------------------------------------
        */

        if (
            ! DB::table('notifications')
                ->where('user_id', 'P001')
                ->where('title', 'Appointment Confirmed')
                ->exists()
        ) {
            DB::table('notifications')->insert([
                [
                    'user_id' => 'P001',
                    'title' => 'Appointment Confirmed',
                    'message' => 'Your reservation APT-2026-0001 with Dr. Min Thein Htike has been confirmed.',
                    'type' => 'In-App',
                    'status' => 'Unread',
                    'created_at' => $now,
                ],
                [
                    'user_id' => 'P002',
                    'title' => 'Appointment Pending',
                    'message' => 'Your reservation APT-2026-0002 has been submitted and is awaiting approval.',
                    'type' => 'In-App',
                    'status' => 'Unread',
                    'created_at' => $now,
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 14. Drugs
        |--------------------------------------------------------------------------
        */

        $drugCategoryId = DB::table('drug_categories')
            ->where('name', 'Analgesic')
            ->value('id');

        if (! $drugCategoryId) {
            $drugCategoryId = DB::table('drug_categories')->insertGetId([
                'name' => 'Analgesic',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $tabletFormId = DB::table('drug_forms')
            ->where('name', 'Tablet')
            ->value('id');

        if (! $tabletFormId) {
            $tabletFormId = DB::table('drug_forms')->insertGetId([
                'name' => 'Tablet',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $manufacturerId = DB::table('manufacturers')
            ->where('name', 'Myanmar Pharma')
            ->value('id');

        if (! $manufacturerId) {
            $manufacturerId = DB::table('manufacturers')->insertGetId([
                'name' => 'Myanmar Pharma',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $drugIds = [];

        foreach ([
            ['Paracetamol', '500mg'],
            ['Amoxicillin', '500mg'],
            ['Cetirizine', '10mg'],
            ['Ibuprofen', '400mg'],
            ['Omeprazole', '20mg'],
        ] as [$name, $strength]) {

            $drugId = DB::table('drugs')
                ->where('name', $name)
                ->where('strength', $strength)
                ->value('id');

            if (! $drugId) {
                $drugId = DB::table('drugs')->insertGetId([
                    'drug_category_id' => $drugCategoryId,
                    'drug_form_id' => $tabletFormId,
                    'manufacturer_id' => $manufacturerId,
                    'name' => $name,
                    'image_path' => $drugImages[$name],
                    'strength' => $strength,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            $drugIds[] = $drugId;

            DB::table('drugs')->where('id', $drugId)->where(function ($query): void {
                $query->whereNull('image_path')->orWhere('image_path', 'like', 'https://images.unsplash.com/%');
            })->update(['image_path' => $drugImages[$name]]);

            /*
             * Drug units
             */
            if (! DB::table('drug_units')
                ->where('drug_id', $drugId)
                ->exists()) {

                DB::table('drug_units')->insert([
                    [
                        'drug_id' => $drugId,
                        'unit_name' => 'Tablet',
                        'conversion_quantity' => 1,
                        'sale_price' => 120,
                        'is_default' => true,
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                    [
                        'drug_id' => $drugId,
                        'unit_name' => 'Strip',
                        'conversion_quantity' => 10,
                        'sale_price' => 1200,
                        'is_default' => false,
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                    [
                        'drug_id' => $drugId,
                        'unit_name' => 'Bottle',
                        'conversion_quantity' => 100,
                        'sale_price' => 12000,
                        'is_default' => false,
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                ]);
            }

            /*
             * Put drugs into original clinics.
             */
            foreach ([$clinicId1, $clinicId2] as $clinicId) {

                DB::table('clinic_drugs')->insertOrIgnore([
                    'clinic_id' => $clinicId,
                    'drug_id' => $drugId,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                if (! DB::table('drug_batches')
                    ->where('clinic_id', $clinicId)
                    ->where('drug_id', $drugId)
                    ->exists()) {

                    DB::table('drug_batches')->insert([
                        'clinic_id' => $clinicId,
                        'drug_id' => $drugId,
                        'batch_number' => "BATCH-{$clinicId}-{$drugId}",
                        'expiry_date' => $now->copy()
                            ->addYear()
                            ->toDateString(),
                        'purchase_price' => 80,
                        'quantity' => 500,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 15. Medical Products
        |--------------------------------------------------------------------------
        */

        $supplyCategoryId = DB::table('medical_product_categories')
            ->where('name', 'Consumables')
            ->value('id');

        if (! $supplyCategoryId) {
            $supplyCategoryId = DB::table('medical_product_categories')
                ->insertGetId([
                    'name' => 'Consumables',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
        }

        foreach ([
            'Gauze',
            'Syringe',
            'Gloves',
            'Bandage',
            'Face Mask',
        ] as $name) {

            $productId = DB::table('medical_products')
                ->where('name', $name)
                ->value('id');

            if (! $productId) {
                $productId = DB::table('medical_products')
                    ->insertGetId([
                        'medical_product_category_id' => $supplyCategoryId,
                        'name' => $name,
                        'image_path' => $productImages[$name],
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
            }

            DB::table('medical_products')->where('id', $productId)->where(function ($query): void {
                $query->whereNull('image_path')->orWhere('image_path', 'like', 'https://images.unsplash.com/%');
            })->update(['image_path' => $productImages[$name]]);

            foreach ([$clinicId1, $clinicId2] as $clinicId) {

                DB::table('clinic_medical_products')->insertOrIgnore([
                    'clinic_id' => $clinicId,
                    'medical_product_id' => $productId,
                    'quantity' => 100,
                    'sale_price' => 1250,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 16. Original Prescription
        |--------------------------------------------------------------------------
        */

        $consultationId = DB::table('consultations')
            ->where('appointment_code', 'APT-2026-0001')
            ->value('id');

        $tabletUnitId = DB::table('drug_units')
            ->where('drug_id', $drugIds[0])
            ->where('unit_name', 'Tablet')
            ->value('id');

        $prescriptionId = DB::table('prescriptions')
            ->where('consultation_id', $consultationId)
            ->value('id');

        if (! $prescriptionId) {
            $prescriptionId = DB::table('prescriptions')
                ->insertGetId([
                    'consultation_id' => $consultationId,
                    'clinic_id' => $clinicId1,
                    'notes' => 'Take after meals.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

            DB::table('prescription_items')->insert([
                'prescription_id' => $prescriptionId,
                'drug_id' => $drugIds[0],
                'drug_unit_id' => $tabletUnitId,
                'quantity' => 10,
                'base_quantity' => 10,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 17. Original Sales
        |--------------------------------------------------------------------------
        */

        $existingSales = DB::table('sales')
            ->where('clinic_id', $clinicId1)
            ->count();

        if ($existingSales === 0) {

            foreach ([
                [
                    'sale_type' => 'reservation',
                    'reservation_id' => $reservationId1,
                    'patient_id' => 'P001',
                    'prescription_id' => $prescriptionId,
                ],
                [
                    'sale_type' => 'external',
                    'reservation_id' => null,
                    'patient_id' => 'P002',
                    'prescription_id' => null,
                ],
            ] as $saleData) {

                $saleId = DB::table('sales')->insertGetId([
                    'clinic_id' => $clinicId1,
                    'reservation_id' => $saleData['reservation_id'],
                    'patient_id' => $saleData['patient_id'],
                    'prescription_id' => $saleData['prescription_id'],
                    'sale_type' => $saleData['sale_type'],
                    'subtotal' => 1200,
                    'discount' => 0,
                    'tax' => 0,
                    'total' => 1200,
                    'payment_method' => 'Cash',
                    'payment_status' => 'Paid',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                DB::table('sale_items')->insert([
                    'sale_id' => $saleId,
                    'item_type' => 'drug',
                    'drug_id' => $drugIds[0],
                    'drug_unit_id' => $tabletUnitId,
                    'description' => 'Paracetamol 500mg',
                    'quantity' => 10,
                    'base_quantity' => 10,
                    'unit_price' => 120,
                    'line_total' => 1200,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                $batchId = DB::table('drug_batches')
                    ->where('clinic_id', $clinicId1)
                    ->where('drug_id', $drugIds[0])
                    ->value('id');

                DB::table('drug_batches')
                    ->where('id', $batchId)
                    ->decrement('quantity', 10);

                DB::table('inventory_transactions')->insert([
                    'clinic_id' => $clinicId1,
                    'drug_id' => $drugIds[0],
                    'drug_batch_id' => $batchId,
                    'sale_id' => $saleId,
                    'transaction_type' => 'sale',
                    'quantity' => -10,
                    'reference' => "Seed sale {$saleId}",
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 18. Clinic 2 Original Sale
        |--------------------------------------------------------------------------
        */

        $clinicTwoSaleExists = DB::table('sales')
            ->where('clinic_id', $clinicId2)
            ->exists();

        if (! $clinicTwoSaleExists) {

            $clinicTwoSaleId = DB::table('sales')->insertGetId([
                'clinic_id' => $clinicId2,
                'patient_id' => 'P003',
                'sale_type' => 'external',
                'subtotal' => 1200,
                'discount' => 0,
                'tax' => 0,
                'total' => 1200,
                'payment_method' => 'Cash',
                'payment_status' => 'Paid',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('sale_items')->insert([
                'sale_id' => $clinicTwoSaleId,
                'item_type' => 'drug',
                'drug_id' => $drugIds[0],
                'drug_unit_id' => $tabletUnitId,
                'description' => 'Paracetamol 500mg',
                'quantity' => 10,
                'base_quantity' => 10,
                'unit_price' => 120,
                'line_total' => 1200,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $clinicTwoBatchId = DB::table('drug_batches')
                ->where('clinic_id', $clinicId2)
                ->where('drug_id', $drugIds[0])
                ->value('id');

            DB::table('drug_batches')
                ->where('id', $clinicTwoBatchId)
                ->decrement('quantity', 10);

            DB::table('inventory_transactions')->insert([
                'clinic_id' => $clinicId2,
                'drug_id' => $drugIds[0],
                'drug_batch_id' => $clinicTwoBatchId,
                'sale_id' => $clinicTwoSaleId,
                'transaction_type' => 'sale',
                'quantity' => -10,
                'reference' => "Seed sale {$clinicTwoSaleId}",
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 19. Payment Method Seeder
        |--------------------------------------------------------------------------
        */

        $this->call([
            PaymentMethodSeeder::class,
            PharmacyInventorySeeder::class,
        ]);

        /*
        |--------------------------------------------------------------------------
        | 20. DEMO DATA
        |--------------------------------------------------------------------------
        |
        | Everything below is the old DemoDataSeeder.
        |
        */

        $days = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];

        $appointmentTypes = [
            'Online',
            'In-Person',
        ];

        $reservationStatuses = [
            'Pending',
            'Confirmed',
            'Completed',
            'Cancelled',
        ];

        $diagnoses = [
            'Routine checkup',
            'Seasonal allergy',
            'Hypertension follow-up',
            'General consultation',
            'Mild headache',
            'Fever',
            'Back pain',
        ];

        $paymentMethods = [
            'Cash',
            'KBZPay',
            'Wave Money',
        ];

        /*
        |--------------------------------------------------------------------------
        | Demo Patients
        |--------------------------------------------------------------------------
        */

        $patientIds = DB::table('patients')
            ->orderBy('id')
            ->pluck('id')
            ->all();

        $patientNumber = 1;

        while (count($patientIds) < $target) {

            $id = sprintf(
                'P-DEMO-%03d',
                $patientNumber
            );

            if (DB::table('patients')->where('id', $id)->exists()) {
                $patientNumber++;

                continue;
            }

            DB::table('patients')->insert([
                'id' => $id,

                'first_name' => 'Demo',
                'middle_name' => 'Patient',

                'last_name' => sprintf(
                    '%03d',
                    $patientNumber
                ),

                'birthdate' => Carbon::now()
                    ->subYears(
                        20 + ($patientNumber % 35)
                    )
                    ->toDateString(),

                'complete_address' => sprintf(
                    'Demo Patient Street %d, Yangon',
                    $patientNumber
                ),

                'contact_number' => sprintf(
                    '09%09d',
                    700000000 + $patientNumber
                ),

                'user_name' => sprintf(
                    'DEMO-PATIENT-%03d',
                    $patientNumber
                ),

                'status' => $patientNumber % 7 === 0
                    ? 'Inactive'
                    : 'Active',

                'password' => $password,

                'email' => sprintf(
                    'demo.patient.%03d@example.test',
                    $patientNumber
                ),

                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $patientIds[] = $id;

            $patientNumber++;
        }

        /*
        |--------------------------------------------------------------------------
        | Demo Doctors
        |--------------------------------------------------------------------------
        */

        $doctorIds = DB::table('doctors')
            ->orderBy('id')
            ->pluck('id')
            ->all();

        $doctorNumber = 1;

        while (count($doctorIds) < $target) {

            $id = sprintf(
                'D-DEMO-%03d',
                $doctorNumber
            );

            if (DB::table('doctors')->where('id', $id)->exists()) {
                $doctorNumber++;

                continue;
            }

            $specializationId = $specializationIds[
                array_rand($specializationIds)
            ];

            DB::table('doctors')->insert([
                'id' => $id,

                'first_name' => 'Demo',
                'middle_name' => 'Medical',

                'last_name' => sprintf(
                    '%03d',
                    $doctorNumber
                ),

                'specialization_id' => $specializationId,

                'complete_address' => sprintf(
                    'Demo Doctor Avenue %d, Yangon',
                    $doctorNumber
                ),

                'photo_path' => $doctorImages[$doctorNumber % count($doctorImages)],

                'email' => sprintf(
                    'demo.doctor.%03d@example.test',
                    $doctorNumber
                ),

                'contact_number' => sprintf(
                    '09%09d',
                    800000000 + $doctorNumber
                ),

                'proof_of_identity' => sprintf(
                    'DEMO-LICENSE-%03d',
                    $doctorNumber
                ),

                'user_name' => sprintf(
                    'DEMO-DOCTOR-%03d',
                    $doctorNumber
                ),

                'status' => 'Active',
                'password' => $password,

                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $doctorIds[] = $id;

            $doctorNumber++;
        }

        DB::table('doctors')->where(function ($query): void {
            $query->whereNull('photo_path')->orWhere('photo_path', 'like', 'https://images.unsplash.com/%');
        })->get(['id'])->each(function (object $doctor) use ($doctorImages): void {
            DB::table('doctors')->where('id', $doctor->id)->update([
                'photo_path' => $doctorImages[abs(crc32($doctor->id)) % count($doctorImages)],
            ]);
        });

        /*
        |--------------------------------------------------------------------------
        | Demo Clinics
        |--------------------------------------------------------------------------
        */

        for (
            $clinicNumber = 1;
            $clinicNumber <= $target;
            $clinicNumber++
        ) {

            /*
             * Pick a real Yangon township for this clinic, and nudge the
             * point by a tiny deterministic offset (about 100-200 m) so
             * clinics in the same township don't sit exactly on top of
             * each other on the map.
             */
            [$townshipName, $baseLat, $baseLng] = $yangonLocations[
                ($clinicNumber - 1) % count($yangonLocations)
            ];

            $round = intdiv($clinicNumber - 1, count($yangonLocations));

            $clinicLat = round($baseLat + (($round % 5) - 2) * 0.0007, 7);
            $clinicLng = round($baseLng + ((intdiv($round, 5) % 5) - 2) * 0.0007, 7);

            /*
             * Find existing demo clinic first.
             */
            $clinicName = sprintf(
                'Demo Health Clinic %03d',
                $clinicNumber
            );

            $clinicId = DB::table('clinics')
                ->where('clinic_name', $clinicName)
                ->value('id');

            /*
             * Create clinic if it doesn't exist.
             */
            if (! $clinicId) {

                do {
                    $clinicCode = random_int(
                        1000,
                        999999
                    );

                    $clinicUserName = sprintf(
                        'CLN-%06d',
                        $clinicCode
                    );
                } while (
                    DB::table('clinics')
                        ->where('user_name', $clinicUserName)
                        ->exists()
                );

                $clinicId = DB::table('clinics')->insertGetId([
                    'clinic_name' => $clinicName,

                    'clinic_permit' => sprintf(
                        'DEMO-PERMIT-%03d',
                        $clinicNumber
                    ),

                    'complete_address' => sprintf(
                        'Demo Clinic Road %d, %s Township, Yangon',
                        $clinicNumber,
                        $townshipName
                    ),

                    'photo_path' => $clinicImages[$clinicNumber % count($clinicImages)],

                    'latitude' => $clinicLat,
                    'longitude' => $clinicLng,

                    'status' => 'Approved',

                    'user_name' => $clinicUserName,

                    'password' => $password,

                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            /*
             * Always refresh coordinates so re-running the seeder on an
             * existing database replaces old random locations.
             */
            DB::table('clinics')->where('id', $clinicId)->update([
                'latitude' => $clinicLat,
                'longitude' => $clinicLng,
            ]);

            DB::table('clinics')->where('id', $clinicId)->where(function ($query): void {
                $query->whereNull('photo_path')->orWhere('photo_path', 'like', 'https://images.unsplash.com/%');
            })->update(['photo_path' => $localImage]);

            /*
            |--------------------------------------------------------------------------
            | Clinic Doctors
            |--------------------------------------------------------------------------
            */

            $clinicDoctorIds = DB::table('clinic_doctor')
                ->where('clinic_id', $clinicId)
                ->pluck('doctor_id')
                ->all();

            /*
             * Only generate 2-5 doctors if this clinic
             * doesn't already have enough.
             */
            if (count($clinicDoctorIds) < 2) {

                $clinicDoctorIds = collect($doctorIds)
                    ->shuffle()
                    ->take(random_int(2, 5))
                    ->values()
                    ->all();

                foreach ($clinicDoctorIds as $doctorId) {

                    DB::table('clinic_doctor')->insertOrIgnore([
                        'clinic_id' => $clinicId,
                        'doctor_id' => $doctorId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Clinic Services
            |--------------------------------------------------------------------------
            */

            $clinicServiceIds = DB::table('clinic_services')
                ->where('clinic_id', $clinicId)
                ->pluck('id')
                ->all();

            if ($clinicServiceIds === []) {

                $serviceCount = random_int(2, 5);

                for (
                    $serviceNumber = 1;
                    $serviceNumber <= $serviceCount;
                    $serviceNumber++
                ) {

                    $doctorId = $clinicDoctorIds[
                        array_rand($clinicDoctorIds)
                    ];

                    $serviceId = DB::table('clinic_services')
                        ->insertGetId([
                            'clinic_id' => $clinicId,

                            'doctor_id' => $doctorId,

                            'service_name' => sprintf(
                                'Clinic %03d Consultation %02d',
                                $clinicNumber,
                                $serviceNumber
                            ),

                            'service_description' => 'Seeded demonstration clinic service.',

                            'image_path' => $serviceImages[$serviceNumber % count($serviceImages)],

                            'amount' => random_int(
                                10000,
                                50000
                            ),

                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);

                    $clinicServiceIds[] = $serviceId;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Clinic Schedules
            |--------------------------------------------------------------------------
            */

            $clinicScheduleIds = DB::table(
                'doctor_clinic_schedules'
            )
                ->where('clinic_id', $clinicId)
                ->pluck('id')
                ->all();

            if ($clinicScheduleIds === []) {

                foreach ($clinicDoctorIds as $doctorId) {

                    $scheduleId = DB::table(
                        'doctor_clinic_schedules'
                    )->insertGetId([
                        'clinic_id' => $clinicId,

                        'doctor_id' => $doctorId,

                        'day_of_week' => $days[
                            array_rand($days)
                        ],

                        'start_time' => '09:00:00',
                        'end_time' => '17:00:00',

                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                    $clinicScheduleIds[] = $scheduleId;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Reservations
            |--------------------------------------------------------------------------
            */

            $existingReservationCount = DB::table('reservations')
                ->where('clinic_id', $clinicId)
                ->count();

            if ($existingReservationCount === 0) {

                $reservationCount = random_int(1, 3);

                for (
                    $reservationNumber = 1;
                    $reservationNumber <= $reservationCount;
                    $reservationNumber++
                ) {

                    /*
                     * Doctor belongs to this clinic.
                     */
                    $doctorId = $clinicDoctorIds[
                        array_rand($clinicDoctorIds)
                    ];

                    /*
                     * Services for this doctor.
                     */
                    $doctorServices = DB::table(
                        'clinic_services'
                    )
                        ->where('clinic_id', $clinicId)
                        ->where('doctor_id', $doctorId)
                        ->pluck('id')
                        ->all();

                    if ($doctorServices === []) {

                        $serviceId = $clinicServiceIds[
                            array_rand($clinicServiceIds)
                        ];
                    } else {

                        $serviceId = $doctorServices[
                            array_rand($doctorServices)
                        ];
                    }

                    /*
                     * Schedule for this doctor.
                     */
                    $doctorSchedules = DB::table(
                        'doctor_clinic_schedules'
                    )
                        ->where('clinic_id', $clinicId)
                        ->where('doctor_id', $doctorId)
                        ->pluck('id')
                        ->all();

                    if ($doctorSchedules === []) {
                        continue;
                    }

                    $scheduleId = $doctorSchedules[
                        array_rand($doctorSchedules)
                    ];

                    /*
                     * Global patient.
                     */
                    $patientId = $patientIds[
                        array_rand($patientIds)
                    ];

                    /*
                     * Service amount.
                     */
                    $service = DB::table('clinic_services')
                        ->where('id', $serviceId)
                        ->where('clinic_id', $clinicId)
                        ->first();

                    if (! $service) {
                        continue;
                    }

                    /*
                     * Unique appointment code.
                     */
                    do {
                        $appointmentCode = sprintf(
                            'DEMO-APT-%08d',
                            random_int(1, 99999999)
                        );
                    } while (
                        DB::table('reservations')
                            ->where(
                                'appointment_code',
                                $appointmentCode
                            )
                            ->exists()
                    );

                    /*
                     * Reservation.
                     */
                    $reservationId = DB::table(
                        'reservations'
                    )->insertGetId([

                        'appointment_code' => $appointmentCode,

                        'patient_id' => $patientId,

                        'doctor_id' => $doctorId,

                        'clinic_id' => $clinicId,

                        'service_id' => $serviceId,

                        'schedule_id' => $scheduleId,

                        'appointment_type' => $appointmentTypes[
                                array_rand(
                                    $appointmentTypes
                                )
                            ],

                        'status' => $reservationStatuses[
                                array_rand(
                                    $reservationStatuses
                                )
                            ],

                        'remarks' => 'Seeded demonstration reservation.',

                        'amount' => $service->amount,

                        'created_at' => Carbon::now()->subDays(
                            random_int(0, 45)
                        ),

                        'updated_at' => $now,
                    ]);

                    /*
                    |--------------------------------------------------------------------------
                    | Consultation
                    |--------------------------------------------------------------------------
                    */

                    DB::table('consultations')->insert([
                        'appointment_code' => $appointmentCode,

                        'date_of_consultation' => Carbon::now()
                            ->subDays(
                                random_int(0, 30)
                            )
                            ->setTime(10, 0),

                        'diagnosis' => $diagnoses[
                                array_rand($diagnoses)
                            ],

                        'treatment' => 'Continue prescribed treatment and follow-up as scheduled.',

                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                    /*
                    |--------------------------------------------------------------------------
                    | Medical Record
                    |--------------------------------------------------------------------------
                    */

                    DB::table('medical_records')->insert([
                        'patient_id' => $patientId,

                        'doctor_id' => $doctorId,

                        'appointment_code' => $appointmentCode,

                        'record_title' => 'Demo consultation record',

                        'notes' => 'Seeded demonstration medical record.',

                        'record_date' => Carbon::now()->subDays(
                            random_int(0, 30)
                        ),

                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                    /*
                    |--------------------------------------------------------------------------
                    | Payment
                    |--------------------------------------------------------------------------
                    */

                    DB::table('payments')->insert([
                        'reservation_id' => $reservationId,

                        'amount' => $service->amount,

                        'payment_method' => $paymentMethods[
                                array_rand(
                                    $paymentMethods
                                )
                            ],

                        'transaction_code' => sprintf(
                            'DEMO-TXN-%08d',
                            $reservationId
                        ),

                        'payment_status' => random_int(1, 4) === 1
                                ? 'Pending'
                                : 'Paid',

                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 21. Demo Notifications
        |--------------------------------------------------------------------------
        */

        foreach (
            $patientIds as $index => $patientId
        ) {

            /*
             * Prevent duplicate demo notifications
             * when running the seeder repeatedly.
             */
            $exists = DB::table('notifications')
                ->where('user_id', $patientId)
                ->where(
                    'title',
                    'Demo clinic update'
                )
                ->exists();

            if (! $exists) {

                DB::table('notifications')->insert([
                    'user_id' => $patientId,

                    'title' => 'Demo clinic update',

                    'message' => 'This is seeded demonstration notification data.',

                    'type' => 'In-App',

                    'status' => $index % 3 === 0
                            ? 'Read'
                            : 'Unread',

                    'created_at' => Carbon::now()->subDays(
                        $index % 30
                    ),
                ]);
            }
        }

        $this->call(OnlineOrderSeeder::class);
    }
}
