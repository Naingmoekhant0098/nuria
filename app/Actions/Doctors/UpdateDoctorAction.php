<?php

namespace App\Actions\Doctors;

use App\Models\Doctor;
use App\Models\Nrc;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UpdateDoctorAction
{
    public function execute(
        Doctor $doctor,
        array $data
    ): Doctor {

        return DB::transaction(function () use ($doctor, $data) {

            if (
                ! empty($data['nrc_state_id']) &&
                ! empty($data['nrc_township_id']) &&
                ! empty($data['nrc_type_id'])
            ) {

                if ($doctor->nrc_id) {

                    $nrc = Nrc::findOrFail(
                        $doctor->nrc_id
                    );

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

                    $doctor->nrc_id = $nrc->id;
                }

            } else {

                $nrc = null;
            }

            $doctorData = [
                'first_name' => $data['first_name'],

                'middle_name' => $data['middle_name'] ?? null,

                'last_name' => $data['last_name'],

                'specialization_id' => $data['specialization_id'] ?? null,

                'complete_address' => $data['complete_address'] ?? null,

                'contact_number' => $data['contact_number'] ?? null,

                'photo_path' => $data['photo_path'] ?? $doctor->photo_path,

                'nrc_id' => $nrc?->id ?? $doctor->nrc_id,

                'nrc_number' => $data['nrc_number'] ?? null,

                'email' => $data['email'] ?? null,

                'user_name' => $data['user_name'] ?? null,

                /*
                |--------------------------------------------------------------------------
                | Status
                |--------------------------------------------------------------------------
                */

                'status' => $data['status'] ?? 'active',
            ];

            /*
            |--------------------------------------------------------------------------
            | Password
            |--------------------------------------------------------------------------
            */

            if (! empty($data['password'])) {

                $doctorData['password'] =
                    Hash::make(
                        $data['password']
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | Save Doctor
            |--------------------------------------------------------------------------
            */

            $doctor->update($doctorData);

            /*
            |--------------------------------------------------------------------------
            | Attach Doctor to Current Clinic
            |--------------------------------------------------------------------------
            */

            $currentClinicId =
                Auth::guard('clinic')->id()
                ?? Auth::id();

            if ($currentClinicId) {

                $doctor
                    ->clinics()
                    ->syncWithoutDetaching([
                        $currentClinicId => [
                            'compensation_type' => $data['compensation_type'],
                            'compensation_rate' => $data['compensation_rate'],
                        ],
                    ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Reload Doctor
            |--------------------------------------------------------------------------
            */

            return $doctor->fresh([
                'specialization',
                'nrc',
                'nrc.state',
                'nrc.township',
                'nrc.type',
            ]);
        });
    }
}
