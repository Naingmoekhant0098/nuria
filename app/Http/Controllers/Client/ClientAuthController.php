<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ClientAuthController extends Controller
{
    public function showLogin(): Response
    {
        return Inertia::render('Client/Auth/Login');
    }

    public function showRegister(): Response
    {
        return Inertia::render('Client/Auth/Register');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => [
                'required',
                'email',
            ],
            'password' => [
                'required',
                'string',
            ],
        ]);

        if (! Auth::guard('patient')->attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => 'The provided credentials are incorrect.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()
            ->route('client.profile')
            ->with('success', 'Login successful.');
    }

    public function register(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:patients,email',
            ],
            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $nameParts = preg_split('/\s+/', trim($data['name']), -1, PREG_SPLIT_NO_EMPTY);
        $firstName = array_shift($nameParts) ?: 'Patient';
        $lastName = count($nameParts) > 0 ? array_pop($nameParts) : $firstName;
        $baseUserName = Str::before($data['email'], '@');
        $userName = $baseUserName;
        $suffix = 1;
        while (Patient::query()->where('user_name', $userName)->exists()) {
            $userName = $baseUserName.$suffix++;
        }

        $patient = Patient::create([
            'id' => 'P'.str_pad((string) (Patient::count() + 1), 3, '0', STR_PAD_LEFT),
            'first_name' => $firstName,
            'middle_name' => count($nameParts) > 0 ? implode(' ', $nameParts) : null,
            'last_name' => $lastName,
            'email' => $data['email'],
            'contact_number' => $data['phone'] ?? '',
            'complete_address' => '',
            'user_name' => $userName,
            'status' => 'active',
            'password' => $data['password'],
        ]);

        Auth::guard('patient')->login($patient);

        $request->session()->regenerate();

        return redirect()
            ->route('client.profile')
            ->with('success', 'Account created successfully.');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('patient')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('client.home');
    }
}
