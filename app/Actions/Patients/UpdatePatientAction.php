<?php

namespace App\Actions\Patients;

use App\Models\Nrc;
use App\Models\Patient;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UpdatePatientAction
{
    public function execute(
        Patient $patient,
        array $data
    ): Patient {
        return DB::transaction(function () use ($patient, $data) {

            /*
            |--------------------------------------------------------------------------
            | Update User
            |--------------------------------------------------------------------------
            */

            if ($patient->user) {
                $userData = [
                    'name' => trim(
                        $data['first_name'].' '.
                        ($data['middle_name'] ?? '').' '.
                        $data['last_name']
                    ),

                    'email' => $data['email'],
                    'user_name' => $data['user_name'],
                ];

                if (! empty($data['password'])) {
                    $userData['password'] = Hash::make(
                        $data['password']
                    );
                }

                $patient->user->update($userData);
            }

            /*
            |--------------------------------------------------------------------------
            | Update NRC
            |--------------------------------------------------------------------------
            */

            if ($patient->nrc_id) {

                $nrc = Nrc::findOrFail($patient->nrc_id);

                $nrc->update([
                    'nrc_state_id' => $data['nrc_state_id'],
                    'nrc_township_id' => $data['nrc_township_id'],
                    'nrc_type_id' => $data['nrc_type_id'],
                ]);

            } else {

                $nrc = Nrc::create([
                    'nrc_state_id' => $data['nrc_state_id'],
                    'nrc_township_id' => $data['nrc_township_id'],
                    'nrc_type_id' => $data['nrc_type_id'],
                ]);

                $patient->nrc_id = $nrc->id;
            }

            /*
            |--------------------------------------------------------------------------
            | Update Patient
            |--------------------------------------------------------------------------
            */

            $patient->update([
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
            ]);

            return $patient->fresh([
                'user',
                'nrc',
                'nrc.state',
                'nrc.township',
                'nrc.type',
            ]);
        });
    }
}
