<?php

namespace App\Http\Controllers\MedicalRecords;

use App\Actions\MedicalRecord\DeleteMedicalRecordAction;
use App\Actions\MedicalRecord\UpdateMedicalRecordAction;
use App\Actions\MedicalRecords\CreateMedicalRecordAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\MedicalRecord\StoreMedicalRecordRequest;
use App\Http\Requests\UpdateMedicalRecordRequest;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\MedicalRecord;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MedicalRecordController extends Controller
{
    /**
     * Display medical records.
     */
    public function index(Request $request): Response
    {
        $clinicId = auth()->user()->id;

        $medicalRecords = MedicalRecord::query()
            ->with([
                'patient',
                'doctor',
                'reservation',
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
                                'record_title',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'notes',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'appointment_code',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhereHas(
                                'patient',
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
                            )
                            ->orWhereHas(
                                'doctor',
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
            ->latest('record_date')
            ->paginate(
                $request->integer('limit', 10)
            )
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Patients
        |--------------------------------------------------------------------------
        */

        $patients = Patient::query()
            ->whereHas('reservations', function ($query) use ($clinicId) {
                $query->where('clinic_id', $clinicId);
            })
            ->select([
                'id',
                'first_name',
                'middle_name',
                'last_name',
            ])
            ->orderBy('first_name')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Doctors
        |--------------------------------------------------------------------------
        */

        $doctors = Doctor::query()
            ->whereHas('reservations', function ($query) use ($clinicId) {
                $query->where('clinic_id', $clinicId);
            })
            ->select([
                'id',
                'first_name',
                'middle_name',
                'last_name',
            ])
            ->orderBy('first_name')
            ->get();

        return Inertia::render(
            'medical-records/index',
            [
                'medicalRecords' => $medicalRecords,
                'patients' => $patients,
                'doctors' => $doctors,
                'filters' => $request->only([
                    'search',
                ]),
            ]
        );
    }

    /**
     * Create a medical record from a consultation.
     */
    public function store(
        StoreMedicalRecordRequest $request,
        Consultation $consultation,
        CreateMedicalRecordAction $action
    ) {
        $consultation->load([
            'reservation',
        ]);

        abort_unless(
            $consultation->reservation,
            404,
            'Reservation not found.'
        );

        $clinicId = auth()->user()->id;

        abort_unless(
            (int) $consultation->reservation->clinic_id === (int) $clinicId,
            404
        );

        /*
        |--------------------------------------------------------------------------
        | Prevent duplicate medical record
        |--------------------------------------------------------------------------
        */

        if (
            $consultation
                ->reservation
                ->medicalRecords()
                ->exists()
        ) {
            return back()->withErrors([
                'medical_record' => 'Medical record already exists for this consultation.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Create Medical Record
        |--------------------------------------------------------------------------
        */

        $action->execute(
            $consultation,
            $request->validated()
        );

        return back()->with(
            'success',
            'Medical record created successfully.'
        );
    }

    /**
     * Display a medical record.
     */
    public function show(
        MedicalRecord $medicalRecord
    ): Response {
        $this->authorizeMedicalRecord(
            $medicalRecord
        );

        $medicalRecord->load([
            'patient',
            'doctor',
            'reservation',
        ]);

        return Inertia::render(
            'medical-records/detail',
            [
                'medicalRecord' => $medicalRecord,
            ]
        );
    }

    /**
     * Update medical record.
     */
    public function update(
        UpdateMedicalRecordRequest $request,
        MedicalRecord $medicalRecord,
        UpdateMedicalRecordAction $action
    ) {
        $this->authorizeMedicalRecord(
            $medicalRecord
        );

        $action->execute(
            $medicalRecord,
            $request->validated()
        );

        return back()->with(
            'success',
            'Medical record updated successfully.'
        );
    }

    /**
     * Delete medical record.
     */
    public function destroy(
        MedicalRecord $medicalRecord,
        DeleteMedicalRecordAction $action
    ) {
        $this->authorizeMedicalRecord(
            $medicalRecord
        );

        $action->execute(
            $medicalRecord
        );

        return back()->with(
            'success',
            'Medical record deleted successfully.'
        );
    }

    /**
     * Authorize consultation for current clinic.
     */
    private function authorizeConsultation(
        Consultation $consultation
    ): void {
        $consultation->loadMissing([
            'reservation',
        ]);

        abort_unless(
            $consultation->reservation
            && (int) $consultation->reservation->clinic_id
                === (int) auth()->user()->id,
            404
        );
    }

    /**
     * Authorize medical record for current clinic.
     */
    private function authorizeMedicalRecord(
        MedicalRecord $medicalRecord
    ): void {
        $medicalRecord->loadMissing([
            'reservation',
        ]);

        abort_unless(
            $medicalRecord->reservation
            && (int) $medicalRecord->reservation->clinic_id
                === (int) auth()->user()->id,
            404
        );
    }
}
