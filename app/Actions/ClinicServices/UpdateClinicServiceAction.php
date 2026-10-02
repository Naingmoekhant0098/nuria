<?php

namespace App\Actions\ClinicServices;

use App\Models\ClinicService;
use App\Models\ServiceName;

class UpdateClinicServiceAction
{
    public function execute(
        ClinicService $clinicService,
        array $data
    ): ClinicService {
        $serviceName = null;
        if (array_key_exists('service_name_id', $data) || array_key_exists('service_name', $data)) {
            $serviceName = ! empty($data['service_name_id'])
                ? ServiceName::query()->findOrFail($data['service_name_id'])
                : ServiceName::query()->firstOrCreate(['name' => trim((string) $data['service_name'])]);
        }

        $clinicService->update([
            'service_name_id' => $serviceName?->id ?? $clinicService->service_name_id,
            'doctor_id' => $data['doctor_id'] ?? $clinicService->doctor_id,
            'service_name' => $serviceName?->name ?? $clinicService->service_name,
            'service_description' => $data['service_description'] ?? $clinicService->service_description,
            'image_path' => $data['image_path'] ?? $clinicService->image_path,
            'amount' => $data['amount'] ?? $clinicService->amount,
        ]);

        return $clinicService->refresh();
    }
}
