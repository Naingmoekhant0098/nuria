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
use App\Models\ServiceName;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ClinicServiceController extends Controller
{
    public function images(): Response
    {
        return Inertia::render('service-images/index', [
            'services' => ClinicService::query()
                ->where('clinic_id', Auth::id())
                ->with(['doctor', 'serviceName'])
                ->latest()
                ->get(),
        ]);
    }

    public function storeImage(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'service_id' => ['required', 'integer', 'exists:clinic_services,id'],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);
        $service = ClinicService::query()->findOrFail($data['service_id']);

        abort_unless($service->clinic_id === Auth::id(), 404);

        Storage::disk('public')->delete($service->image_path);
        $service->update([
            'image_path' => $request->file('image')->store('clinic-services', 'public'),
        ]);

        return back()->with('success', 'Service image uploaded successfully.');
    }

    public function destroyImage(ClinicService $service): RedirectResponse
    {
        abort_unless($service->clinic_id === Auth::id(), 404);

        Storage::disk('public')->delete($service->image_path);
        $service->update(['image_path' => null]);

        return back()->with('success', 'Service image removed successfully.');
    }

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
                    'serviceName',
                ])
                ->filter($request->only(['search']))
                ->latest()
                ->get(),

            'doctors' => Doctor::query()
                ->with('specialization')
                ->whereHas('clinics', fn ($query) => $query->whereKey(Auth::id()))
                ->where('status', 'active')
                ->latest()
                ->get(),
            'serviceNames' => ServiceName::query()->orderBy('name')->get(['id', 'name']),

            'filters' => $request->only(['search']),
        ]);
    }

    public function store(
        StoreServiceRequest $request,
        CreateClinicServiceAction $action
    ) {
        $data = $request->validated();
        $data['image_path'] = $request->file('image')?->store('clinic-services', 'public');
        $action->execute($data);

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

        $data = $request->validated();
        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($service->image_path);
            $data['image_path'] = $request->file('image')->store('clinic-services', 'public');
        } elseif ($request->boolean('remove_image')) {
            Storage::disk('public')->delete($service->image_path);
            $data['image_path'] = null;
        }
        $action->execute($service, $data);

        return redirect()
            ->route('clinic.services.index')
            ->with('success', 'Clinic service updated successfully.');
    }

    public function destroy(
        ClinicService $service,
        DeleteClinicServiceAction $action
    ) {
        abort_unless($service->clinic_id === Auth::id(), 404);

        Storage::disk('public')->delete($service->image_path);

        $action->execute($service);

        return redirect()
            ->route('clinic.services.index')
            ->with('success', 'Clinic service deleted successfully.');
    }
}
