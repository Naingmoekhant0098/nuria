<?php

namespace App\Actions\ClinicServices;

use App\Models\ClinicService;

class DeleteClinicServiceAction
{
    public function execute(ClinicService $clinic): void
    {
        $clinic->delete();
    }
}
