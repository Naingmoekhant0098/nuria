<?php

namespace App\Actions\Clinic;

use App\Models\Clinic;

class CreateClinicAction
{
    public function execute(array $data): Clinic
    {
        return Clinic::create($data);
    }
}
