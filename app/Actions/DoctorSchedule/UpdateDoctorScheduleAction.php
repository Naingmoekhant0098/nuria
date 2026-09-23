<?php

namespace App\Actions\DoctorSchedule;

use App\Models\DoctorClinicSchedule;

class UpdateDoctorScheduleAction
{
    public function execute(
        DoctorClinicSchedule $doctorClinicSchedule,
        array $data
    ): DoctorClinicSchedule {
        $doctorClinicSchedule->update($data);

        return $doctorClinicSchedule->fresh();
    }
}
