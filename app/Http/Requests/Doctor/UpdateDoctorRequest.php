<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $doctor = $this->route('doctor');

        return [
            'first_name' => ['required', 'string', 'max:255'],

            'middle_name' => ['nullable', 'string', 'max:255'],

            'last_name' => ['required', 'string', 'max:255'],

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

            'complete_address' => [
                'required',
                'string',
            ],

            'contact_number' => [
                'required',
                'string',
                'max:50',
            ],

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

            'proof_of_identity' => [
                'required',
                'string',
            ],

            'user_name' => [
                'required',
                'string',
                'max:255',

            ],

            'password' => [
                'nullable',
                'string',
                'min:8',
            ],

            'status' => [
                'required',
                'in:active,inactive',
            ],
        ];
    }
}
