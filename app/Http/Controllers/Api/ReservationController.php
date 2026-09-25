<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicService;
use App\Models\Doctor;
use App\Models\DoctorClinicSchedule;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();

        return response()->json(
            Reservation::query()
                ->with(['clinic:id,clinic_name,complete_address', 'doctor:id,first_name,middle_name,last_name', 'service:id,service_name,amount', 'payments:id,reservation_id,amount,payment_method,transaction_code,payment_image_path,payment_status'])
                ->where('patient_id', $patient->id)
                ->latest('appointment_at')
                ->paginate(20)
        );
    }

    public function store(Request $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();

        $data = $request->validate([
            'clinic_id' => ['required', 'integer', 'exists:clinics,id'],
            'doctor_id' => ['required', 'string', 'exists:doctors,id'],
            'service_id' => ['required', 'integer', 'exists:clinic_services,id'],
            'appointment_at' => ['required', 'date', 'after:now'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'payment_method' => ['required', Rule::in(PaymentMethod::SUPPORTED_NAMES), Rule::exists('payment_methods', 'name')->where('status', 'Active')],
            'transaction_code' => ['required_unless:payment_method,Cash,Cash on Delivery', 'nullable', 'string', 'max:255'],
            'payment_image' => ['required_unless:payment_method,Cash,Cash on Delivery', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $clinic = Clinic::query()->findOrFail($data['clinic_id']);
        $doctor = Doctor::query()->findOrFail($data['doctor_id']);
        $service = ClinicService::query()
            ->whereKey($data['service_id'])
            ->where('clinic_id', $clinic->id)
            ->where('doctor_id', $doctor->id)
            ->first();

        if (! $clinic->doctors()->whereKey($doctor->getKey())->exists() || ! $service) {
            throw ValidationException::withMessages([
                'doctor_id' => ['The selected doctor or service is not available at this clinic.'],
            ]);
        }

        $appointmentAt = Carbon::parse($data['appointment_at']);
        $schedule = DoctorClinicSchedule::query()
            ->where('clinic_id', $clinic->id)
            ->where('doctor_id', $doctor->id)
            ->where('day_of_week', $appointmentAt->englishDayOfWeek)
            ->where('start_time', '<=', $appointmentAt->format('H:i:s'))
            ->where('end_time', '>', $appointmentAt->format('H:i:s'))
            ->orderBy('start_time')
            ->first();

        if (! $schedule) {
            throw ValidationException::withMessages([
                'appointment_at' => ['The doctor is not scheduled at this date and time.'],
            ]);
        }

        $reservation = DB::transaction(function () use ($appointmentAt, $clinic, $doctor, $patient, $request, $schedule, $service, $data): Reservation {
            Doctor::query()
                ->whereKey($doctor->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $alreadyBooked = Reservation::query()
                ->where('clinic_id', $clinic->id)
                ->where('doctor_id', $doctor->id)
                ->where('appointment_at', $appointmentAt)
                ->whereIn('status', ['Reserved', 'Confirmed', 'Checked In'])
                ->lockForUpdate()
                ->count();

            if ($alreadyBooked >= $schedule->max_patients_per_slot) {
                throw ValidationException::withMessages([
                    'appointment_at' => ['This time slot has reached its patient limit.'],
                ]);
            }

            $patient->clinics()->syncWithoutDetaching([$clinic->id]);

            $reservation = Reservation::query()->create([
                'appointment_code' => 'APT-'.now()->format('Y').'-'.Str::upper(Str::random(10)),
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'clinic_id' => $clinic->id,
                'service_id' => $service->id,
                'schedule_id' => $schedule->id,
                'appointment_at' => $appointmentAt,
                'appointment_type' => $service->service_name,
                'status' => 'Reserved',
                'remarks' => $request->input('remarks'),
                'amount' => $service->amount,
            ]);

            Payment::query()->create([
                'reservation_id' => $reservation->id,
                'amount' => $service->amount,
                'payment_method' => $data['payment_method'],
                'transaction_code' => $data['transaction_code'] ?? null,
                'payment_image_path' => $request->hasFile('payment_image') ? $request->file('payment_image')->store('payment-proofs', 'public') : null,
                'payment_status' => 'Pending',
            ]);

            return $reservation;
        });

        return response()->json([
            'reservation' => $reservation->load([
                'clinic:id,clinic_name,complete_address',
                'doctor:id,first_name,middle_name,last_name,specialization_id',
                'service:id,service_name,amount',
                'payments:id,reservation_id,amount,payment_method,transaction_code,payment_image_path,payment_status',
            ]),
        ], 201);
    }
}
