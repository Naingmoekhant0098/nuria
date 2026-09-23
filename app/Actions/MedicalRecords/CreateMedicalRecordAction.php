<?php

namespace App\Actions\MedicalRecords;

use App\Models\Consultation;
use App\Models\MedicalRecord;
use Illuminate\Support\Facades\DB;

class CreateMedicalRecordAction
{
    public function execute(
        Consultation $consultation,
        array $data
    ): MedicalRecord {
        return DB::transaction(function () use (
            $consultation,
            $data
        ) {

            $consultation->loadMissing([
                'reservation',
            ]);

            $reservation = $consultation->reservation;

            abort_unless(
                $reservation,
                404,
                'Reservation not found.'
            );

            /*
            |--------------------------------------------------------------------------
            | Create Medical Record
            |--------------------------------------------------------------------------
            */

            $medicalRecord = MedicalRecord::create([

                /*
                 * Patient
                 */
                'patient_id' => $reservation->patient_id,

                /*
                 * Doctor
                 */
                'doctor_id' => $reservation->doctor_id,

                /*
                 * Appointment
                 */
                'appointment_code' => $reservation->appointment_code,

                /*
                 * Medical Record
                 */
                'record_title' => $data['record_title'],

                'file_attachment' => $data['file_attachment'] ?? null,

                'notes' => $data['notes'] ?? null,

                'record_date' => $data['record_date'],
            ]);

            /*
            |--------------------------------------------------------------------------
            | Return Medical Record
            |--------------------------------------------------------------------------
            */

            return $medicalRecord->fresh([
                'patient',
                'doctor',
                'reservation',
            ]);
        });
    }
}
