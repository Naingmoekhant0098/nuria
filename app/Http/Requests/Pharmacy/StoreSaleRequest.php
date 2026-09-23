<?php

namespace App\Http\Requests\Pharmacy;

use App\Models\PaymentMethod;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleRequest extends FormRequest
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
        return ['sale_type' => ['required', 'in:reservation,external'], 'reservation_id' => ['required_if:sale_type,reservation', 'nullable', 'integer'], 'patient_id' => ['nullable', 'string', 'exists:patients,id'], 'prescription_id' => ['nullable', 'integer', 'exists:prescriptions,id'], 'payment_method' => ['required', Rule::in(PaymentMethod::SUPPORTED_NAMES), Rule::exists('payment_methods', 'name')->where('status', 'Active')], 'discount' => ['nullable', 'numeric', 'min:0'], 'tax' => ['nullable', 'numeric', 'min:0'], 'items' => ['required', 'array', 'min:1'], 'items.*.item_type' => ['required', 'in:drug,medical_product,service'], 'items.*.drug_id' => ['nullable', 'integer', 'exists:drugs,id'], 'items.*.drug_unit_id' => ['nullable', 'integer', 'exists:drug_units,id'], 'items.*.medical_product_id' => ['nullable', 'integer', 'exists:medical_products,id'], 'items.*.quantity' => ['required', 'integer', 'min:1'], 'items.*.unit_price' => ['required', 'numeric', 'min:0'], 'items.*.description' => ['nullable', 'string', 'max:255']];
    }
}
