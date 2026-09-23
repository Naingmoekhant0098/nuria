<?php

namespace App\Http\Controllers\Clinic;

use App\Actions\Patients\CreatePatientAction;
use App\Actions\Patients\DeletePatientAction;
use App\Actions\Patients\UpdatePatientAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\StorePatientRequest;
use App\Http\Requests\Patient\UpdatePatientRequest;
use App\Models\NrcState;
use App\Models\NrcTownship;
use App\Models\NrcType;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(Request $request): Response
    {
        $patients = Patient::query()
            ->whereHas('clinics', fn ($query) => $query->whereKey(auth()->user()->id))
            ->with([
                'user',
                'nrc',
                'nrc.state',
                'nrc.township',
                'nrc.type',
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

        return Inertia::render('patients/index', [
            'patients' => $patients,

            'nrcStates' => $nrcStates,

            'nrcTownships' => $nrcTownships,

            'nrcTypes' => $nrcTypes,

            'filters' => $request->only([
                'search',
            ]),
        ]);
    }

    public function store(
        StorePatientRequest $request,
        CreatePatientAction $action
    ) {
        $action->execute(
            $request->validated()
        );

        return redirect()
            ->route('patients.index')
            ->with(
                'success',
                'Patient created successfully.'
            );
    }

    public function update(
        UpdatePatientRequest $request,
        Patient $patient,
        UpdatePatientAction $action
    ) {
        abort_unless($patient->clinics()->whereKey(auth()->user()->id)->exists(), 404);

        $action->execute(
            $patient,
            $request->validated()
        );

        return redirect()
            ->route('patients.index')
            ->with(
                'success',
                'Patient updated successfully.'
            );
    }

    public function destroy(
        Patient $patient,
        DeletePatientAction $action
    ) {
        abort_unless($patient->clinics()->whereKey(auth()->user()->id)->exists(), 404);

        $action->execute($patient);

        return redirect()
            ->route('patients.index')
            ->with(
                'success',
                'Patient deleted successfully.'
            );
    }
}
