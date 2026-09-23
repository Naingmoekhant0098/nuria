<?php

namespace App\Http\Requests\DoctorSchedule;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDoctorScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'doctor_id' => [
                'required',

                'exists:doctors,id',
            ],

            'day_of_week' => [
                'required',
                'string',
                Rule::in([
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                ]),
            ],

            'start_time' => [
                'required',
                'date_format:H:i',
            ],

            'end_time' => [
                'required',
                'date_format:H:i',
                'after:start_time',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'clinic_id.required' => 'Clinic is required.',
            'clinic_id.exists' => 'The selected clinic does not exist.',

            'doctor_id.required' => 'Doctor is required.',
            'doctor_id.exists' => 'The selected doctor does not exist.',

            'day_of_week.required' => 'Day of week is required.',
            'day_of_week.in' => 'The selected day of week is invalid.',

            'start_time.required' => 'Start time is required.',
            'start_time.date_format' => 'Start time must be in HH:MM format.',

            'end_time.required' => 'End time is required.',
            'end_time.date_format' => 'End time must be in HH:MM format.',
            'end_time.after' => 'End time must be after start time.',
        ];
    }
}
