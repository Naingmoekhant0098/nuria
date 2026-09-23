<?php

namespace App\Actions\Reservation;

use App\Models\Reservation;

class DeleteReservationAction
{
    public function execute(Reservation $reservation): void
    {
        $reservation->delete();
    }
}
