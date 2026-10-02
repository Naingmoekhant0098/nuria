<?php

namespace App\Http\Requests\Clinic;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClinicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'clinic_name' => 'sometimes|required|string|max:255',
            'clinic_permit' => 'sometimes|required|string|max:255',
            'complete_address' => 'sometimes|required|string',
            'photo' => ['nullable', 'image', 'max:5120'],
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'status' => 'sometimes|required|string',
            'open_time' => [
                'sometimes',
                'required',
                'date_format:H:i',
            ],

            'close_time' => [
                'sometimes',
                'required',
                'date_format:H:i',
                'after:open_time',
            ],
        ];
    }
}
