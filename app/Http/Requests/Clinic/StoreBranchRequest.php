<?php

namespace App\Http\Requests\Clinic;

use Illuminate\Foundation\Http\FormRequest;

class StoreBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'clinic_id' => 'required|exists:clinics,id',
            'branch_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:50',
            'address' => 'required|string',
        ];
    }
}
