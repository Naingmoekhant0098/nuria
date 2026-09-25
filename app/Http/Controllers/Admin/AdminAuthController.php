<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AdminAuthController extends Controller
{
    /**
     * Show admin login page.
     */
    public function create(): Response
    {
        return Inertia::render('admin/auth/login', [
            'canRegisterAdmin' => ! User::query()->where('is_admin', true)->exists(),
        ]);
    }

    public function createInitialAdmin(): Response
    {
        abort_if(User::query()->where('is_admin', true)->exists(), 404);

        return Inertia::render('admin/auth/register');
    }

    public function storeInitialAdmin(Request $request): RedirectResponse
    {
        abort_if(User::query()->where('is_admin', true)->exists(), 404);

        $credentials = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $admin = User::create([
            ...$credentials,
            'is_admin' => true,
            'admin_role' => 'super_admin',
        ]);

        if (Role::query()->where('name', 'super_admin')->where('guard_name', 'admin')->exists()) {
            $admin->assignRole('super_admin');
        }

        Auth::guard('admin')->login($admin);
        $request->session()->regenerate();

        return redirect()->route('admin.dashboard');
    }

    /**
     * Authenticate admin.
     */
    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $credentials['is_admin'] = true;

        if (! Auth::guard('admin')->attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'The provided credentials are incorrect.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();

        return redirect()->intended(
            route('admin.dashboard')
        );
    }

    /**
     * Logout admin.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
