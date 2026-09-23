<?php

namespace App\Http\Requests\Consultation;

use App\Models\Reservation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'appointment_code' => [
                'required',
                'string',
                'exists:reservations,appointment_code',
            ],

            'date_of_consultation' => [
                'required',
                'date',
            ],

            'diagnosis' => [
                'required',
                'string',
            ],

            'treatment' => [
                'required',
                'string',
            ],

            'upload_prescription' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ],
            'items' => ['nullable', 'array'],
            'items.*.item_type' => ['required_with:items', 'in:drug,medical_product'],
            'items.*.drug_id' => ['nullable', 'integer', 'exists:drugs,id'],
            'items.*.drug_unit_id' => ['nullable', 'integer', 'exists:drug_units,id'],
            'items.*.medical_product_id' => ['nullable', 'integer', 'exists:medical_products,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'payment_method' => ['required_with:items', 'nullable', Rule::exists('payment_methods', 'name')->where('status', 'Active')],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $clinicId = auth()->user()->id;

            if (! $this->filled('appointment_code')) {
                return;
            }

            $reservation = Reservation::query()
                ->where(
                    'appointment_code',
                    $this->appointment_code
                )
                ->where(
                    'clinic_id',
                    $clinicId
                )
                ->first();

            if (! $reservation) {
                $validator->errors()->add(
                    'appointment_code',
                    'The selected appointment is invalid.'
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Consultation can only start after patient checks in
            |--------------------------------------------------------------------------
            */

            if ($reservation->status !== 'Checked In') {
                $validator->errors()->add(
                    'appointment_code',
                    'The appointment must be Checked In before consultation.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Only one consultation per reservation
            |--------------------------------------------------------------------------
            */

            if ($reservation->consultation()->exists()) {
                $validator->errors()->add(
                    'appointment_code',
                    'This appointment already has a consultation.'
                );
            }
        });
    }
}
