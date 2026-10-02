<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Nrc;
use App\Models\NrcState;
use App\Models\NrcType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClientProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $patient = $request->user('patient');
        $patient->load('nrc');

        return Inertia::render('Client/Profile/Profile', [
            'patient' => $patient,
            'nrcStates' => NrcState::query()->with('townships:id,state_id,name')->where('status', true)->orderBy('name')->get(['id', 'name']),
            'nrcTypes' => NrcType::query()->where('status', true)->orderBy('name')->get(['id', 'name']),
            'bookings' => $patient->reservations()
                ->with([
                    'clinic:id,clinic_name,photo_path',
                    'doctor:id,first_name,middle_name,last_name',
                    'service:id,service_name',
                ])
                ->latest('appointment_at')
                ->limit(8)
                ->get(),
            'orders' => $patient->sales()
                ->with('clinic:id,clinic_name')
                ->latest()
                ->limit(8)
                ->get(),
            'reviews' => $patient->reviews()
                ->with([
                    'clinic:id,clinic_name',
                    'doctor:id,first_name,middle_name,last_name',
                ])
                ->latest()
                ->limit(8)
                ->get(),
            'stats' => [
                'bookings' => $patient->reservations()->count(),
                'orders' => $patient->sales()->count(),
                'reviews' => $patient->reviews()->count(),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $patient = $request->user('patient');
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('patients', 'email')->ignore($patient->id, 'id')],
            'contact_number' => ['nullable', 'string', 'max:50'],
            'complete_address' => ['nullable', 'string'],
            'region' => ['nullable', 'string', 'max:100'],
            'gender' => ['nullable', 'string', 'in:Male,Female,Other'],
            'birthdate' => ['nullable', 'date', 'before:today'],
            'password' => ['nullable', 'string', 'min:8'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'nrc_state_id' => ['nullable', 'integer', 'exists:nrc_states,id'],
            'nrc_township_id' => ['nullable', 'integer', 'exists:nrc_townships,id'],
            'nrc_type_id' => ['nullable', 'integer', 'exists:nrc_types,id'],
            'nrc_number' => ['nullable', 'string', 'max:50'],
        ]);

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        if ($request->hasFile('photo')) {
            if ($patient->photo_path !== null && ! str_starts_with($patient->photo_path, 'http')) {
                Storage::disk('public')->delete($patient->photo_path);
            }

            $data['photo_path'] = $request->file('photo')->store('patients', 'public');
        }

        if (collect(['nrc_state_id', 'nrc_township_id', 'nrc_type_id'])->every(fn (string $field): bool => filled($data[$field] ?? null))) {
            $nrc = $patient->nrc_id ? Nrc::query()->findOrFail($patient->nrc_id) : new Nrc;
            $nrc->fill([
                'nrc_state_id' => $data['nrc_state_id'],
                'nrc_township_id' => $data['nrc_township_id'],
                'nrc_type_id' => $data['nrc_type_id'],
            ]);
            $nrc->save();
            $data['nrc_id'] = $nrc->id;
        }

        unset($data['photo'], $data['nrc_state_id'], $data['nrc_township_id'], $data['nrc_type_id']);

        $patient->update($data);

        return back()->with('success', 'Profile updated successfully.');
    }
}
