<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminResourceController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $users = User::query()
            ->where('is_admin', true)
            ->when($validated['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->with(['roles', 'permissions'])
            ->orderBy('name')
            ->paginate($validated['per_page'] ?? 20)
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->values(),
                'direct_permissions' => $user->permissions->pluck('name')->values(),
                'permissions' => $user->adminPermissions(),
            ]);

        return response()->json($users);
    }

    public function storeUser(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', Rule::exists('roles', 'name')->where(fn ($query) => $query->where('guard_name', 'admin'))],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')->where(fn ($query) => $query->where('guard_name', 'admin'))],
        ]);

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'is_admin' => true,
            'admin_role' => $data['role'],
        ]);
        $user->assignRole($data['role']);
        $user->syncPermissions($data['permissions'] ?? []);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'direct_permissions' => $user->permissions->pluck('name'),
            ],
        ], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        abort_unless($user->is_admin, 404);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['sometimes', 'required', 'string', 'min:8'],
            'role' => ['sometimes', 'required', 'string', Rule::exists('roles', 'name')->where(fn ($query) => $query->where('guard_name', 'admin'))],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')->where(fn ($query) => $query->where('guard_name', 'admin'))],
        ]);

        $attributes = array_intersect_key($data, array_flip(['name', 'email']));

        if (isset($data['password'])) {
            $attributes['password'] = Hash::make($data['password']);
        }

        if (isset($data['role'])) {
            $attributes['admin_role'] = $data['role'];
        }

        $user->update($attributes);

        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        if (array_key_exists('permissions', $data)) {
            $user->syncPermissions($data['permissions']);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'direct_permissions' => $user->permissions->pluck('name')->values(),
            ],
        ]);
    }

    public function destroyUser(Request $request, User $user): JsonResponse
    {
        abort_unless($user->is_admin, 404);

        if ($request->user()->is($user)) {
            return response()->json(['message' => 'You cannot remove your own admin access.'], 422);
        }

        if ($user->hasRole('super_admin', 'admin') && User::role('super_admin', 'admin')->count() <= 1) {
            return response()->json(['message' => 'At least one super admin must remain.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Admin user deleted.']);
    }

    public function roles(): JsonResponse
    {
        return response()->json([
            'data' => Role::query()
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
                ]),
        ]);
    }

    public function storeRole(Request $request): JsonResponse
    {
        $data = $this->validateRole($request);
        $role = Role::query()->create(['name' => $data['name'], 'guard_name' => 'admin']);
        $role->syncPermissions($data['permissions'] ?? []);

        return response()->json(['role' => $role->load('permissions:id,name')], 201);
    }

    public function updateRole(Request $request, Role $role): JsonResponse
    {
        abort_unless($role->guard_name === 'admin', 404);
        $data = $this->validateRole($request, $role);
        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return response()->json(['role' => $role->fresh()->load('permissions:id,name')]);
    }

    public function destroyRole(Role $role): JsonResponse
    {
        abort_unless($role->guard_name === 'admin', 404);

        if ($role->users()->exists()) {
            return response()->json([
                'message' => 'Remove this role from assigned users before deleting it.',
            ], 422);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted.']);
    }

    public function permissions(): JsonResponse
    {
        return response()->json([
            'data' => Permission::query()
                ->where('guard_name', 'admin')
                ->withCount('roles')
                ->orderBy('name')
                ->get(['id', 'name', 'guard_name']),
        ]);
    }

    /** @return array{name: string, permissions?: list<string>} */
    private function validateRole(Request $request, ?Role $role = null): array
    {
        $uniqueRoleName = Rule::unique('roles', 'name')
            ->where(fn ($query) => $query->where('guard_name', 'admin'));

        if ($role !== null) {
            $uniqueRoleName->ignore($role->id);
        }

        return $request->validate([
            'name' => ['required', 'string', 'max:100', 'alpha_dash:ascii', $uniqueRoleName],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => [
                'string',
                Rule::exists('permissions', 'name')->where(fn ($query) => $query->where('guard_name', 'admin')),
            ],
        ]);
    }
}
