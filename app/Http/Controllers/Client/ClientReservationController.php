<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientReservationController extends Controller
{
    public function index(): Response
    {
        $reservations = auth('patient')
            ->user()
            ->reservations()
            ->with([
                'clinic',
                'doctor',
                'service',
            ])
            ->latest()
            ->paginate(10);

        return Inertia::render('Client/Reservations/Index', [
            'reservations' => $reservations,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Client/Reservations/Create', [
            'clinicId' => $request->query('clinic'),
            'doctorId' => $request->query('doctor'),
            'serviceId' => $request->query('service'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'clinic_id' => [
                'required',
                'integer',
            ],
            'doctor_id' => [
                'required',
                'integer',
            ],
            'service_id' => [
                'required',
                'integer',
            ],
            'reservation_date' => [
                'required',
                'date',
            ],
            'start_time' => [
                'required',
            ],
            'note' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $reservation = Reservation::create([
            'patient_id' => auth('patient')->id(),
            'clinic_id' => $data['clinic_id'],
            'doctor_id' => $data['doctor_id'],
            'service_id' => $data['service_id'],
            'reservation_date' => $data['reservation_date'],
            'start_time' => $data['start_time'],
            'note' => $data['note'] ?? null,
            'status' => 'Pending',
        ]);

        return redirect()
            ->route(
                'client.reservations.show',
                $reservation
            )
            ->with(
                'success',
                'Reservation created successfully.'
            );
    }

    public function show(Reservation $reservation): Response
    {
        abort_unless(
            (int) $reservation->patient_id ===
            (int) auth('patient')->id(),
            403
        );

        $reservation->load([
            'clinic',
            'doctor',
            'service',
        ]);

        return Inertia::render(
            'Client/Reservations/Show',
            [
                'reservation' => $reservation,
            ]
        );
    }
}
