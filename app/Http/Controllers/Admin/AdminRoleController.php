<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminRoleController extends Controller
{
    public function index(): Response
    {
        $roles = Role::query()
            ->where('guard_name', 'admin')
            ->with('permissions:id,name')
            ->withCount('users')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => Str::headline($role->name),
                'permissions' => $role->permissions->pluck('name')->values(),
                'users_count' => $role->users_count,
            ]);

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'permissions' => Permission::query()
                ->where('guard_name', 'admin')
                ->orderBy('name')
                ->get(['id', 'name']),
            'permissionLabels' => User::adminPermissionLabels(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedRoleData($request);
        $role = Role::query()->create([
            'name' => $data['name'],
            'guard_name' => 'admin',
        ]);
        $role->syncPermissions($data['permissions'] ?? []);

        return to_route('admin.roles.index')->with('success', 'Role created.');
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        abort_unless($role->guard_name === 'admin', 404);

        $data = $this->validatedRoleData($request, $role);
        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return to_route('admin.roles.index')->with('success', 'Role and permissions updated.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        abort_unless($role->guard_name === 'admin', 404);

        if ($role->users()->exists()) {
            return to_route('admin.roles.index')->withErrors([
                'role' => 'Remove this role from assigned users before deleting it.',
            ]);
        }

        $role->delete();

        return to_route('admin.roles.index')->with('success', 'Role deleted.');
    }

    /** @return array{name: string, permissions?: list<string>} */
    private function validatedRoleData(Request $request, ?Role $role = null): array
    {
        $uniqueRoleName = Rule::unique('roles', 'name')
            ->where(fn ($query) => $query->where('guard_name', 'admin'));

        if ($role !== null) {
            $uniqueRoleName->ignore($role->id);
        }

        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                'alpha_dash:ascii',
                $uniqueRoleName,
            ],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => [
                'string',
                Rule::exists('permissions', 'name')
                    ->where(fn ($query) => $query->where('guard_name', 'admin')),
            ],
        ]);
    }
}
