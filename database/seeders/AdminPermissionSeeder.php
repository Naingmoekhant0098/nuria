<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AdminPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (array_keys(User::adminPermissionLabels()) as $name) {
            Permission::query()->firstOrCreate([
                'name' => $name,
                'guard_name' => 'admin',
            ]);
        }

        foreach (User::adminRoles() as $name => $definition) {
            $role = Role::query()->firstOrCreate([
                'name' => $name,
                'guard_name' => 'admin',
            ]);

            if ($role->wasRecentlyCreated) {
                $role->syncPermissions($definition['permissions']);
            }

            foreach ($definition['permissions'] as $permissionName) {
                $permission = Permission::query()->where('name', $permissionName)->where('guard_name', 'admin')->first();
                if ($permission !== null && ! $role->hasPermissionTo($permission)) {
                    $role->givePermissionTo($permission);
                }
            }
        }

        User::query()
            ->where('is_admin', true)
            ->doesntHave('roles')
            ->each(function (User $user): void {
                if (isset(User::adminRoles()[$user->admin_role ?? ''])) {
                    $user->syncRoles([$user->admin_role]);
                }
            });

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
