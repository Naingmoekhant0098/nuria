<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $target = 120;
        $now = now();
        $password = Hash::make('password123');

        /*
        |--------------------------------------------------------------------------
        | Specializations
        |--------------------------------------------------------------------------
        */

        $specializationIds = DB::table('specializations')
            ->pluck('id')
            ->all();

        if ($specializationIds === []) {
            $specializationIds[] = DB::table('specializations')->insertGetId([
                'name' => 'General Practice',
                'description' => 'General medical care.',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Patients
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
                    ->subYears(20 + ($patientNumber % 35))
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
        | Doctors
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

        DB::table('doctors')->whereNull('photo_path')->get(['id'])->each(function (object $doctor): void {
            $photoPath = sprintf('doctors/demo-portrait-%02d.jpg', (abs(crc32($doctor->id)) % 8) + 1);
            if (Storage::disk('public')->exists($photoPath)) {
                DB::table('doctors')->where('id', $doctor->id)->update(['photo_path' => $photoPath]);
            }
        });

        /*
        |--------------------------------------------------------------------------
        | Clinics / Vendors
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        | Everything below is generated INSIDE each clinic.
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

        $clinicIds = [];

        /*
        |--------------------------------------------------------------------------
        | Create 120 Clinics
        |--------------------------------------------------------------------------
        */

        for ($clinicNumber = 1; $clinicNumber <= $target; $clinicNumber++) {

            /*
             * Generate unique clinic username.
             */
            do {
                $clinicCode = random_int(1000, 999999);

                $clinicUserName = sprintf(
                    'CLN-%06d',
                    $clinicCode
                );
            } while (
                DB::table('clinics')
                    ->where('user_name', $clinicUserName)
                    ->exists()
            );

            /*
             * Create clinic/vendor.
             */
            $clinicId = DB::table('clinics')->insertGetId([
                'clinic_name' => sprintf(
                    'Demo Health Clinic %03d',
                    $clinicNumber
                ),

                'clinic_permit' => sprintf(
                    'DEMO-PERMIT-%03d',
                    $clinicNumber
                ),

                'complete_address' => sprintf(
                    'Demo Clinic Road %d, Yangon',
                    $clinicNumber
                ),

                'latitude' => 16.80 + (
                    random_int(1, 999) / 10000
                ),

                'longitude' => 96.10 + (
                    random_int(1, 999) / 10000
                ),

                'status' => 'Approved',

                'user_name' => $clinicUserName,

                'password' => $password,

                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $clinicIds[] = $clinicId;

            /*
            |--------------------------------------------------------------------------
            | Assign Doctors to THIS Clinic
            |--------------------------------------------------------------------------
            |
            | Each clinic gets 2-5 random doctors.
            |
            */

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

            /*
            |--------------------------------------------------------------------------
            | Services for THIS Clinic
            |--------------------------------------------------------------------------
            */

            $clinicServiceIds = [];

            $serviceCount = random_int(2, 5);

            for ($serviceNumber = 1; $serviceNumber <= $serviceCount; $serviceNumber++) {

                /*
                 * Pick ONLY a doctor belonging to this clinic.
                 */
                $doctorId = $clinicDoctorIds[
                    array_rand($clinicDoctorIds)
                ];

                $serviceId = DB::table('clinic_services')->insertGetId([
                    'clinic_id' => $clinicId,

                    'doctor_id' => $doctorId,

                    'service_name' => sprintf(
                        'Clinic %03d Consultation %02d',
                        $clinicNumber,
                        $serviceNumber
                    ),

                    'service_description' => 'Seeded demonstration clinic service.',

                    'amount' => random_int(10000, 50000),

                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                $clinicServiceIds[] = $serviceId;
            }

            /*
            |--------------------------------------------------------------------------
            | Schedules for THIS Clinic
            |--------------------------------------------------------------------------
            */

            $clinicScheduleIds = [];

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

            /*
            |--------------------------------------------------------------------------
            | Reservations for THIS Clinic
            |--------------------------------------------------------------------------
            |
            | Create 1-3 reservations for each clinic.
            |
            */

            $reservationCount = random_int(1, 3);

            for (
                $reservationNumber = 1;
                $reservationNumber <= $reservationCount;
                $reservationNumber++
            ) {

                /*
                 * Pick doctor belonging to THIS clinic.
                 */
                $doctorIndex = array_rand(
                    $clinicDoctorIds
                );

                $doctorId = $clinicDoctorIds[
                    $doctorIndex
                ];

                /*
                 * Find services belonging to THIS clinic
                 * and this doctor.
                 */
                $doctorServices = DB::table('clinic_services')
                    ->where('clinic_id', $clinicId)
                    ->where('doctor_id', $doctorId)
                    ->pluck('id')
                    ->all();

                /*
                 * If this doctor has no service,
                 * use any service from this clinic.
                 */
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
                 * Find schedules belonging to THIS
                 * clinic and doctor.
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
                 * Random patient.
                 *
                 * Patients are global in this architecture,
                 * so they do not need clinic_id.
                 */
                $patientId = $patientIds[
                    array_rand($patientIds)
                ];

                /*
                 * Get service amount.
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
                 * Reservation belongs to THIS clinic.
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
                            array_rand($appointmentTypes)
                        ],

                    'status' => $reservationStatuses[
                            array_rand($reservationStatuses)
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
                        ->subDays(random_int(0, 30))
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
                |
                | The medical record follows the reservation,
                | therefore it also belongs to the correct
                | clinic indirectly through the reservation.
                |
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
                            array_rand($paymentMethods)
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

        /*
        |--------------------------------------------------------------------------
        | Notifications
        |--------------------------------------------------------------------------
        |
        | Notifications use patient user_id in your current
        | schema, so they remain patient-based rather than
        | clinic-based.
        |
        */

        foreach ($patientIds as $index => $patientId) {

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
}
