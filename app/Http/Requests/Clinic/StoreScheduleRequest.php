<?php

namespace App\Http\Requests\Clinic;

use Illuminate\Foundation\Http\FormRequest;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'clinic_id' => 'required|exists:clinics,id',
            'schedule_date' => 'required|date',
            'slot_available' => 'required|integer|min:0',
        ];
    }
}
