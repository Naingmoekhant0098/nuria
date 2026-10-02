<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\ClinicService;
use App\Models\ServiceName;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ServiceNameController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('service-names/index', [
            'serviceNames' => ServiceName::query()->withCount('clinicServices')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:service_names,name'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);
        ServiceName::query()->create([
            'name' => trim($data['name']),
            'image_path' => $request->file('image')?->store('service-names', 'public'),
        ]);

        return back()->with('success', 'Service name created successfully.');
    }

    public function update(Request $request, ServiceName $serviceName): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('service_names', 'name')->ignore($serviceName->id)],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_image' => ['nullable', 'boolean'],
        ]);
        $imagePath = $serviceName->image_path;
        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($imagePath);
            $imagePath = $request->file('image')->store('service-names', 'public');
        } elseif ($request->boolean('remove_image')) {
            Storage::disk('public')->delete($imagePath);
            $imagePath = null;
        }
        $serviceName->update(['name' => trim($data['name']), 'image_path' => $imagePath]);
        ClinicService::query()->where('service_name_id', $serviceName->id)->update(['service_name' => trim($data['name'])]);

        return back()->with('success', 'Service name updated successfully.');
    }

    public function destroy(ServiceName $serviceName): RedirectResponse
    {
        abort_unless(Auth::user(), 403);
        if ($serviceName->clinicServices()->exists()) {
            return back()->with('error', 'This service name is already used and cannot be deleted.');
        }
        Storage::disk('public')->delete($serviceName->image_path);
        $serviceName->delete();

        return back()->with('success', 'Service name deleted successfully.');
    }
}
