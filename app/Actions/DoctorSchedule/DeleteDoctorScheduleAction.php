<?php

namespace App\Actions\DoctorSchedule;

use App\Models\DoctorClinicSchedule;

class DeleteDoctorScheduleAction
{
    public function execute(DoctorClinicSchedule $doctorClinicSchedule): void
    {
        $doctorClinicSchedule->delete();
    }
}
