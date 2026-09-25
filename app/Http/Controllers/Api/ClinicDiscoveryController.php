<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicService;
use App\Models\Doctor;
use App\Models\DoctorClinicSchedule;
use App\Models\Patient;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClinicDiscoveryController extends Controller
{
    public function clinics(Request $request): JsonResponse
    {
        $clinics = Clinic::query()
            ->select(['id', 'clinic_name', 'complete_address', 'latitude', 'longitude', 'status'])
            ->when($request->string('search')->trim()->value(), function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('clinic_name', 'like', "%{$search}%")
                        ->orWhere('complete_address', 'like', "%{$search}%");
                });
            })
            ->orderBy('clinic_name')
            ->paginate(20);

        return response()->json($clinics);
    }

    public function doctors(Request $request, Clinic $clinic): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $doctors = $clinic->doctors()
            ->select(['doctors.id', 'first_name', 'middle_name', 'last_name', 'specialization_id'])
            ->with('specialization:id,name')
            ->when($data['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->orderBy('first_name')
            ->paginate(20);

        return response()->json($doctors);
    }

    public function select(Request $request, Clinic $clinic): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();
        $patient->clinics()->syncWithoutDetaching([$clinic->id]);

        return response()->json([
            'clinic' => $clinic->only(['id', 'clinic_name', 'complete_address']),
            'message' => 'Clinic selected successfully.',
        ]);
    }

    public function availability(Request $request, Clinic $clinic, Doctor $doctor): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'time' => ['required', 'date_format:H:i'],
        ]);

        abort_unless($clinic->doctors()->whereKey($doctor->getKey())->exists(), 404);

        $requestedAt = Carbon::createFromFormat('Y-m-d H:i', $data['date'].' '.$data['time']);
        $day = $requestedAt->englishDayOfWeek;

        $schedules = DoctorClinicSchedule::query()
            ->where('clinic_id', $clinic->id)
            ->where('doctor_id', $doctor->id)
            ->where('day_of_week', $day)
            ->where('start_time', '<=', $requestedAt->format('H:i:s'))
            ->where('end_time', '>', $requestedAt->format('H:i:s'))
            ->orderBy('start_time')
            ->get(['id', 'start_time', 'end_time', 'max_patients_per_slot']);

        $bookedCount = Reservation::query()
            ->where('clinic_id', $clinic->id)
            ->where('doctor_id', $doctor->id)
            ->where('appointment_at', $requestedAt)
            ->whereIn('status', ['Reserved', 'Confirmed', 'Checked In'])
            ->count();

        $capacity = $schedules->first()?->max_patients_per_slot ?? 0;

        return response()->json([
            'clinic_id' => $clinic->id,
            'doctor_id' => $doctor->id,
            'appointment_at' => $requestedAt->toIso8601String(),
            'available' => $schedules->isNotEmpty() && $bookedCount < $capacity,
            'within_schedule' => $schedules->isNotEmpty(),
            'booked_patients' => $bookedCount,
            'max_patients' => $capacity,
            'remaining_patients' => max(0, $capacity - $bookedCount),
            'schedules' => $schedules,
        ]);
    }

    public function services(Clinic $clinic, Doctor $doctor): JsonResponse
    {
        abort_unless($clinic->doctors()->whereKey($doctor->getKey())->exists(), 404);

        return response()->json(
            ClinicService::query()
                ->where('clinic_id', $clinic->id)
                ->where('doctor_id', $doctor->id)
                ->orderBy('service_name')
                ->get(['id', 'service_name', 'service_description', 'amount'])
        );
    }
}
