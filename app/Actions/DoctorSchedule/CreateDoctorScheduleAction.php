<?php

namespace App\Actions\DoctorSchedule;

use App\Models\DoctorClinicSchedule;

class CreateDoctorScheduleAction
{
    public function execute(array $data): DoctorClinicSchedule
    {
        $data['clinic_id'] = auth()->user()->id;

        return DoctorClinicSchedule::create($data);
    }
}
