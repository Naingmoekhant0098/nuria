<?php

namespace App\Actions\Clinic;

use App\Models\Clinic;

class UpdateClinicAction
{
    public function execute(Clinic $clinic, array $data): Clinic
    {
        $clinic->update($data);

        return $clinic->fresh();
    }
}
