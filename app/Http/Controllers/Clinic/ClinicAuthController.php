<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ClinicAuthController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/login');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'user_name' => 'required|string',
            'password' => 'required|string',
        ]);

        $clinic = Clinic::where('user_name', $request->user_name)->first();

        if (! $clinic || ! Hash::check($request->password, $clinic->password)) {
            throw ValidationException::withMessages([
                'user_name' => ['The provided credentials do not match our records.'],
            ]);
        }

        if ($clinic->status !== 'Approved') {
            throw ValidationException::withMessages([
                'user_name' => ['Your account is pending approval or suspended.'],
            ]);
        }

        // ✅ This will now work without errors because driver is 'session'
        Auth::guard('clinic')->login($clinic, $request->boolean('remember'));

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('clinic')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('clinic.login');
    }
}
