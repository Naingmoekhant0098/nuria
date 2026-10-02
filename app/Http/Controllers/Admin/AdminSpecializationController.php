<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSpecializationController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/specializations/index', [
            'specializations' => Specialization::query()
                ->when($request->input('search'), function ($query, string $search): void {
                    $query->where(function ($query) use ($search): void {
                        $query->where('name', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    });
                })
                ->withCount('doctors')
                ->orderBy('name')
                ->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:specializations,name'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        Specialization::query()->create($validated);

        return to_route('admin.specializations.index')->with('success', 'Specialization created.');
    }

    public function update(Request $request, Specialization $specialization): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:specializations,name,'.$specialization->id],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $specialization->update($validated);

        return to_route('admin.specializations.index')->with('success', 'Specialization updated.');
    }

    public function destroy(Request $request, Specialization $specialization): RedirectResponse
    {
        $doctorsCount = $specialization->doctors()->count();

        if ($doctorsCount > 0) {
            return to_route('admin.specializations.index')->withErrors([
                'specialization' => 'Reassign the '.$doctorsCount.' doctor(s) using this specialization before deleting it.',
            ]);
        }

        $specialization->delete();

        return to_route('admin.specializations.index')->with('success', 'Specialization deleted.');
    }
}
