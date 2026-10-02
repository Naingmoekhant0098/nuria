<?php

namespace App\Http\Controllers\Clinic;

use App\Actions\Clinic\CreateClinicAction;
use App\Actions\Clinic\DeleteClinicAction;
use App\Actions\Clinic\UpdateClinicAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Clinic\StoreClinicRequest;
use App\Http\Requests\Clinic\UpdateClinicRequest;
use App\Models\Clinic;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
    ): RedirectResponse {
        $data = $request->validated();
        $data['photo_path'] = $request->file('photo')?->store('clinics', 'public');

        $action->execute($data);

        return redirect()
            ->route('admin.clinics.index')
            ->with('success', 'Clinic created successfully.');
    }

    public function update(
        UpdateClinicRequest $request,
        Clinic $clinic,
        UpdateClinicAction $action
    ): RedirectResponse {
        $oldPhotoPath = $clinic->photo_path;
        $data = $request->validated();
        $newPhotoPath = $request->file('photo')?->store('clinics', 'public');

        if ($newPhotoPath !== null) {
            $data['photo_path'] = $newPhotoPath;
        }

        $action->execute(
            $clinic,
            $data
        );

        if ($newPhotoPath !== null && $oldPhotoPath !== null && ! str_starts_with($oldPhotoPath, 'http')) {
            Storage::disk('public')->delete($oldPhotoPath);
        }

        return redirect()
            ->route('admin.clinics.index')
            ->with('success', 'Clinic updated successfully.');
    }

    public function destroy(
        Clinic $clinic,
        DeleteClinicAction $action
    ): RedirectResponse {
        $action->execute($clinic);

        return redirect()
            ->route('admin.clinics.index')
            ->with('success', 'Clinic deleted successfully.');
    }
}
