<?php

namespace App\Http\Controllers\Clinic;

use App\Actions\ClinicServices\CreateClinicServiceAction;
use App\Actions\ClinicServices\DeleteClinicServiceAction;
use App\Actions\ClinicServices\UpdateClinicServiceAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Clinic\StoreServiceRequest;
use App\Http\Requests\Clinic\UpdateServiceRequest;
use App\Models\ClinicService;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ClinicServiceController extends Controller
{
    public function index(Request $request): Response
    {
        \Log::info('Authenticated user:', [
            'user' => Auth::user(),
        ]);

        return Inertia::render('services/index', [
            'services' => ClinicService::query()
                ->where('clinic_id', Auth::user()->id)
                ->with([

                    'doctor',
                ])
                ->filter($request->only(['search']))
                ->latest()
                ->paginate($request->integer('limit', 10))
                ->withQueryString(),

            'doctors' => Doctor::query()
                ->with('specialization')
                ->whereHas('clinics', fn ($query) => $query->whereKey(Auth::id()))
                ->where('status', 'active')
                ->latest()
                ->get(),

            'filters' => $request->only(['search']),
        ]);
    }

    public function store(
        StoreServiceRequest $request,
        CreateClinicServiceAction $action
    ) {
        $action->execute($request->validated());

        return redirect()
            ->route('clinic.services.index')
            ->with('success', 'Clinic service created successfully.');
    }

    public function update(
        UpdateServiceRequest $request,
        ClinicService $service,
        UpdateClinicServiceAction $action
    ) {
        abort_unless($service->clinic_id === Auth::id(), 404);

        $action->execute(
            $service,
            $request->validated()
        );

        return redirect()
            ->route('clinic.services.index')
            ->with('success', 'Clinic service updated successfully.');
    }

    public function destroy(
        ClinicService $service,
        DeleteClinicServiceAction $action
    ) {
        abort_unless($service->clinic_id === Auth::id(), 404);

        $action->execute($service);

        return redirect()
            ->route('clinic.services.index')
            ->with('success', 'Clinic service deleted successfully.');
    }
}
