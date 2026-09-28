<?php

namespace App\Actions\Doctors;

use App\Models\Clinic;
use App\Models\Doctor;
use App\Models\Nrc;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CreateDoctorAction
{
    public function execute(array $data): Doctor
    {
        return DB::transaction(function () use ($data) {
            $currentClinicId =
                Auth::guard('clinic')->id()
                ?? Auth::id();

            $clinic = $currentClinicId
                ? Clinic::query()->whereKey($currentClinicId)->lockForUpdate()->first()
                : null;

            /*
            |--------------------------------------------------------------------------
            | Check existing doctor
            |--------------------------------------------------------------------------
            |
            | Since NRC is now the identity reference, use the NRC information
            | together with email to prevent duplicate doctors.
            |
            */

            $existingDoctor = Doctor::where(
                'nrc_number',
                $data['nrc_number']
            )->first();

            if ($clinic !== null) {
                $alreadyLinked = $existingDoctor?->clinics()->whereKey($clinic->id)->exists() ?? false;
                $doctorLimit = $clinic->planLimit('doctors');

                if (! $alreadyLinked && $doctorLimit !== null && $clinic->doctors()->count() >= $doctorLimit) {
                    throw ValidationException::withMessages([
                        'plan' => ['Your current plan has reached its doctor limit.'],
                    ]);
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Current Clinic
            |--------------------------------------------------------------------------
            */

            /*
            |--------------------------------------------------------------------------
            | Existing Doctor
            |--------------------------------------------------------------------------
            */

            if ($existingDoctor) {

                if ($currentClinicId) {
                    $existingDoctor
                        ->clinics()
                        ->syncWithoutDetaching([
                            $currentClinicId => [
                                'compensation_type' => $data['compensation_type'],
                                'compensation_rate' => $data['compensation_rate'],
                            ],
                        ]);
                }

                return $existingDoctor;
            }

            /*
            |--------------------------------------------------------------------------
            | Generate Doctor ID
            |--------------------------------------------------------------------------
            */

            $doctorId = 'D'.str_pad(
                Doctor::count() + 1,
                3,
                '0',
                STR_PAD_LEFT
            );

            /*
            |--------------------------------------------------------------------------
            | Create User
            |--------------------------------------------------------------------------
            |
            | user_name belongs to Doctor, NOT users.
            |
            */

            $user = User::create([
                'name' => trim(
                    $data['first_name'].' '.
                    ($data['middle_name'] ?? '').' '.
                    $data['last_name']
                ),

                'email' => $data['email'],

                'password' => Hash::make(
                    $data['password']
                ),
            ]);

            /*
            |--------------------------------------------------------------------------
            | Create NRC
            |--------------------------------------------------------------------------
            */

            $nrc = Nrc::create([
                'nrc_state_id' => $data['nrc_state_id'],

                'nrc_township_id' => $data['nrc_township_id'],

                'nrc_type_id' => $data['nrc_type_id'],
            ]);

            /*
            |--------------------------------------------------------------------------
            | Create Doctor
            |--------------------------------------------------------------------------
            */

            $doctor = Doctor::create([
                'id' => $doctorId,

                /*
                 * User relationship
                 */
                'user_id' => $user->id,

                /*
                 * Personal information
                 */
                'first_name' => $data['first_name'],

                'middle_name' => $data['middle_name'] ?? null,

                'last_name' => $data['last_name'],

                /*
                 * Professional information
                 */
                'specialization_id' => $data['specialization_id'],

                /*
                 * Contact
                 */
                'complete_address' => $data['complete_address'],

                'contact_number' => $data['contact_number'],

                'proof_of_identity' => $data['proof_of_identity'],

                /*
                 * NRC
                 */
                'nrc_id' => $nrc->id,

                'nrc_number' => $data['nrc_number'],

                /*
                 * Doctor username
                 *
                 * IMPORTANT:
                 * This is stored in doctors.user_name,
                 * NOT users.user_name.
                 */
                'user_name' => $data['user_name'],

                'email' => $data['email'],

                'password' => Hash::make($data['password']),

                /*
                 * Status
                 */
                'status' => $data['status'],
            ]);

            if ($currentClinicId) {

                $doctor
                    ->clinics()
                    ->attach($currentClinicId, [
                        'compensation_type' => $data['compensation_type'],
                        'compensation_rate' => $data['compensation_rate'],
                    ]);
            }

            return $doctor->fresh([
                'user',
                'specialization',
                'nrc.state',
                'nrc.township',
                'nrc.type',
            ]);
        });
    }
}
