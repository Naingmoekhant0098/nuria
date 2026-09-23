<?php

namespace App\Actions\Clinic;

use App\Models\Clinic;

class DeleteClinicAction
{
    public function execute(Clinic $clinic): void
    {
        $clinic->delete();
    }
}
