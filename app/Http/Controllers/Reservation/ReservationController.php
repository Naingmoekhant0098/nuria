<?php

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\UpdateReservationRequest;
use App\Models\ClinicService;
use App\Models\ClinicDrug;
use App\Models\ClinicMedicalProduct;
use App\Models\Doctor;
use App\Models\DoctorClinicSchedule;
use App\Models\Patient;
use App\Models\PaymentMethod;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | INDEX
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): Response
    {
        // IMPORTANT:
        // In your system, authenticated user's ID is the clinic ID.
        $clinicId = auth()->user()->id;

        $reservations = Reservation::query()
            ->with([
                'patient',
                'doctor',
                'clinic',
                'service',
                'schedule',
                'consultation',
            ])
            ->where('clinic_id', $clinicId)

            ->when(
                $request->filled('search'),
                function ($query) use ($request) {
                    $search = $request->search;

                    $query->where(function ($query) use ($search) {
                        $query
                            ->where(
                                'appointment_code',
                                'like',
                                "%{$search}%"
                            )

                            ->orWhere(
                                'appointment_type',
                                'like',
                                "%{$search}%"
                            )

                            ->orWhereHas(
                                'patient',
                                function ($query) use ($search) {
                                    $query
                                        ->where(
                                            'first_name',
                                            'like',
                                            "%{$search}%"
                                        )
                                        ->orWhere(
                                            'middle_name',
                                            'like',
                                            "%{$search}%"
                                        )
                                        ->orWhere(
                                            'last_name',
                                            'like',
                                            "%{$search}%"
                                        );
                                }
                            )

                            ->orWhereHas(
                                'doctor',
                                function ($query) use ($search) {
                                    $query
                                        ->where(
                                            'first_name',
                                            'like',
                                            "%{$search}%"
                                        )
                                        ->orWhere(
                                            'middle_name',
                                            'like',
                                            "%{$search}%"
                                        )
                                        ->orWhere(
                                            'last_name',
                                            'like',
                                            "%{$search}%"
                                        );
                                }
                            );
                    });
                }
            )

            ->when(
                $request->filled('status'),
                function ($query) use ($request) {
                    $query->where(
                        'status',
                        $request->status
                    );
                }
            )

            ->latest()
            ->paginate(
                $request->integer('limit', 10)
            )
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Patients
        |--------------------------------------------------------------------------
        */

        $patients = Patient::query()
            ->whereHas('clinics', fn ($query) => $query->whereKey($clinicId))
            ->select([
                'id',
                'first_name',
                'middle_name',
                'last_name',
            ])
            ->orderBy('first_name')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Doctors
        |--------------------------------------------------------------------------
        */

        $doctors = Doctor::query()
            ->whereHas('clinics', fn ($query) => $query->whereKey($clinicId))
            ->select([
                'id',
                'first_name',
                'middle_name',
                'last_name',
            ])
            ->orderBy('first_name')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Services
        |--------------------------------------------------------------------------
        */

        $services = ClinicService::query()
            ->where('clinic_id', $clinicId)
            ->select([
                'id',
                'clinic_id',
                'doctor_id',
                'service_name',
                'amount',
            ])
            ->orderBy('service_name')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Schedules
        |--------------------------------------------------------------------------
        */

        $schedules = DoctorClinicSchedule::query()
            ->where('clinic_id', $clinicId)
            ->select([
                'id',
                'clinic_id',
                'doctor_id',
                'day_of_week',
                'start_time',
                'end_time',
            ])
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return Inertia::render(
            'reservations/index',
            [
                'reservations' => $reservations,

                'patients' => $patients,

                'doctors' => $doctors,

                'services' => $services,

                'schedules' => $schedules,

                'filters' => $request->only([
                    'search',
                    'status',
                ]),

                'statuses' => [
                    'Reserved',
                    'Confirmed',
                    'Checked In',
                    'Checked Out',
                    'Cancelled',
                    'No Show',
                ],
                'clinicDrugs' => ClinicDrug::query()->with(['drug.units' => fn ($query) => $query->where('is_active', true)])->where('clinic_id', $clinicId)->where('is_active', true)->get(),
                'clinicMedicalProducts' => ClinicMedicalProduct::query()->with('product')->where('clinic_id', $clinicId)->where('is_active', true)->get(),
                'paymentMethods' => PaymentMethod::query()->supported()->where('status', 'Active')->orderBy('name')->get(['id', 'name']),
            ]
        );
    }

    public function store(Request $request)
    {
        // In your system, user ID = clinic ID.
        $clinicId = auth()->user()->id;

        $validated = $request->validate([
            'patient_id' => [
                'required',
                'string',
                'exists:patients,id',
            ],

            'doctor_id' => [
                'required',
                'string',
                'exists:doctors,id',
            ],

            'service_id' => [
                'required',
                'integer',
                'exists:clinic_services,id',
            ],

            'schedule_id' => [
                'required',
                'integer',
                'exists:doctor_clinic_schedules,id',
            ],

            'appointment_type' => [
                'required',
                'string',
                'max:255',
            ],

            'status' => [
                'nullable',
                'string',
                Rule::in([
                    'Reserved',
                    'Confirmed',
                ]),
            ],

            'remarks' => [
                'nullable',
                'string',
            ],

            'amount' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Validate Service
        |--------------------------------------------------------------------------
        */

        $service = ClinicService::query()
            ->where(
                'id',
                $validated['service_id']
            )
            ->where(
                'clinic_id',
                $clinicId
            )
            ->where(
                'doctor_id',
                $validated['doctor_id']
            )
            ->first();

        abort_unless(
            $service,
            422,
            'Invalid service.'
        );

        /*
        |--------------------------------------------------------------------------
        | Validate Schedule
        |--------------------------------------------------------------------------
        */

        $schedule = DoctorClinicSchedule::query()
            ->where(
                'id',
                $validated['schedule_id']
            )
            ->where(
                'clinic_id',
                $clinicId
            )
            ->where(
                'doctor_id',
                $validated['doctor_id']
            )
            ->first();

        abort_unless(
            $schedule,
            422,
            'Invalid schedule.'
        );

        /*
        |--------------------------------------------------------------------------
        | Generate Appointment Code
        |--------------------------------------------------------------------------
        */

        $year = now()->year;

        $lastReservation = Reservation::query()
            ->where(
                'appointment_code',
                'like',
                "APT-{$year}-%"
            )
            ->orderByDesc('id')
            ->first();

        $nextNumber = $lastReservation
            ? ((int) substr(
                $lastReservation->appointment_code,
                -4
            )) + 1
            : 1;

        $appointmentCode = sprintf(
            'APT-%d-%04d',
            $year,
            $nextNumber
        );

        /*
        |--------------------------------------------------------------------------
        | Create Reservation
        |--------------------------------------------------------------------------
        */

        Reservation::create([
            'appointment_code' => $appointmentCode,

            'patient_id' => $validated['patient_id'],

            'doctor_id' => $validated['doctor_id'],

            'clinic_id' => $clinicId,

            'service_id' => $validated['service_id'],

            'schedule_id' => $validated['schedule_id'],

            'appointment_type' => $validated['appointment_type'],

            'status' => $validated['status'] ?? 'Reserved',

            'remarks' => $validated['remarks'] ?? null,

            'amount' => $validated['amount'],
        ]);

        return redirect()
            ->route('reservations.index')
            ->with(
                'success',
                'Reservation created successfully.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    */

    public function show(
        Reservation $reservation
    ): Response {
        $this->authorizeReservation(
            $reservation
        );

        $reservation->load([
            'patient',
            'doctor',
            'clinic',
            'service',
            'schedule',
            'consultation',
        ]);

        return Inertia::render(
            'reservations/detail',
            [
                'reservation' => $reservation,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    public function update(
        UpdateReservationRequest $request,
        Reservation $reservation
    ) {

        $clinicId = auth()->user()->id;

        abort_unless(
            (int) $reservation->clinic_id === (int) $clinicId,
            404
        );

        if (
            $reservation->status === 'Checked Out'
        ) {
            return back()->withErrors([
                'status' => 'Checked Out reservation cannot be modified.',
            ]);
        }

        $data = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | Validate Service
        |--------------------------------------------------------------------------
        */

        $service = ClinicService::query()
            ->where(
                'id',
                $data['service_id']
            )
            ->where(
                'clinic_id',
                $clinicId
            )
            ->where(
                'doctor_id',
                $data['doctor_id']
            )
            ->first();

        abort_unless(
            $service,
            422,
            'Invalid service.'
        );

        /*
        |--------------------------------------------------------------------------
        | Validate Schedule
        |--------------------------------------------------------------------------
        */

        $schedule = DoctorClinicSchedule::query()
            ->where(
                'id',
                $data['schedule_id']
            )
            ->where(
                'clinic_id',
                $clinicId
            )
            ->where(
                'doctor_id',
                $data['doctor_id']
            )
            ->first();

        abort_unless(
            $schedule,
            422,
            'Invalid schedule.'
        );

        /*
        |--------------------------------------------------------------------------
        | Validate Status Transition
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        | Method accepts:
        |
        | Reservation $reservation
        | string $newStatus
        |
        | So DO NOT pass 3 arguments here.
        |--------------------------------------------------------------------------
        */

        $this->validateStatusTransition(
            $reservation,
            $data['status']
        );

        /*
        |--------------------------------------------------------------------------
        | Checked Out Requires Consultation
        |--------------------------------------------------------------------------
        */

        if (
            $data['status'] === 'Checked Out' &&
            ! $reservation
                ->consultation()
                ->exists()
        ) {
            return back()->withErrors([
                'status' => 'Please complete the consultation before checking out.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Update Reservation
        |--------------------------------------------------------------------------
        */

        $reservation->update([
            'patient_id' => $data['patient_id'],

            'doctor_id' => $data['doctor_id'],

            'service_id' => $data['service_id'],

            'schedule_id' => $data['schedule_id'],

            'appointment_type' => $data['appointment_type'],

            'status' => $data['status'],

            'remarks' => $data['remarks'] ?? null,

            'amount' => $data['amount'],
        ]);

        return redirect()
            ->route('reservations.index')
            ->with(
                'success',
                'Reservation updated successfully.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | DESTROY
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Reservation $reservation
    ) {
        $this->authorizeReservation(
            $reservation
        );

        if (
            $reservation->status === 'Checked Out'
        ) {
            return back()->withErrors([
                'error' => 'Checked Out reservations cannot be deleted.',
            ]);
        }

        $reservation->delete();

        return redirect()
            ->route('reservations.index')
            ->with(
                'success',
                'Reservation deleted successfully.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | AUTHORIZE RESERVATION
    |--------------------------------------------------------------------------
    */

    private function authorizeReservation(
        Reservation $reservation
    ): void {
        // IMPORTANT:
        // Your system uses user ID as clinic ID.
        $clinicId = auth()->user()->id;

        abort_unless(
            (int) $reservation->clinic_id === (int) $clinicId,
            404
        );
    }

    /*
    |--------------------------------------------------------------------------
    | STATUS TRANSITION
    |--------------------------------------------------------------------------
    */

    private function validateStatusTransition(
        Reservation $reservation,
        string $newStatus
    ): void {
        $currentStatus =
            $reservation->status;

        $allowedTransitions = [
            'Pending' => [
                'Confirmed',
                'Cancelled',
            ],
            'Reserved' => [
                'Reserved',
                'Confirmed',
                'Cancelled',
                'No Show',
            ],

            'Confirmed' => [
                'Confirmed',
                'Checked In',
                'Cancelled',
                'No Show',
            ],

            'Checked In' => [
                'Checked In',
                'Checked Out',
            ],

            'Checked Out' => [
                'Checked Out',
            ],

            'Cancelled' => [
                'Cancelled',
            ],

            'No Show' => [
                'No Show',
            ],
        ];

        $allowed =
            $allowedTransitions[$currentStatus] ?? [];

        abort_unless(
            in_array(
                $newStatus,
                $allowed,
                true
            ),
            422,
            "Cannot change reservation from {$currentStatus} to {$newStatus}."
        );
    }
}
