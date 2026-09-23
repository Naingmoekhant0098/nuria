<?php

namespace App\Http\Requests\Reservation;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'service_id' => 'required|exists:clinic_services,id',
            'schedule_id' => [
                'required',
                'integer',
                'exists:doctor_clinic_schedules,id',
            ],
            'appointment_type' => 'required|string',
            'status' => 'required|string',
            'remarks' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
        ];
    }
}
