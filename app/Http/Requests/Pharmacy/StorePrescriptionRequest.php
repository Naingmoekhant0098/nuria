<?php

namespace App\Http\Requests\Pharmacy;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePrescriptionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return ['consultation_id' => ['required', 'integer', 'exists:consultations,id'], 'notes' => ['nullable', 'string'], 'items' => ['required', 'array', 'min:1'], 'items.*.drug_id' => ['required', 'integer', 'exists:drugs,id'], 'items.*.drug_unit_id' => ['nullable', 'integer', 'exists:drug_units,id'], 'items.*.quantity' => ['required', 'integer', 'min:1'], 'items.*.instructions' => ['nullable', 'string', 'max:255']];
    }
}
