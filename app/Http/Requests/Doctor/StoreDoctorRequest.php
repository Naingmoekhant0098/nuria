<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',

            'last_name' => 'required|string|max:255',

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:doctors,email',
            ],

            'specialization_id' => [
                'required',
                'exists:specializations,id',
            ],

            'complete_address' => 'required|string',

            'contact_number' => 'required|string|max:50',

            // NRC
            'nrc_state_id' => [
                'required',
                'integer',
                'exists:nrc_states,id',
            ],

            'nrc_township_id' => [
                'required',
                'integer',
                'exists:nrc_townships,id',
            ],

            'nrc_type_id' => [
                'required',
                'integer',
                'exists:nrc_types,id',
            ],

            'nrc_number' => [
                'required',
                'string',
                'max:50',
            ],

            'proof_of_identity' => 'required|string',

            'photo' => ['nullable', 'image', 'max:5120'],

            'user_name' => [
                'required',
                'string',
                'unique:doctors,user_name',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
            ],

            'status' => 'required|string',
            'compensation_type' => [
                'required',
                Rule::in(['monthly_salary', 'hourly_rate', 'per_appointment', 'commission_percentage']),
            ],
            'compensation_rate' => [
                'required',
                'numeric',
                'min:0',
                ...($this->input('compensation_type') === 'commission_percentage' ? ['max:100'] : []),
            ],
        ];
    }
}
