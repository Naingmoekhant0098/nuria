<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'reservation_id' => ['nullable', 'integer', 'exists:reservations,id'],
            'clinic_id' => ['required_without:reservation_id', 'integer', 'exists:clinics,id'],
            'doctor_id' => ['required_without:reservation_id', 'string', 'exists:doctors,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $patientId = auth('patient')->id();
        $reservation = null;

        if (! empty($data['reservation_id'])) {
            $reservation = Reservation::query()
                ->whereKey($data['reservation_id'])
                ->where('patient_id', $patientId)
                ->firstOrFail();

            abort_unless(strtolower($reservation->status) === 'completed', 422);
            $data['clinic_id'] = $reservation->clinic_id;
            $data['doctor_id'] = $reservation->doctor_id;
        }

        if (! Reservation::query()
            ->where('doctor_id', $data['doctor_id'])
            ->where('clinic_id', $data['clinic_id'])
            ->where('patient_id', $patientId)
            ->exists()) {
            throw ValidationException::withMessages([
                'comment' => 'You can review this doctor after booking an appointment with them.',
            ]);
        }

        Review::create([
            'clinic_id' => $data['clinic_id'],
            'doctor_id' => $data['doctor_id'],
            'patient_id' => $patientId,
            'reservation_id' => $reservation?->id,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);

        return back()->with('success', 'Thank you for reviewing your visit.');
    }
}
