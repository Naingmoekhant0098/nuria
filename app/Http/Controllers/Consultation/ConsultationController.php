<?php

namespace App\Http\Controllers\Consultation;

use App\Actions\Consultations\CreateConsultationAction;
use App\Actions\Consultations\DeleteConsultationAction;
use App\Actions\Consultations\UpdateConsultationAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Consultation\StoreConsultationRequest;
use App\Http\Requests\Consultation\UpdateConsultationRequest;
use App\Models\Consultation;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConsultationController extends Controller
{
    public function index(Request $request): Response
    {
        $clinicId = auth()->user()->id;

        $consultations = Consultation::query()
            ->with([
                'reservation.patient',
                'reservation.doctor',
                'reservation.clinic',
                'reservation.service',
                'reservation.schedule',
            ])
            ->whereHas('reservation', function ($query) use ($clinicId) {
                $query->where('clinic_id', $clinicId);
            })
            ->when(
                $request->filled('search'),
                function ($query) use ($request) {
                    $search = $request->search;

                    $query->where(function ($query) use ($search) {
                        $query
                            ->where(
                                'appointment_code',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'diagnosis',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'treatment',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhereHas(
                                'reservation.patient',
                                function ($query) use ($search) {
                                    $query
                                        ->where(
                                            'first_name',
                                            'like',
                                            "%{$search}%"
                                        )
                                        ->orWhere(
                                            'middle_name',
                                            'like',
                                            "%{$search}%"
                                        )
                                        ->orWhere(
                                            'last_name',
                                            'like',
                                            "%{$search}%"
                                        );
                                }
                            );
                    });
                }
            )
            ->latest('date_of_consultation')
            ->paginate(
                $request->integer('limit', 10)
            )
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Only Checked In reservations can create consultation
        |--------------------------------------------------------------------------
        */

        $reservations = Reservation::query()
            ->with([
                'patient:id,first_name,middle_name,last_name',
                'doctor:id,first_name,middle_name,last_name',
                'service:id,service_name,amount',
            ])
            ->where('clinic_id', $clinicId)
            ->where('status', 'Checked In')
            ->whereDoesntHave('consultation')
            ->orderByDesc('id')
            ->get([
                'id',
                'appointment_code',
                'patient_id',
                'doctor_id',
                'clinic_id',
                'service_id',
                'appointment_type',
                'status',
            ]);

        return Inertia::render(
            'consultations/index',
            [
                'consultations' => $consultations,
                'reservations' => $reservations,
                'filters' => $request->only([
                    'search',
                ]),
            ]
        );
    }

    public function store(
        StoreConsultationRequest $request,
        CreateConsultationAction $action
    ) {
        $action->execute(
            $request->validated()
        );

        return redirect()
            ->route('consultations.index')
            ->with(
                'success',
                'Consultation created successfully.'
            );
    }

    public function show(
        Consultation $consultation
    ): Response {
        $this->authorizeConsultation(
            $consultation
        );

        $consultation->load([
            'reservation.patient',
            'reservation.doctor',
            'reservation.clinic',
            'reservation.service',
            'reservation.schedule',
        ]);

        return Inertia::render(
            'consultations/detail',
            [
                'consultation' => $consultation,
            ]
        );
    }

    public function update(
        UpdateConsultationRequest $request,
        Consultation $consultation,
        UpdateConsultationAction $action
    ) {
        $this->authorizeConsultation(
            $consultation
        );

        $action->execute(
            $consultation,
            $request->validated()
        );

        return redirect()
            ->route('consultations.index')
            ->with(
                'success',
                'Consultation updated successfully.'
            );
    }

    public function destroy(
        Consultation $consultation,
        DeleteConsultationAction $action
    ) {
        $this->authorizeConsultation(
            $consultation
        );

        $action->execute(
            $consultation
        );

        return redirect()
            ->route('consultations.index')
            ->with(
                'success',
                'Consultation deleted successfully.'
            );
    }

    private function authorizeConsultation(
        Consultation $consultation
    ): void {
        $consultation->loadMissing(
            'reservation'
        );

        abort_unless(
            $consultation->reservation
                && $consultation->reservation->clinic_id
                    === auth()->user()->id,
            404
        );
    }
}
