<?php

namespace App\Http\Requests\Clinic;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'doctor_id' => 'sometimes|required|exists:doctors,id',
            'service_name' => 'sometimes|required|string|max:255',
            'service_description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0',
        ];
    }
}
