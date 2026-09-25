<?php

namespace App\Http\Controllers\Clinic;

use App\Actions\Clinic\CreateClinicAction;
use App\Actions\Clinic\DeleteClinicAction;
use App\Actions\Clinic\UpdateClinicAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Clinic\StoreClinicRequest;
use App\Http\Requests\Clinic\UpdateClinicRequest;
use App\Models\Clinic;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClinicController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('clinics/index', [
            'clinics' => Clinic::query()

                ->filter($request->only(['search']))
                ->latest()
                ->paginate($request->integer('limit', 10))
                ->withQueryString(),

            'filters' => $request->only(['search']),
        ]);
    }

    public function store(
        StoreClinicRequest $request,
        CreateClinicAction $action
    ) {
        $action->execute($request->validated());

        return redirect()
            ->route('admin.clinics.index')
            ->with('success', 'Clinic created successfully.');
    }

    public function update(
        UpdateClinicRequest $request,
        Clinic $clinic,
        UpdateClinicAction $action
    ) {
        $action->execute(
            $clinic,
            $request->validated()
        );

        return redirect()
            ->route('admin.clinics.index')
            ->with('success', 'Clinic updated successfully.');
    }

    public function destroy(
        Clinic $clinic,
        DeleteClinicAction $action
    ) {
        $action->execute($clinic);

        return redirect()
            ->route('admin.clinics.index')
            ->with('success', 'Clinic deleted successfully.');
    }
}
