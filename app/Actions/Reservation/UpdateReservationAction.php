<?php

namespace App\Actions\Reservation;

use App\Models\Reservation;

class UpdateReservationAction
{
    public function execute(
        Reservation $reservation,
        array $data
    ): Reservation {
        $reservation->update($data);

        return $reservation->fresh();
    }
}
