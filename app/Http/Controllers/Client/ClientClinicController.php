<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicService;
use App\Models\Doctor;
use App\Models\DoctorClinicSchedule;
use Inertia\Inertia;
use Inertia\Response;

class ClientClinicController extends Controller
{
    /**
     * Patient landing page.
     */
    public function home(): Response
    {
        $clinics = Clinic::query()
            // ->where('status', 'active')
            ->withCount('doctors')
            ->latest()
            ->take(6)
            ->get();

        $doctors = Doctor::query()
            ->where('status', 'active')
            ->with(['specialization', 'clinics'])
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();

        $services = ClinicService::query()
            ->whereHas('doctor', fn($query) => $query->where('status', 'active'))
            ->whereHas('clinic', fn($query) => $query->where('status', 'active'))
            ->with(['clinic:id,clinic_name', 'doctor:id,first_name,last_name'])
            ->orderBy('service_name')
            ->get()
            ->unique(fn(ClinicService $service): string => mb_strtolower(trim($service->service_name)))
            ->values();

        // Log the retrieved data
        logger()->info('Home data retrieved', [
            'clinics' => $clinics,
            'doctors' => $doctors,
            'services' => $services,
        ]);

        return Inertia::render('Client/Home', [
            'clinics' => $clinics,
            'doctors' => $doctors,
            'services' => $services,
        ]);
    }






    /**
     * All clinics.
     */
    public function index(): Response
    {
        $clinics = Clinic::query()
            ->where('status', 'active')
            ->withCount('doctors')
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Client/Clinics/Index', [
            'clinics' => $clinics,
        ]);
    }

    /**
     * Clinic detail.
     */
    public function show(Clinic $clinic): Response
    {
        // abort_unless(
        //     $clinic->status === 'active',
        //     404
        // );

        // $clinic->loadCount('doctors');

        return Inertia::render('Client/Clinics/Show', [
            // 'clinic' => $clinic,
        ]);
    }

    /**
     * Doctors belonging to clinic.
     */
    public function doctors(Clinic $clinic): Response
    {
        abort_unless(
            $clinic->status === 'active',
            404
        );

        $doctors = Doctor::query()
            ->where('status', 'active')
            ->whereHas('clinics', fn($query) => $query->whereKey($clinic->id))
            ->with('user')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Client/Clinics/Doctors', [
            'clinic' => $clinic,
            'doctors' => $doctors,
        ]);
    }

    /**
     * Doctor detail.
     */
    public function doctor(
        Clinic $clinic,
        Doctor $doctor
    ): Response {
        abort_unless(
            $clinic->status === 'active',
            404
        );

        abort_unless($doctor->clinics()->whereKey($clinic->id)->exists(), 404);

        $doctor->load([
            'user',
            'specialization',
        ]);

        return Inertia::render('Client/Doctors/Show', [
            'clinic' => $clinic,
            'doctor' => $doctor,
        ]);
    }

    /**
     * Doctor services.
     */
    public function services(
        Clinic $clinic,
        Doctor $doctor
    ): Response {
        abort_unless($clinic->status === 'active', 404);
        abort_unless($doctor->clinics()->whereKey($clinic->id)->exists(), 404);

        abort_unless($doctor->status === 'active', 404);

        $services = ClinicService::query()
            ->where('clinic_id', $clinic->id)
            ->where('doctor_id', $doctor->id)
            ->get();

        return Inertia::render('Client/Doctors/Services', [
            'clinic' => $clinic,
            'doctor' => $doctor,
            'services' => $services,
        ]);
    }

    /**
     * Doctor availability.
     */
    public function availability(
        Clinic $clinic,
        Doctor $doctor
    ): Response {
        abort_unless($clinic->status === 'active', 404);
        abort_unless($doctor->clinics()->whereKey($clinic->id)->exists(), 404);

        abort_unless($doctor->status === 'active', 404);

        $availability = DoctorClinicSchedule::query()
            ->where('clinic_id', $clinic->id)
            ->where('doctor_id', $doctor->id)
            ->get();

        return Inertia::render('Client/Doctors/Availability', [
            'clinic' => $clinic,
            'doctor' => $doctor,
            'availability' => $availability,
        ]);
    }

    /**
     * Select clinic for patient.
     */
    public function select(Clinic $clinic)
    {
        abort_unless(
            $clinic->status === 'active',
            404
        );

        $patient = auth('patient')->user();

        $patient->update([
            'clinic_id' => $clinic->id,
        ]);

        return back()->with(
            'success',
            'Clinic selected successfully.'
        );
    }
}
