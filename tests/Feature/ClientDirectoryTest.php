<?php

test('example', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
use App\Models\Clinic;
use App\Models\ClinicService;
use App\Models\Doctor;
use App\Models\DoctorClinicSchedule;
use App\Models\Patient;
use App\Models\Reservation;
use App\Models\Specialization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

it('builds the client home from backend records', function () {
    $specialization = Specialization::create([
        'name' => 'Cardiology',
        'description' => 'Heart care',
    ]);
    $clinic = Clinic::create([
        'clinic_name' => 'Backend Health Clinic',
        'clinic_permit' => 'BACKEND-001',
        'complete_address' => 'Yangon',
        'photo_path' => 'https://images.unsplash.com/clinic.jpg',
        'status' => 'Active',
        'user_name' => 'backend-clinic',
        'password' => 'secret',
    ]);
    $doctor = Doctor::create([
        'id' => 'BACKEND-DOC-1',
        'first_name' => 'Backend',
        'last_name' => 'Doctor',
        'specialization_id' => $specialization->id,
        'complete_address' => 'Yangon',
        'email' => 'backend-doctor@example.com',
        'contact_number' => '09000000000',
        'proof_of_identity' => 'ID',
        'user_name' => 'backend-doctor',
        'status' => 'Active',
        'password' => 'secret',
        'photo_path' => 'https://images.unsplash.com/doctor.jpg',
    ]);
    $clinic->doctors()->attach($doctor);

    $this->get(route('client.home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Client/Home')
            ->where('clinics.0.name', 'Backend Health Clinic')
            ->where('doctors.0.name', 'Dr. Backend Doctor')
            ->where('specialties.0', 'Cardiology'));
});

it('builds the client doctor directory from backend records', function () {
    $specialization = Specialization::create([
        'name' => 'Pediatrics',
        'description' => 'Child care',
    ]);
    $clinic = Clinic::create([
        'clinic_name' => 'Children Health Clinic',
        'clinic_permit' => 'BACKEND-002',
        'complete_address' => 'Mandalay',
        'status' => 'Approved',
        'user_name' => 'children-clinic',
        'password' => 'secret',
    ]);
    $doctor = Doctor::create([
        'id' => 'BACKEND-DOC-2',
        'first_name' => 'Child',
        'last_name' => 'Doctor',
        'birthdate' => '1990-01-01',
        'gender' => 'Female',
        'region' => 'Mandalay Region',
        'specialization_id' => $specialization->id,
        'complete_address' => 'Mandalay',
        'email' => 'child-doctor@example.com',
        'contact_number' => '09000000001',
        'proof_of_identity' => 'ID',
        'user_name' => 'child-doctor',
        'status' => 'Active',
        'password' => 'secret',
    ]);
    $clinic->doctors()->attach($doctor);

    $this->get(route('client.doctors', ['q' => 'Child']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Client/Clinics/Index')
            ->has('doctors', 1)
            ->where('doctors.0.name', 'Dr. Child Doctor')
            ->where('doctors.0.spec', 'Pediatrics')
            ->where('doctors.0.gender', 'Female')
            ->where('doctors.0.age', now()->year - 1990 - (now()->format('md') < '0101' ? 1 : 0))
            ->where('doctors.0.region', 'Mandalay Region'));
});

it('shows clinic services, filters doctors, and loads doctor details from the backend', function () {
    $specialization = Specialization::create([
        'name' => 'Dermatology',
        'description' => 'Skin care',
    ]);
    $clinic = Clinic::create([
        'clinic_name' => 'Skin Health Clinic',
        'clinic_permit' => 'BACKEND-003',
        'complete_address' => 'Naypyidaw',
        'status' => 'Active',
        'user_name' => 'skin-clinic',
        'password' => 'secret',
    ]);
    $matchingDoctor = Doctor::create([
        'id' => 'BACKEND-DOC-3',
        'first_name' => 'Skin',
        'last_name' => 'Doctor',
        'specialization_id' => $specialization->id,
        'complete_address' => 'Naypyidaw',
        'email' => 'skin-doctor@example.com',
        'contact_number' => '09000000002',
        'proof_of_identity' => 'ID',
        'user_name' => 'skin-doctor',
        'status' => 'Active',
        'password' => 'secret',
    ]);
    $otherDoctor = Doctor::create([
        'id' => 'BACKEND-DOC-4',
        'first_name' => 'Other',
        'last_name' => 'Doctor',
        'specialization_id' => $specialization->id,
        'complete_address' => 'Naypyidaw',
        'email' => 'other-doctor@example.com',
        'contact_number' => '09000000003',
        'proof_of_identity' => 'ID',
        'user_name' => 'other-doctor',
        'status' => 'Active',
        'password' => 'secret',
    ]);
    $clinic->doctors()->attach([$matchingDoctor->id, $otherDoctor->id]);
    $service = ClinicService::create([
        'clinic_id' => $clinic->id,
        'doctor_id' => $matchingDoctor->id,
        'service_name' => 'Acne consultation',
        'service_description' => 'Personalized skin consultation',
        'amount' => 25000,
    ]);

    $this->get(route('client.clinics.show', $clinic))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Client/Clinics/ShowClinic')
            ->where('clinic.name', 'Skin Health Clinic')
            ->where('services.0.name', 'Acne consultation')
            ->has('doctors', 2));

    $this->get(route('client.clinics.show', [$clinic, 'service_id' => $service->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('selectedServiceId', $service->id)
            ->has('doctors', 1)
            ->where('doctors.0.name', 'Dr. Skin Doctor'));

    $this->get(route('client.clinics.doctors.show', [$clinic, $matchingDoctor]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Client/Clinics/Show')
            ->where('doctor.first_name', 'Skin')
            ->where('services.0.name', 'Acne consultation'));
});

it('shows an authenticated patient reservation as a receipt with related details', function () {
    $specialization = Specialization::create([
        'name' => 'General Medicine',
        'description' => 'Primary care',
    ]);
    $clinic = Clinic::create([
        'clinic_name' => 'Receipt Health Clinic',
        'clinic_permit' => 'BACKEND-004',
        'complete_address' => 'Yangon',
        'status' => 'Active',
        'user_name' => 'receipt-clinic',
        'password' => 'secret',
    ]);
    $doctor = Doctor::create([
        'id' => 'BACKEND-DOC-5',
        'first_name' => 'Receipt',
        'last_name' => 'Doctor',
        'specialization_id' => $specialization->id,
        'complete_address' => 'Yangon',
        'email' => 'receipt-doctor@example.com',
        'contact_number' => '09000000004',
        'proof_of_identity' => 'ID',
        'user_name' => 'receipt-doctor',
        'status' => 'Active',
        'password' => 'secret',
    ]);
    $clinic->doctors()->attach($doctor);
    $service = ClinicService::create([
        'clinic_id' => $clinic->id,
        'doctor_id' => $doctor->id,
        'service_name' => 'General consultation',
        'service_description' => 'Primary care consultation',
        'amount' => 30000,
    ]);
    $schedule = DoctorClinicSchedule::create([
        'clinic_id' => $clinic->id,
        'doctor_id' => $doctor->id,
        'day_of_week' => 'Monday',
        'start_time' => '09:00',
        'end_time' => '12:00',
    ]);
    $patient = Patient::create([
        'id' => 'P-RECEIPT-1',
        'first_name' => 'Receipt',
        'last_name' => 'Patient',
        'complete_address' => 'Yangon',
        'contact_number' => '09000000005',
        'user_name' => 'receipt-patient',
        'status' => 'Active',
        'password' => 'secret',
        'email' => 'receipt-patient@example.com',
    ]);
    $reservation = Reservation::create([
        'appointment_code' => 'APT-RECEIPT-1',
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'clinic_id' => $clinic->id,
        'service_id' => $service->id,
        'schedule_id' => $schedule->id,
        'appointment_at' => now()->addWeek()->startOfWeek()->setTime(9, 0),
        'appointment_type' => 'In-person',
        'status' => 'Reserved',
        'remarks' => 'Bring previous prescription',
        'amount' => 30000,
    ]);

    $this->actingAs($patient, 'patient')
        ->get(route('client.reservations.show', $reservation))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Client/Reservations/Show')
            ->where('reservation.appointment_code', 'APT-RECEIPT-1')
            ->where('reservation.patient.first_name', 'Receipt')
            ->where('reservation.doctor.last_name', 'Doctor')
            ->where('reservation.service.service_name', 'General consultation')
            ->where('reservation.clinic.clinic_name', 'Receipt Health Clinic')
            ->where('reservation.schedule.day_of_week', 'Monday'));
});
