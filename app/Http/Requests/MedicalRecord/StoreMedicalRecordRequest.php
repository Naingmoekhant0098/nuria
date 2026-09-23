<?php

namespace App\Http\Requests\MedicalRecord;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicalRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'record_title' => [
                'required',
                'string',
                'max:255',
            ],

            'file_attachment' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ],

            'notes' => [
                'nullable',
                'string',
            ],

            'record_date' => [
                'required',
                'date',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'record_title.required' => 'Record title is required.',

            'file_attachment.file' => 'The attachment must be a valid file.',

            'file_attachment.mimes' => 'The attachment must be a JPG, JPEG, PNG, or PDF file.',

            'file_attachment.max' => 'The attachment may not be larger than 5 MB.',

            'record_date.required' => 'Record date is required.',

            'record_date.date' => 'Record date must be a valid date.',
        ];
    }
}
