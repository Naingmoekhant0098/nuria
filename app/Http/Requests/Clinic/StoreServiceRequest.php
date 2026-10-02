<?php

namespace App\Http\Requests\Clinic;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'doctor_id' => 'required|exists:doctors,id',
            'service_name_id' => ['required', 'integer', 'exists:service_names,id'],
            'service_description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
        ];
    }
}
