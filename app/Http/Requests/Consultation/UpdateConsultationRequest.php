<?php

namespace App\Http\Requests\Consultation;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
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
        ];
    }
}
