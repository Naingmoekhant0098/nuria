<?php

namespace App\Http\Requests\MedicalRecord;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => 'sometimes|required|exists:patients,id',
            'doctor_id' => 'sometimes|required|exists:doctors,id',
            'record_title' => 'sometimes|required|string|max:255',
            'file_attachment' => 'nullable|string',
            'notes' => 'nullable|string',
            'record_date' => 'sometimes|required|date',
        ];
    }
}
