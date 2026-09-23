<?php

use App\Models\Clinic;
use App\Models\Doctor;
use App\Models\NrcState;
use App\Models\NrcTownship;
use App\Models\NrcType;
use App\Models\Patient;
use App\Models\Specialization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use App\Actions\Doctors\CreateDoctorAction;

uses(RefreshDatabase::class);

test('a clinic only sees doctors and patients linked to it', function () {
    $clinic = Clinic::create(['clinic_name' => 'Clinic One', 'clinic_permit' => 'P-1', 'complete_address' => 'Yangon', 'status' => 'Approved', 'user_name' => 'clinic-one', 'password' => 'secret']);
    $otherClinic = Clinic::create(['clinic_name' => 'Clinic Two', 'clinic_permit' => 'P-2', 'complete_address' => 'Mandalay', 'status' => 'Approved', 'user_name' => 'clinic-two', 'password' => 'secret']);
    $specialization = Specialization::create(['name' => 'General', 'description' => 'General practice']);
    $doctor = Doctor::create(['id' => 'DOC-1', 'first_name' => 'Aye', 'last_name' => 'Chan', 'specialization_id' => $specialization->id, 'complete_address' => 'Yangon', 'contact_number' => '09000000001', 'proof_of_identity' => 'ID', 'email' => 'doctor-one@example.com', 'user_name' => 'doctor-one', 'status' => 'Active', 'password' => 'secret']);
    $otherDoctor = Doctor::create(['id' => 'DOC-2', 'first_name' => 'Su', 'last_name' => 'Win', 'specialization_id' => $specialization->id, 'complete_address' => 'Mandalay', 'contact_number' => '09000000002', 'proof_of_identity' => 'ID', 'email' => 'doctor-two@example.com', 'user_name' => 'doctor-two', 'status' => 'Active', 'password' => 'secret']);
    $patient = new Patient(['id' => 'PAT-1', 'first_name' => 'Mya', 'last_name' => 'Hla', 'birthdate' => '1990-01-01', 'complete_address' => 'Yangon', 'contact_number' => '09000000003', 'user_name' => 'patient-one', 'status' => 'Active']);
    $patient->forceFill(['password' => 'secret', 'email' => 'patient-one@example.com'])->save();
    $otherPatient = new Patient(['id' => 'PAT-2', 'first_name' => 'Nay', 'last_name' => 'Lin', 'birthdate' => '1991-01-01', 'complete_address' => 'Mandalay', 'contact_number' => '09000000004', 'user_name' => 'patient-two', 'status' => 'Active']);
    $otherPatient->forceFill(['password' => 'secret', 'email' => 'patient-two@example.com'])->save();

    $clinic->doctors()->attach($doctor);
    $otherClinic->doctors()->attach($otherDoctor);
    $patient->clinics()->attach($clinic);
    $otherPatient->clinics()->attach($otherClinic);

    $this->actingAs($clinic, 'clinic')->get(route('doctors.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('doctors.data', 1)->where('doctors.data.0.id', $doctor->id));

    $this->actingAs($clinic, 'clinic')->get(route('patients.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('patients.data', 1)->where('patients.data.0.id', $patient->id));
});

test('doctor creation persists every required doctor credential and links the clinic', function () {
    $clinic = Clinic::create(['clinic_name' => 'Clinic One', 'clinic_permit' => 'P-1', 'complete_address' => 'Yangon', 'status' => 'Approved', 'user_name' => 'clinic-one', 'password' => 'secret']);
    $specialization = Specialization::create(['name' => 'General', 'description' => 'General practice']);
    $state = NrcState::create(['name' => 'Yangon']);
    $township = NrcTownship::create(['name' => 'Bahan', 'state_id' => $state->id]);
    $type = NrcType::create(['name' => 'N']);

    $this->actingAs($clinic, 'clinic');
    $doctor = app(CreateDoctorAction::class)->execute(['first_name' => 'Aye', 'last_name' => 'Chan', 'email' => 'aye@example.com', 'specialization_id' => $specialization->id, 'complete_address' => 'Yangon', 'contact_number' => '09000000001', 'proof_of_identity' => 'ID', 'nrc_state_id' => $state->id, 'nrc_township_id' => $township->id, 'nrc_type_id' => $type->id, 'nrc_number' => '12/ABC(N)123456', 'user_name' => 'aye-chan', 'password' => 'password123', 'status' => 'Active']);

    expect($doctor->email)->toBe('aye@example.com');
    expect($doctor->proof_of_identity)->toBe('ID');
    expect($doctor->password)->not->toBe('password123');
    expect($doctor->user_id)->not->toBeNull();
    expect($doctor->clinics()->whereKey($clinic->id)->exists())->toBeTrue();
});
