<?php

namespace App\Actions\ClinicServices;

use App\Models\ClinicService;
use App\Models\ServiceName;
use Illuminate\Support\Facades\Auth;

class CreateClinicServiceAction
{
    public function execute(array $data): ClinicService
    {
        $serviceName = ! empty($data['service_name_id'])
            ? ServiceName::query()->findOrFail($data['service_name_id'])
            : ServiceName::query()->firstOrCreate(['name' => trim((string) $data['service_name'])]);

        return ClinicService::create([
            'clinic_id' => Auth::user()->id,
            'service_name_id' => $serviceName->id,
            'doctor_id' => $data['doctor_id'],
            'service_name' => $serviceName->name,
            'service_description' => $data['service_description'] ?? null,
            'image_path' => $data['image_path'] ?? null,
            'amount' => $data['amount'],
        ]);
    }
}
