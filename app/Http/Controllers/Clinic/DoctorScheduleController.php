<?php

namespace App\Http\Controllers\Clinic;

use App\Actions\DoctorSchedule\CreateDoctorScheduleAction;
use App\Actions\DoctorSchedule\DeleteDoctorScheduleAction;
use App\Actions\DoctorSchedule\UpdateDoctorScheduleAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\DoctorSchedule\StoreDoctorScheduleRequest;
use App\Http\Requests\DoctorSchedule\UpdateDoctorScheduleRequest;
use App\Models\Clinic;
use App\Models\Doctor;
use App\Models\DoctorClinicSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoctorScheduleController extends Controller
{
    // public function index(Request $request): Response
    // {
    //     $schedules = DoctorClinicSchedule::query()
    //         ->with([
    //             'doctor',
    //             'clinic',
    //         ])
    //         ->filter($request->only([
    //             'doctor_id',
    //             'clinic_id',
    //             'day_of_week',
    //             'active_at',
    //             'search',
    //         ]))
    //         ->orderBy('doctor_id')
    //         ->orderBy('clinic_id')
    //         ->orderByRaw("
    //             FIELD(
    //                 day_of_week,
    //                 'Monday',
    //                 'Tuesday',
    //                 'Wednesday',
    //                 'Thursday',
    //                 'Friday',
    //                 'Saturday',
    //                 'Sunday'
    //             )
    //         ")
    //         ->orderBy('start_time')
    //         ->get();

    //     /*
    //     |--------------------------------------------------------------------------
    //     | Group by Doctor
    //     |--------------------------------------------------------------------------
    //     */

    //     $groupedSchedules = $schedules
    //         ->groupBy('doctor_id')
    //         ->map(function ($doctorSchedules) {
    //             $first = $doctorSchedules->first();

    //             return [
    //                 'doctor' => $first->doctor,
    //                 'clinics' => $doctorSchedules
    //                     ->groupBy('clinic_id')
    //                     ->map(function ($clinicSchedules) {
    //                         $first = $clinicSchedules->first();

    //                         return [
    //                             'clinic' => $first->clinic,
    //                             'schedules' => $clinicSchedules->values(),
    //                         ];
    //                     })
    //                     ->values(),
    //             ];
    //         })
    //         ->values();

    //     return Inertia::render('doctor-schedules/index', [
    //         'schedules' => $groupedSchedules,

    //         'doctors' => Doctor::query()
    //             ->orderBy('first_name')
    //             ->get(),

    //         'clinics' => Clinic::query()
    //             ->orderBy('clinic_name')
    //             ->get(),

    //         'filters' => $request->only([
    //             'doctor_id',
    //             'clinic_id',
    //             'day_of_week',
    //             'active_at',
    //             'search',
    //         ]),
    //     ]);
    // }

    public function index(Request $request): Response
    {
        $clinicId = $request->user()->id;

        $schedules = DoctorClinicSchedule::query()
            ->with('doctor')
            ->where('clinic_id', $clinicId)
            ->filter($request->only([
                'doctor_id',
                'day_of_week',
                'active_at',
                'search',
            ]))
            ->orderBy('doctor_id')
            ->orderByRaw("
            FIELD(
                day_of_week,
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
            )
        ")
            ->orderBy('start_time')
            ->get();

        $groupedSchedules = $schedules
            ->groupBy('doctor_id')
            ->map(function ($doctorSchedules) {
                $first = $doctorSchedules->first();

                return [
                    'doctor' => $first->doctor,
                    'schedules' => $doctorSchedules->values(),
                ];
            })
            ->values();

        $doctorIds = $schedules
            ->pluck('doctor_id')
            ->unique()
            ->values();

        return Inertia::render('doctor-schedules/index', [
            'schedules' => $groupedSchedules,

            'doctors' => Doctor::query()
                ->whereHas('clinics', fn ($query) => $query->whereKey($clinicId))
                ->orderBy('first_name')
                ->get(),

            'clinic' => Clinic::find($clinicId),

            'filters' => $request->only([
                'doctor_id',
                'day_of_week',
                'active_at',
                'search',
            ]),
        ]);
    }

    public function store(
        StoreDoctorScheduleRequest $request,
        CreateDoctorScheduleAction $action
    ) {
        $action->execute($request->validated());

        return redirect()
            ->route('doctor-schedules.index')
            ->with('success', 'Doctor schedule created successfully.');
    }

    public function update(
        UpdateDoctorScheduleRequest $request,
        DoctorClinicSchedule $doctorSchedule,
        UpdateDoctorScheduleAction $action
    ) {
        abort_unless($doctorSchedule->clinic_id === $request->user()->id, 404);

        $action->execute(
            $doctorSchedule,
            $request->validated()
        );

        return redirect()
            ->route('doctor-schedules.index')
            ->with('success', 'Doctor schedule updated successfully.');
    }

    public function destroy(
        Request $request,
        DoctorClinicSchedule $doctorSchedule,
        DeleteDoctorScheduleAction $action
    ) {
        abort_unless($doctorSchedule->clinic_id === $request->user()->id, 404);

        $action->execute($doctorSchedule);

        return redirect()
            ->route('doctor-schedules.index')
            ->with('success', 'Doctor schedule deleted successfully.');
    }
}
