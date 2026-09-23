<?php

namespace App\Actions\Patients;

use App\Models\Nrc;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

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

                'contact_number' => $data['contact_number'],
                'complete_address' => $data['complete_address'],

                // NRC
                'nrc_id' => $nrc->id,
                'nrc_number' => $data['nrc_number'],

                'user_name' => $data['user_name'],

                'status' => $data['status'],
            ]);

            $clinicId = Auth::guard('clinic')->id() ?? Auth::id();

            if ($clinicId) {
                $patient->clinics()->attach($clinicId);
            }

            return $patient;
        });
    }
}
