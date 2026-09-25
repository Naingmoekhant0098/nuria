<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class AdminPermissionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/permissions/index', [
            'permissions' => Permission::query()
                ->where('guard_name', 'admin')
                ->withCount('roles')
                ->orderBy('name')
                ->get(['id', 'name', 'guard_name']),
            'permissionLabels' => User::adminPermissionLabels(),
        ]);
    }
}
