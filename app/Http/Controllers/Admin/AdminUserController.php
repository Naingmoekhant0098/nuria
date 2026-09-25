<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->where('is_admin', true)
                ->when($request->input('search'), function ($query, string $search): void {
                    $query->where(function ($query) use ($search): void {
                        $query->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->with(['roles', 'permissions'])
                ->latest()
                ->paginate(15)
                ->withQueryString()
                ->through(fn (User $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'admin_role' => $user->roles->first()?->name ?? $user->admin_role,
                    'permissions' => $user->permissions->pluck('name')->values()->all(),
                ]),
            'roles' => Role::query()
                ->where('guard_name', 'admin')
                ->with('permissions:id,name,guard_name')
                ->orderBy('name')
                ->get()
                ->mapWithKeys(fn (Role $role): array => [
                    $role->name => [
                        'label' => Str::headline($role->name),
                        'permissions' => $role->permissions->pluck('name')->values()->all(),
                    ],
                ]),
            'permissions' => Permission::query()
                ->where('guard_name', 'admin')
                ->orderBy('name')
                ->get(['id', 'name']),
            'permissionLabels' => User::adminPermissionLabels(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'admin_role' => [
                'required',
                'string',
                Rule::exists('roles', 'name')->where(fn ($query) => $query->where('guard_name', 'admin')),
            ],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => [
                'string',
                Rule::exists('permissions', 'name')->where(fn ($query) => $query->where('guard_name', 'admin')),
            ],
        ]);

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_admin' => true,
            'admin_role' => $validated['admin_role'],
        ]);
        $user->assignRole($validated['admin_role']);
        $user->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('admin.users.index')->with('success', 'Admin account created.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        abort_unless($user->is_admin, 404);

        $validated = $request->validate([
            'admin_role' => [
                'sometimes',
                'required',
                'string',
                Rule::exists('roles', 'name')->where(fn ($query) => $query->where('guard_name', 'admin')),
            ],
        ]);

        if (
            ($user->admin_role === 'super_admin' || $user->hasRole('super_admin', 'admin'))
            && isset($validated['admin_role'])
            && $validated['admin_role'] !== 'super_admin'
            && User::query()->where('is_admin', true)->where('admin_role', 'super_admin')->count() <= 1
        ) {
            throw ValidationException::withMessages([
                'admin_role' => 'At least one super admin must remain.',
            ]);
        }

        $user->update($validated);

        if (isset($validated['admin_role'])) {
            $user->syncRoles([$validated['admin_role']]);
        }

        return redirect()->route('admin.users.index')->with('success', 'Admin role updated.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_unless($user->is_admin, 404);

        if ($request->user('admin')?->is($user)) {
            throw ValidationException::withMessages([
                'admin' => 'You cannot remove your own admin access.',
            ]);
        }

        if (
            ($user->admin_role === 'super_admin' || $user->hasRole('super_admin', 'admin'))
            && User::query()->where('is_admin', true)->where('admin_role', 'super_admin')->count() <= 1
        ) {
            throw ValidationException::withMessages([
                'admin' => 'At least one super admin must remain.',
            ]);
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Admin account removed.');
    }
}
