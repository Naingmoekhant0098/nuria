<?php

use App\Models\Clinic;
use App\Models\ClinicService;
use App\Models\Doctor;
use App\Models\DoctorClinicSchedule;
use App\Models\Specialization;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a clinic can delete its own service', function () {
    $clinic = Clinic::create([
        'clinic_name' => 'Test Clinic',
        'clinic_permit' => 'P-1',
        'complete_address' => 'Yangon',
        'status' => 'Approved',
        'user_name' => 'test-clinic',
        'password' => 'secret',
    ]);
    $specialization = Specialization::create([
        'name' => 'General',
        'description' => 'General practice',
    ]);
    $doctor = Doctor::create([
        'id' => 'DOC-1',
        'first_name' => 'Aye',
        'last_name' => 'Chan',
        'specialization_id' => $specialization->id,
        'complete_address' => 'Yangon',
        'email' => 'doctor@example.com',
        'contact_number' => '09000000001',
        'proof_of_identity' => 'ID',
        'user_name' => 'doctor',
        'status' => 'Active',
        'password' => 'secret',
    ]);
    $service = ClinicService::create([
        'clinic_id' => $clinic->id,
        'doctor_id' => $doctor->id,
        'service_name' => 'Consultation',
        'amount' => 1000,
    ]);

    $this->actingAs($clinic, 'clinic')
        ->delete(route('clinic.services.destroy', $service))
        ->assertRedirect(route('clinic.services.index'));

    $this->assertDatabaseMissing('clinic_services', ['id' => $service->id]);
});

test('a clinic can delete its own doctor schedule', function () {
    $clinic = Clinic::create([
        'clinic_name' => 'Test Clinic',
        'clinic_permit' => 'P-1',
        'complete_address' => 'Yangon',
        'status' => 'Approved',
        'user_name' => 'test-clinic',
        'password' => 'secret',
    ]);
    $specialization = Specialization::create([
        'name' => 'General',
        'description' => 'General practice',
    ]);
    $doctor = Doctor::create([
        'id' => 'DOC-1',
        'first_name' => 'Aye',
        'last_name' => 'Chan',
        'specialization_id' => $specialization->id,
        'complete_address' => 'Yangon',
        'email' => 'doctor@example.com',
        'contact_number' => '09000000001',
        'proof_of_identity' => 'ID',
        'user_name' => 'doctor',
        'status' => 'Active',
        'password' => 'secret',
    ]);
    $schedule = DoctorClinicSchedule::create([
        'clinic_id' => $clinic->id,
        'doctor_id' => $doctor->id,
        'day_of_week' => 'Monday',
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    $this->actingAs($clinic, 'clinic')
        ->delete(route('doctor-schedules.destroy', $schedule))
        ->assertRedirect(route('doctor-schedules.index'));

    $this->assertDatabaseMissing('doctor_clinic_schedules', ['id' => $schedule->id]);
});
