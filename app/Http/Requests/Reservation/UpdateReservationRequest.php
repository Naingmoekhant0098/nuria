<?php

namespace App\Http\Requests\Reservation;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $reservationId = $this->route('reservation');

        return [
            'patient_id' => 'sometimes|required|exists:patients,id',
            'doctor_id' => 'sometimes|required|exists:doctors,id',
            'service_id' => 'sometimes|required|exists:clinic_services,id',

            'schedule_id' => [
                'required',
                'integer',
                'exists:doctor_clinic_schedules,id',
            ],
            'appointment_type' => 'sometimes|required|string',
            'status' => 'sometimes|required|string',
            'remarks' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0',
        ];
    }
}
