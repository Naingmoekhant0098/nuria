<?php

namespace App\Actions\ClinicServices;

use App\Models\ClinicService;

class UpdateClinicServiceAction
{
    public function execute(
        ClinicService $clinicService,
        array $data
    ): ClinicService {
        $clinicService->update([
            'clinic_id' => $data['clinic_id'],
            'doctor_id' => $data['doctor_id'],
            'service_name' => $data['service_name'],
            'service_description' => $data['service_description'] ?? null,
            'amount' => $data['amount'],
        ]);

        return $clinicService->refresh();
    }
}
