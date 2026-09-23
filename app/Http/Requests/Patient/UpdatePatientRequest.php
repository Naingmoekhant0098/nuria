<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $patientId = $this->route('patient');

        return [
            'first_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'last_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'birthdate' => [
                'sometimes',
                'required',
                'date',
            ],

            'contact_number' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'complete_address' => [
                'sometimes',
                'required',
                'string',
            ],

            // NRC
            'nrc_state_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:nrc_states,id',
            ],

            'nrc_township_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:nrc_townships,id',
            ],

            'nrc_type_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:nrc_types,id',
            ],

            'nrc_number' => [
                'sometimes',
                'required',
                'string',
                'max:50',
            ],

            'user_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('patients', 'user_name')
                    ->ignore($patientId),
            ],

            'password' => [
                'sometimes',
                'nullable',
                'string',
                'min:8',
            ],

            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
            ],

            'status' => [
                'sometimes',
                'required',
                'string',
            ],
        ];
    }
}
