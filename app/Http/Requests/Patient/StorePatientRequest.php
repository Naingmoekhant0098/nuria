<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => [
                'required',
                'string',
                'max:255',
            ],

            'last_name' => [
                'required',
                'string',
                'max:255',
            ],

            'birthdate' => [
                'required',
                'date',
            ],

            'contact_number' => [
                'required',
                'string',
                'max:50',
            ],

            'complete_address' => [
                'required',
                'string',
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

            'user_name' => [
                'required',
                'string',
                'unique:patients,user_name',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
            ],

            'status' => [
                'required',
                'string',
            ],
        ];
    }
}
