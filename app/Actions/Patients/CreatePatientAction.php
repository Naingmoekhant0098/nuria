<?php

namespace App\Actions\Patients;

use App\Models\Clinic;
use App\Models\Nrc;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CreatePatientAction
{
    public function execute(array $data): Patient
    {
        return DB::transaction(function () use ($data) {

            $patientId = 'P'.str_pad(
                Patient::count() + 1,
                3,
                '0',
                STR_PAD_LEFT
            );

            // Create user
            $user = User::create([
                'name' => trim(
                    $data['first_name'].' '.
                    ($data['middle_name'] ?? '').' '.
                    $data['last_name']
                ),
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            // Create NRC reference
            $nrc = Nrc::create([
                'nrc_state_id' => $data['nrc_state_id'],
                'nrc_township_id' => $data['nrc_township_id'],
                'nrc_type_id' => $data['nrc_type_id'],
            ]);

            // Create patient
            $patient = Patient::create([
                'id' => $patientId,

                'user_id' => $user->id,

                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],

                'birthdate' => $data['birthdate'],

                'gender' => $data['gender'] ?? null,

                'contact_number' => $data['contact_number'],
                'complete_address' => $data['complete_address'],

                'region' => $data['region'] ?? null,

                // NRC
                'nrc_id' => $nrc->id,
                'nrc_number' => $data['nrc_number'],

                'user_name' => $data['user_name'],

                'status' => $data['status'],
                'email'=> $data['email'],

                // Store password
                'password' => Hash::make($data['password']),
            ]);

            $clinicId = Auth::guard('clinic')->id() ?? Auth::id();

            if ($clinicId) {
                $clinic = Clinic::query()->whereKey($clinicId)->lockForUpdate()->firstOrFail();
                $patientLimit = $clinic->planLimit('patients');

                if ($patientLimit !== null && $clinic->patients()->count() >= $patientLimit) {
                    throw ValidationException::withMessages([
                        'plan' => ['Your current plan has reached its patient limit.'],
                    ]);
                }

                $patient->clinics()->attach($clinicId);
            }

            return $patient;
        });
    }
}
