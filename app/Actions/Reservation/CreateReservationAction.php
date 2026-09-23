<?php

namespace App\Actions\Reservation;

use App\Models\Reservation;

class CreateReservationAction
{
    public function execute(array $data): Reservation
    {
        $clinicId = auth()->user()->id;

        $year = now()->year;

        $lastReservation = Reservation::query()
            ->where('appointment_code', 'like', "APT-{$year}-%")
            ->orderByDesc('id')
            ->first();

        $nextNumber = $lastReservation
            ? ((int) substr($lastReservation->appointment_code, -4)) + 1
            : 1;

        $data['appointment_code'] = sprintf(
            'APT-%d-%04d',
            $year,
            $nextNumber
        );

        $data['clinic_id'] = $clinicId;

        return Reservation::create($data);
    }
}
