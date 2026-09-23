<?php

namespace App\Actions\Patients;

use App\Models\Patient;

class DeletePatientAction
{
    public function execute(Patient $patient): void
    {
        $patient->delete();
    }
}
