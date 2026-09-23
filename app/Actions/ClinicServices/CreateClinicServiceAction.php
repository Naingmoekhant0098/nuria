<?php

namespace App\Actions\ClinicServices;

use App\Models\ClinicService;
use Illuminate\Support\Facades\Auth;

class CreateClinicServiceAction
{
    public function execute(array $data): ClinicService
    {
        return ClinicService::create([
            'clinic_id' => Auth::user()->id,
            'doctor_id' => $data['doctor_id'],
            'service_name' => $data['service_name'],
            'service_description' => $data['service_description'] ?? null,
            'amount' => $data['amount'],
        ]);
    }
}
