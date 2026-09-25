<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PatientAuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:patients,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'contact_number' => ['required', 'string', 'max:50'],
            'complete_address' => ['required', 'string', 'max:2000'],
            'birthdate' => ['nullable', 'date', 'before:today'],
        ]);

        do {
            $patientId = 'P'.Str::upper(Str::random(10));
        } while (Patient::query()->whereKey($patientId)->exists());

        $patient = Patient::query()->create([
            ...$data,
            'id' => $patientId,
            'user_name' => $data['email'],
            'status' => 'Active',
        ]);

        return response()->json([
            'patient' => $patient,
            'token' => $patient->createToken('public-api')->plainTextToken,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $patient = Patient::query()->where('email', $credentials['email'])->first();

        if (! $patient || ! Hash::check($credentials['password'], $patient->password)) {
            throw ValidationException::withMessages([
                'email' => ['The supplied credentials are incorrect.'],
            ]);
        }

        return response()->json([
            'patient' => $patient,
            'token' => $patient->createToken('public-api')->plainTextToken,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
