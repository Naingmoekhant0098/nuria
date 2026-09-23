<?php

namespace App\Actions\Doctors;

use App\Models\Doctor;

class DeleteDoctorAction
{
    public function execute(Doctor $doctor): void
    {
        $doctor->delete();
    }
}
