<?php

namespace App\Http\Controllers\Clinic;

use App\Actions\Doctors\CreateDoctorAction;
use App\Actions\Doctors\DeleteDoctorAction;
use App\Actions\Doctors\UpdateDoctorAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreDoctorRequest;
use App\Http\Requests\Doctor\UpdateDoctorRequest;
use App\Models\Doctor;
use App\Models\NrcState;
use App\Models\NrcTownship;
use App\Models\NrcType;
use App\Models\Specialization;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoctorController extends Controller
{
    /**
     * Display doctors.
     */
    public function index(Request $request): Response
    {
        $clinicId = auth()->user()->id;
        $doctors = Doctor::query()
            ->whereHas('clinics', fn ($query) => $query->whereKey($clinicId))
            ->with([
                'specialization',
                'user',
                'nrc',
                'nrc.state',
                'nrc.township',
                'nrc.type',
                'clinics' => fn ($query) => $query->whereKey($clinicId),
            ])
            ->filter(
                $request->only(['search'])
            )
            ->latest()
            ->paginate(
                $request->integer('limit', 10)
            )
            ->withQueryString();

        $nrcStates = NrcState::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        $nrcTownships = NrcTownship::query()
            ->orderBy('name')
            ->get([
                'id',
                'state_id',
                'name',
            ]);

        $nrcTypes = NrcType::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        return Inertia::render('doctors/index', [
            'doctors' => $doctors,

            'nrcStates' => $nrcStates,

            'nrcTownships' => $nrcTownships,

            'nrcTypes' => $nrcTypes,

            'specializations' => Specialization::query()
                ->orderBy('name')
                ->get(),

            'filters' => $request->only([
                'search',
            ]),
        ]);
    }

    public function store(
        StoreDoctorRequest $request,
        CreateDoctorAction $action
    ) {
        $action->execute(
            $request->validated()
        );

        return redirect()
            ->route('doctors.index')
            ->with(
                'success',
                'Doctor created successfully.'
            );
    }

    public function update(
        UpdateDoctorRequest $request,
        Doctor $doctor,
        UpdateDoctorAction $action
    ) {
        abort_unless($doctor->clinics()->whereKey(auth()->user()->id)->exists(), 404);

        $action->execute(
            $doctor,
            $request->validated()
        );

        return redirect()
            ->route('doctors.index')
            ->with(
                'success',
                'Doctor updated successfully.'
            );
    }

    public function destroy(
        Doctor $doctor,
        DeleteDoctorAction $action
    ) {
        abort_unless($doctor->clinics()->whereKey(auth()->user()->id)->exists(), 404);

        $action->execute($doctor);

        return redirect()
            ->route('doctors.index')
            ->with(
                'success',
                'Doctor deleted successfully.'
            );
    }
}
