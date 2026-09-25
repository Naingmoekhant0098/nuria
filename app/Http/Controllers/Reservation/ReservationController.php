<?php

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\UpdateReservationRequest;
use App\Models\ClinicDrug;
use App\Models\ClinicMedicalProduct;
use App\Models\ClinicService;
use App\Models\Doctor;
use App\Models\DoctorClinicSchedule;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
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
                'max_patients_per_slot',
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

            'appointment_at' => ['required', 'date', 'after:now'],

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
            'payment_method' => ['required', Rule::in(PaymentMethod::SUPPORTED_NAMES), Rule::exists('payment_methods', 'name')->where('status', 'Active')],
            'transaction_code' => ['required_unless:payment_method,Cash,Cash on Delivery', 'nullable', 'string', 'max:255'],
            'payment_image' => ['required_unless:payment_method,Cash,Cash on Delivery', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
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

        $appointmentAt = Carbon::parse($validated['appointment_at']);

        abort_unless(
            $schedule
                && $schedule->day_of_week === $appointmentAt->englishDayOfWeek
                && $schedule->start_time <= $appointmentAt->format('H:i:s')
                && $schedule->end_time > $appointmentAt->format('H:i:s'),
            422,
            'Invalid schedule.'
        );

        /*
        |--------------------------------------------------------------------------
        | Generate Appointment Code
        |--------------------------------------------------------------------------
        */

        $year = now()->year;

        $reservation = DB::transaction(function () use ($appointmentAt, $clinicId, $schedule, $validated, $year): Reservation {
            Doctor::query()->whereKey($schedule->doctor_id)->lockForUpdate()->firstOrFail();

            $activeReservations = Reservation::query()
                ->where('clinic_id', $clinicId)
                ->where('doctor_id', $schedule->doctor_id)
                ->where('appointment_at', $appointmentAt)
                ->whereIn('status', ['Reserved', 'Confirmed', 'Checked In'])
                ->count();

            if ($activeReservations >= $schedule->max_patients_per_slot) {
                throw ValidationException::withMessages([
                    'appointment_at' => ['This time slot has reached its patient limit.'],
                ]);
            }

            $lastReservation = Reservation::query()
                ->where('appointment_code', 'like', "APT-{$year}-%")
                ->orderByDesc('id')
                ->first();

            $nextNumber = $lastReservation
                ? ((int) substr($lastReservation->appointment_code, -4)) + 1
                : 1;

            $appointmentCode = sprintf('APT-%d-%04d', $year, $nextNumber);

            return Reservation::create([
                'appointment_code' => $appointmentCode,
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $validated['doctor_id'],
                'clinic_id' => $clinicId,
                'service_id' => $validated['service_id'],
                'schedule_id' => $validated['schedule_id'],
                'appointment_at' => $appointmentAt,
                'appointment_type' => $validated['appointment_type'],
                'status' => $validated['status'] ?? 'Reserved',
                'remarks' => $validated['remarks'] ?? null,
                'amount' => $validated['amount'],
            ]);
        });
        Payment::query()->create([
            'reservation_id' => $reservation->id,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'transaction_code' => $validated['transaction_code'] ?? null,
            'payment_image_path' => $request->hasFile('payment_image') ? $request->file('payment_image')->store('payment-proofs', 'public') : null,
            'payment_status' => 'Pending',
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

        $appointmentAt = isset($data['appointment_at'])
            ? Carbon::parse($data['appointment_at'])
            : ($reservation->appointment_at
                ? Carbon::parse($reservation->appointment_at)
                : null);

        abort_unless(
            $schedule
                && (! $appointmentAt
                    || ($schedule->day_of_week === $appointmentAt->englishDayOfWeek
                        && $schedule->start_time <= $appointmentAt->format('H:i:s')
                        && $schedule->end_time > $appointmentAt->format('H:i:s'))),
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

        DB::transaction(function () use ($appointmentAt, $data, $reservation, $schedule): void {
            Doctor::query()->whereKey($schedule->doctor_id)->lockForUpdate()->firstOrFail();

            $nextStatus = $data['status'];
            if (
                $appointmentAt
                && in_array($nextStatus, ['Reserved', 'Confirmed', 'Checked In'], true)
                && Reservation::query()
                    ->where('clinic_id', $schedule->clinic_id)
                    ->where('doctor_id', $schedule->doctor_id)
                    ->where('appointment_at', $appointmentAt)
                    ->whereIn('status', ['Reserved', 'Confirmed', 'Checked In'])
                    ->where('id', '!=', $reservation->id)
                    ->count() >= $schedule->max_patients_per_slot
            ) {
                throw ValidationException::withMessages([
                    'appointment_at' => ['This time slot has reached its patient limit.'],
                ]);
            }

            $reservation->update([
                'patient_id' => $data['patient_id'],
                'doctor_id' => $data['doctor_id'],
                'service_id' => $data['service_id'],
                'schedule_id' => $data['schedule_id'],
                'appointment_at' => $appointmentAt,
                'appointment_type' => $data['appointment_type'],
                'status' => $nextStatus,
                'remarks' => $data['remarks'] ?? null,
                'amount' => $data['amount'],
            ]);
        });

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
