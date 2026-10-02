<?php

namespace App\Http\Requests\Clinic;

use Illuminate\Foundation\Http\FormRequest;

class StoreClinicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'clinic_name' => 'required|string|max:255',
            'clinic_permit' => 'required|string|max:255',
            'complete_address' => 'required|string',
            'photo' => ['nullable', 'image', 'max:5120'],
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'status' => 'required|string',
            'open_time' => [
                'required',
                'date_format:H:i',
            ],

            'close_time' => [
                'required',
                'date_format:H:i',
                'after:open_time',
            ],

        ];

    }
}
