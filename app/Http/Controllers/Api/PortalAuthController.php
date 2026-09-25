<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PortalAuthController extends Controller
{
    public function adminLogin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $admin = User::query()->where('email', $data['email'])->where('is_admin', true)->first();

        if (! $admin || ! Hash::check($data['password'], $admin->password)) {
            throw ValidationException::withMessages([
                'email' => ['The supplied credentials are incorrect.'],
            ]);
        }

        return response()->json([
            'token' => $admin->createToken('postman-admin')->plainTextToken,
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'roles' => $admin->getRoleNames(),
                'permissions' => $admin->adminPermissions(),
            ],
        ]);
    }

    public function clinicLogin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_name' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $clinic = Clinic::query()->where('user_name', $data['user_name'])->first();

        if (! $clinic || ! Hash::check($data['password'], $clinic->password)) {
            throw ValidationException::withMessages([
                'user_name' => ['The supplied credentials are incorrect.'],
            ]);
        }

        if ($clinic->status !== 'Approved') {
            throw ValidationException::withMessages([
                'user_name' => ['This clinic account is not approved.'],
            ]);
        }

        return response()->json([
            'token' => $clinic->createToken('postman-clinic')->plainTextToken,
            'clinic' => $clinic->only(['id', 'clinic_name', 'user_name', 'status']),
        ]);
    }

    public function adminMe(Request $request): JsonResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        return response()->json([
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'roles' => $admin->getRoleNames(),
                'permissions' => $admin->adminPermissions(),
            ],
        ]);
    }

    public function clinicMe(Request $request): JsonResponse
    {
        /** @var Clinic $clinic */
        $clinic = $request->user();

        return response()->json([
            'clinic' => $clinic->only(['id', 'clinic_name', 'user_name', 'status', 'complete_address']),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();

        if ($token !== null) {
            $token->delete();
        }

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
