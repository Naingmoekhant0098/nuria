<?php

namespace App\Http\Requests\Clinic;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'clinic_id' => 'sometimes|required|exists:clinics,id',
            'schedule_date' => 'sometimes|required|date',
            'slot_available' => 'sometimes|required|integer|min:0',
        ];
    }
}
