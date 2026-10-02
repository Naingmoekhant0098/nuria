<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ClinicService;
use App\Models\DoctorClinicSchedule;
use App\Models\Reservation;
use Carbon\Carbon;
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
            'clinic_id' => ['required', 'integer', 'exists:clinics,id'],
            'doctor_id' => ['required', 'string', 'exists:doctors,id'],
            'service_id' => ['required', 'integer', 'exists:clinic_services,id'],
            'schedule_id' => ['required', 'integer', 'exists:doctor_clinic_schedules,id'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_type' => ['required', 'string', 'max:50'],
            'remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $schedule = DoctorClinicSchedule::query()
            ->whereKey($data['schedule_id'])
            ->where('clinic_id', $data['clinic_id'])
            ->where('doctor_id', $data['doctor_id'])
            ->firstOrFail();
        $appointmentAt = Carbon::parse($data['appointment_date'].' '.$schedule->start_time);

        abort_unless(
            strtolower((string) $schedule->day_of_week) === strtolower($appointmentAt->englishDayOfWeek),
            422,
            'This doctor is not available on the selected date.'
        );

        abort_unless($appointmentAt->isFuture(), 422, 'This appointment time has already passed.');

        $service = ClinicService::query()
            ->whereKey($data['service_id'])
            ->where('clinic_id', $data['clinic_id'])
            ->where('doctor_id', $data['doctor_id'])
            ->firstOrFail();

        $booked = Reservation::query()
            ->where('clinic_id', $data['clinic_id'])
            ->where('doctor_id', $data['doctor_id'])
            ->where('schedule_id', $data['schedule_id'])
            ->whereDate('appointment_at', $appointmentAt->toDateString())
            ->whereIn('status', ['Pending', 'Reserved', 'Confirmed', 'Checked In'])
            ->count();

        abort_unless($booked < 20, 422, 'This session is full. Please choose another session.');

        $reservation = Reservation::create([
            'appointment_code' => 'APT-'.now()->format('YmdHis').'-'.str()->upper(str()->random(4)),
            'patient_id' => auth('patient')->id(),
            'clinic_id' => $data['clinic_id'],
            'doctor_id' => $data['doctor_id'],
            'service_id' => $data['service_id'],
            'schedule_id' => $data['schedule_id'],
            'appointment_at' => $appointmentAt,
            'appointment_type' => $data['appointment_type'],
            'remarks' => $data['remarks'] ?? null,
            'amount' => $service->amount,
            'status' => 'Reserved',
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
            (string) $reservation->patient_id === (string) auth('patient')->id(),
            403
        );

        $reservation->load([
            'patient',
            'clinic',
            'doctor',
            'service',
            'schedule',
            'payment',
        ]);

        return Inertia::render(
            'Client/Reservations/Show',
            [
                'reservation' => $reservation,
            ]
        );
    }
}
