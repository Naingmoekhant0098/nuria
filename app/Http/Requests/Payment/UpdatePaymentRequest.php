<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reservation_id' => 'sometimes|required|exists:reservations,id',
            'amount' => 'sometimes|required|numeric|min:0',
            'payment_method' => 'sometimes|required|string|max:100',
            'transaction_code' => 'nullable|string|max:255',
            'payment_status' => 'sometimes|required|string|max:50',
        ];
    }
}
