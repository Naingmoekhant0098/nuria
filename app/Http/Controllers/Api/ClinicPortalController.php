<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicService;
use App\Models\DoctorClinicSchedule;
use App\Models\Patient;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClinicPortalController extends Controller
{
    public function services(Request $request): JsonResponse
    {
        /** @var Clinic $clinic */
        $clinic = $request->user();

        return response()->json([
            'data' => ClinicService::query()
                ->where('clinic_id', $clinic->id)
                ->with('doctor:id,first_name,middle_name,last_name')
                ->orderBy('service_name')
                ->get(['id', 'doctor_id', 'service_name', 'service_description', 'amount']),
        ]);
    }

    public function doctors(Request $request): JsonResponse
    {
        /** @var Clinic $clinic */
        $clinic = $request->user();
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        return response()->json(
            $clinic->doctors()
                ->select(['doctors.id', 'first_name', 'middle_name', 'last_name', 'specialization_id', 'status'])
                ->with('specialization:id,name')
                ->when($data['search'] ?? null, function ($query, string $search): void {
                    $query->where(function ($query) use ($search): void {
                        $query->where('first_name', 'like', "%{$search}%")
                            ->orWhere('middle_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });
                })
                ->orderBy('first_name')
                ->paginate($data['per_page'] ?? 20)
        );
    }

    public function patients(Request $request): JsonResponse
    {
        /** @var Clinic $clinic */
        $clinic = $request->user();
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $patients = Patient::query()
            ->whereHas('clinics', fn ($query) => $query->where('clinics.id', $clinic->id))
            ->when($data['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('first_name')
            ->paginate($data['per_page'] ?? 20, [
                'id', 'first_name', 'middle_name', 'last_name', 'email', 'contact_number', 'status',
            ]);

        return response()->json($patients);
    }

    public function reservations(Request $request): JsonResponse
    {
        /** @var Clinic $clinic */
        $clinic = $request->user();
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:50'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        return response()->json(
            Reservation::query()
                ->where('clinic_id', $clinic->id)
                ->when($data['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
                ->when($data['search'] ?? null, function ($query, string $search): void {
                    $query->where(function ($query) use ($search): void {
                        $query->where('appointment_code', 'like', "%{$search}%")
                            ->orWhereHas('patient', function ($patientQuery) use ($search): void {
                                $patientQuery->where('first_name', 'like', "%{$search}%")
                                    ->orWhere('last_name', 'like', "%{$search}%");
                            })
                            ->orWhereHas('doctor', function ($doctorQuery) use ($search): void {
                                $doctorQuery->where('first_name', 'like', "%{$search}%")
                                    ->orWhere('last_name', 'like', "%{$search}%");
                            });
                    });
                })
                ->with([
                    'patient:id,first_name,middle_name,last_name,email,contact_number',
                    'doctor:id,first_name,middle_name,last_name',
                    'service:id,service_name,amount',
                ])
                ->latest('appointment_at')
                ->paginate($data['per_page'] ?? 20)
        );
    }

    public function schedules(Request $request): JsonResponse
    {
        /** @var Clinic $clinic */
        $clinic = $request->user();
        $data = $request->validate([
            'doctor_id' => ['nullable', 'string', 'exists:doctors,id'],
        ]);

        $schedules = DoctorClinicSchedule::query()
            ->where('clinic_id', $clinic->id)
            ->when($data['doctor_id'] ?? null, fn ($query, string $doctorId) => $query->where('doctor_id', $doctorId))
            ->with('doctor:id,first_name,middle_name,last_name')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get(['id', 'doctor_id', 'day_of_week', 'start_time', 'end_time']);

        return response()->json(['data' => $schedules]);
    }
}
