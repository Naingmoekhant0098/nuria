<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicService;
use App\Models\Doctor;
use App\Models\DoctorClinicSchedule;
use App\Models\MedicalProduct;
use App\Models\Reservation;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ClientClinicController extends Controller
{
    /**
     * Home page. The array shapes below are the contract with
     * resources/js/pages/Client/Home.tsx (HomeProps).
     */
    public function home(): Response
    {
        /* ---------- Clinics ---------- */
        $clinicModels = Clinic::query()
            ->whereRaw('LOWER(status) IN (?, ?)', ['active', 'approved'])
            ->latest()
            ->take(3)
            ->get();
        $clinicReviewStats = Review::query()
            ->whereIn('clinic_id', $clinicModels->pluck('id'))
            ->selectRaw('clinic_id, AVG(rating) as average_rating, COUNT(*) as review_count')
            ->groupBy('clinic_id')
            ->get()
            ->keyBy('clinic_id');

        // One query for service names per clinic, used as "tags"
        $tagsByClinic = ClinicService::query()
            ->whereIn('clinic_id', $clinicModels->pluck('id'))
            ->get(['clinic_id', 'service_name'])
            ->groupBy('clinic_id')
            ->map(fn (Collection $rows) => $rows->pluck('service_name')->unique()->take(3)->implode(', '));

        $clinics = $clinicModels->map(fn (Clinic $c) => [
            'id' => $c->id,
            'name' => $c->clinic_name,
            'area' => $c->city ?? $c->address ?? '',          // ASSUMPTION: city/address column
            'tags' => $tagsByClinic[$c->id] ?? '',
            'rating' => round((float) ($clinicReviewStats->get($c->id)?->average_rating ?? 0), 1),
            'reviews' => (int) ($clinicReviewStats->get($c->id)?->review_count ?? 0),
            'status' => null,                                   // no opening-hours logic yet
            'image' => $this->imageUrl($c->photo_url ?? null), // ASSUMPTION: photo_url column
        ])->values();

        /* ---------- Doctors ---------- */
        $doctorModels = Doctor::query()
            ->whereRaw('LOWER(status) = ?', ['active'])
            ->with(['specialization', 'clinics:id,clinic_name'])
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->take(6)
            ->get();

        $schedules = DoctorClinicSchedule::query()
            ->whereIn('doctor_id', $doctorModels->pluck('id'))
            ->get()
            ->groupBy('doctor_id');
        $homeDoctorReviewStats = Review::query()
            ->whereIn('doctor_id', $doctorModels->pluck('id'))
            ->selectRaw('doctor_id, AVG(rating) as average_rating, COUNT(*) as review_count')
            ->groupBy('doctor_id')
            ->get()
            ->keyBy('doctor_id');

        $doctors = $doctorModels->map(function (Doctor $d) use ($schedules, $homeDoctorReviewStats) {
            $clinic = $d->clinics->first();

            return [
                'id' => $d->id,
                'name' => 'Dr. '.trim($d->first_name.' '.$d->last_name),
                'spec' => $d->specialization?->name ?? 'General',
                'experience_years' => $d->experience_years,
                'clinic' => $clinic?->clinic_name ?? '',
                'clinic_id' => $clinic?->id,
                'next' => $this->nextSlot($schedules[$d->id] ?? collect()),
                'rating' => round((float) ($homeDoctorReviewStats->get($d->id)?->average_rating ?? 0), 1),
                'reviews' => (int) ($homeDoctorReviewStats->get($d->id)?->review_count ?? 0),
                'image' => $this->imageUrl($d->photo_url ?? null),
            ];
        })->values();

        /* ---------- Services (unique by name, first is the big card) ---------- */
        $services = ClinicService::query()
            ->whereHas('doctor', fn ($q) => $q->whereRaw('LOWER(status) = ?', ['active']))
            ->whereHas('clinic', fn ($q) => $q->whereRaw('LOWER(status) IN (?, ?)', ['active', 'approved']))
            ->with('serviceName:id,name,image_path')
            ->orderBy('service_name')
            ->get()
            ->unique(fn (ClinicService $s) => mb_strtolower(trim($s->serviceName?->name ?? $s->service_name)))
            ->take(6)
            ->values()
            ->map(fn (ClinicService $s, int $i) => [
                'id' => $s->id,
                'name' => $s->serviceName?->name ?? $s->service_name,
                'note' => $s->service_description ?? '',
                'image' => $s->serviceName?->image_url ?? $s->image_url,
                'big' => $i === 0,
            ]);

        /* ---------- Products: cheapest in-stock clinic price ---------- */
        $inStock = fn ($q) => $q->where('is_active', true)->where('quantity', '>', 0);

        $products = MedicalProduct::query()
            ->where('is_active', true)
            ->whereHas('clinicProducts', $inStock)
            ->with('category:id,name')
            ->withMin(['clinicProducts as price' => $inStock], 'sale_price')
            ->orderBy('name')
            ->take(4)
            ->get()
            ->map(fn (MedicalProduct $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'cat' => $p->category?->name ?? '',
                'price' => (float) $p->price,
                'rating' => null,
                'image' => $p->image_url,
            ])
            ->values();

        return Inertia::render('Client/Home', [
            'clinics' => $clinics,
            'doctors' => $doctors,
            'services' => $services,
            'products' => $products,
            'specialties' => $doctors->pluck('spec')->unique()->values(),
        ]);
    }

    /**
     * All clinics.
     */
    public function index(Request $request): Response
    {
        $clinics = Clinic::query()
            ->whereRaw('LOWER(status) IN (?, ?)', ['active', 'approved'])
            ->when($request->input('q'), function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('clinic_name', 'like', "%{$search}%")
                        ->orWhere('complete_address', 'like', "%{$search}%");
                });
            })
            ->when($request->input('specialty'), function ($query, string $specialty): void {
                $query->whereHas('doctors.specialization', fn ($query) => $query->where('name', $specialty));
            })
            ->withCount('doctors')
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Client/Clinics/List', [
            'clinics' => $clinics,
            'filters' => $request->only(['q', 'specialty']),
        ]);
    }

    /**
     * Display the public doctor directory using the existing filter UI.
     */
    public function doctorsIndex(Request $request): Response
    {
        $selectedClinic = $request->integer('clinic_id')
            ? Clinic::query()->find($request->integer('clinic_id'))
            : null;

        $doctors = Doctor::query()
            ->whereRaw('LOWER(status) IN (?, ?)', ['active', 'approved'])
            ->when($request->input('q'), function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhereHas('specialization', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->input('specialty'), fn ($query, string $specialty) => $query->whereHas('specialization', fn ($query) => $query->where('name', $specialty)))
            ->when($request->input('service'), fn ($query, string $service) => $query->whereHas('services', fn ($query) => $query->where('service_name', $service)))
            ->when($request->integer('clinic_id'), fn ($query, int $clinicId) => $query->whereHas('clinics', fn ($query) => $query->whereKey($clinicId)))
            ->with(['specialization', 'clinics:id,clinic_name,complete_address,latitude,longitude,photo_path', 'nrc'])
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();

        $doctorIds = $doctors->pluck('id');
        $servicesByDoctor = ClinicService::query()
            ->whereIn('doctor_id', $doctorIds)
            ->get(['doctor_id', 'service_name', 'amount'])
            ->groupBy('doctor_id');
        $schedules = DoctorClinicSchedule::query()
            ->whereIn('doctor_id', $doctorIds)
            ->get()
            ->groupBy('doctor_id');
        $reviewStats = Review::query()
            ->whereIn('doctor_id', $doctorIds)
            ->selectRaw('doctor_id, AVG(rating) as average_rating, COUNT(*) as review_count')
            ->groupBy('doctor_id')
            ->get()
            ->keyBy('doctor_id');

        return Inertia::render('Client/Clinics/Index', [
            'doctors' => $doctors->map(function (Doctor $doctor) use ($selectedClinic, $servicesByDoctor, $schedules, $reviewStats): array {
                $clinic = $selectedClinic && $doctor->clinics->contains('id', $selectedClinic->id)
                    ? $selectedClinic
                    : $doctor->clinics->first();
                $services = $servicesByDoctor->get($doctor->id, collect());
                \Log::info('Clinic: '.$clinic);

                return [
                    'id' => $doctor->id,
                    'clinicSlug' => (string) ($clinic?->id ?? ''),
                    'name' => 'Dr. '.trim(implode(' ', array_filter([$doctor->first_name, $doctor->middle_name, $doctor->last_name]))),
                    'spec' => $doctor->specialization?->name ?? 'General practice',
                    'experience_years' => $doctor->experience_years,
                    'clinic' => $clinic?->clinic_name ?? 'Independent practice',
                    'clinics' => $doctor->clinics->map(fn (Clinic $doctorClinic): array => [
                        'id' => $doctorClinic->id,
                        'name' => $doctorClinic->clinic_name,
                    ])->values(),
                    'lat' => $clinic?->latitude !== null ? (float) $clinic->latitude : null,
                    'lng' => $clinic?->longitude !== null ? (float) $clinic->longitude : null,
                    'region' => $doctor->region ?? $clinic?->complete_address ?? $doctor->complete_address,
                    'products' => [],
                    'price' => (float) ($services->min('amount') ?? 0),
                    'rating' => round((float) ($reviewStats->get($doctor->id)?->average_rating ?? 0), 1),
                    'reviews' => (int) ($reviewStats->get($doctor->id)?->review_count ?? 0),
                    'next' => $this->nextSlot($schedules->get($doctor->id, collect())),
                    'days' => 0,
                    'gender' => $doctor->gender ?? 'Not specified',
                    'age' => $doctor->birthdate?->age,
                    'langs' => [],
                    'services' => $services->pluck('service_name')->unique()->values()->all(),
                    'video' => false,
                    'img' => $doctor->photo_url,
                    'clinicImg' => $clinic?->photo_path
                        ? (str_starts_with($clinic->photo_path, 'http') || str_starts_with($clinic->photo_path, '/')
                            ? $clinic->photo_path
                            : asset('storage/'.$clinic->photo_path))
                        : null,
                ];
            })->values(),
            'filters' => [
                'q' => $request->input('q'),
                'specialty' => $request->input('specialty'),
                'service' => $request->input('service'),
                'clinic' => $selectedClinic?->clinic_name,
            ],
        ]);
    }

    /**
     * Clinic detail.
     */
    public function show(Request $request, Clinic $clinic): Response
    {
        abort_unless(in_array(strtolower($clinic->status), ['active', 'approved'], true), 404);

        $clinic->loadCount('doctors');
        $services = ClinicService::query()
            ->where('clinic_id', $clinic->id)
            ->with('doctor:id,first_name,middle_name,last_name,specialization_id,photo_path,status')
            ->orderBy('service_name')
            ->get();
        $selectedServiceId = $request->integer('service_id') ?: null;
        $doctors = Doctor::query()
            ->whereRaw('LOWER(status) = ?', ['active'])
            ->whereHas('clinics', fn ($query) => $query->whereKey($clinic->id))
            ->when($selectedServiceId, fn ($query) => $query->whereHas('services', fn ($query) => $query
                ->whereKey($selectedServiceId)
                ->where('clinic_id', $clinic->id)))
            ->with('specialization')
            ->orderBy('first_name')
            ->get();
        $reviewStats = Review::query()
            ->where('clinic_id', $clinic->id)
            ->selectRaw('AVG(rating) as average_rating, COUNT(*) as review_count')
            ->first();
        $doctorReviewStats = Review::query()
            ->whereIn('doctor_id', $doctors->pluck('id'))
            ->where('clinic_id', $clinic->id)
            ->selectRaw('doctor_id, AVG(rating) as average_rating, COUNT(*) as review_count')
            ->groupBy('doctor_id')
            ->get()
            ->keyBy('doctor_id');

        return Inertia::render('Client/Clinics/ShowClinic', [
            'clinic' => [
                'id' => $clinic->id,
                'name' => $clinic->clinic_name,
                'address' => $clinic->complete_address,
                'image' => $clinic->photo_url,
                'doctors_count' => $clinic->doctors_count,
                'open_time' => $clinic->open_time,
                'close_time' => $clinic->close_time,
                'latitude' => $clinic->latitude,
                'longitude' => $clinic->longitude,
                'status' => $clinic->status,
                'service_names' => $services->pluck('service_name')->unique()->values(),
                'rating' => round((float) ($reviewStats?->average_rating ?? 0), 1),
                'reviews_count' => (int) ($reviewStats?->review_count ?? 0),
            ],
            'services' => $services->map(fn (ClinicService $service): array => [
                'id' => $service->id,
                'name' => $service->service_name,
                'description' => $service->service_description,
                'amount' => (float) $service->amount,
                'image' => $service->image_url,
                'doctor_id' => $service->doctor_id,
            ])->values(),
            'doctors' => $doctors->map(fn (Doctor $doctor): array => [
                'id' => $doctor->id,
                'name' => 'Dr. '.trim(implode(' ', array_filter([$doctor->first_name, $doctor->middle_name, $doctor->last_name]))),
                'specialization' => $doctor->specialization?->name ?? 'General practice',
                'experience_years' => $doctor->experience_years,
                'photo' => $doctor->photo_url,
                'price' => (float) ($services->where('doctor_id', $doctor->id)->min('amount') ?? 0),
                'rating' => round((float) ($doctorReviewStats->get($doctor->id)?->average_rating ?? 0), 1),
                'reviews_count' => (int) ($doctorReviewStats->get($doctor->id)?->review_count ?? 0),
            ])->values(),
            'selectedServiceId' => $selectedServiceId,
        ]);
    }

    /**
     * Doctors belonging to clinic.
     */
    public function doctors(Request $request, Clinic $clinic): Response
    {
        abort_unless(in_array(strtolower($clinic->status), ['active', 'approved'], true), 404);

        $doctors = Doctor::query()
            ->whereRaw('LOWER(status) = ?', ['active'])
            ->whereHas('clinics', fn ($query) => $query->whereKey($clinic->id))
            ->when($request->integer('service_id'), fn ($query, int $serviceId) => $query->whereHas('services', fn ($query) => $query
                ->whereKey($serviceId)
                ->where('clinic_id', $clinic->id)))
            ->with('user')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Client/Clinics/Doctors', [
            'clinic' => [
                'id' => $clinic->id,
                'clinic_name' => $clinic->clinic_name,
            ],
            'doctors' => $doctors,
            'selectedServiceId' => $request->integer('service_id') ?: null,
        ]);
    }

    /**
     * Doctor detail.
     */
    public function doctor(Clinic $clinic, Doctor $doctor): Response
    {
        abort_unless(in_array(strtolower($clinic->status), ['active', 'approved'], true), 404);
        abort_unless($doctor->clinics()->whereKey($clinic->id)->exists(), 404);
        abort_unless(strtolower($doctor->status) === 'active', 404);

        $doctor->load(['user', 'specialization']);
        $availableClinics = $doctor->clinics()
            ->whereRaw('LOWER(status) IN (?, ?)', ['active', 'approved'])
            ->orderBy('clinic_name')
            ->get(['clinics.id', 'clinics.clinic_name']);
        $reviewStats = Review::query()
            ->where('doctor_id', $doctor->id)
            ->where('clinic_id', $clinic->id)
            ->selectRaw('AVG(rating) as average_rating, COUNT(*) as review_count')
            ->first();
        $reviews = Review::query()
            ->where('doctor_id', $doctor->id)
            ->where('clinic_id', $clinic->id)
            ->with('patient:id,first_name,last_name')
            ->latest()
            ->get()
            ->map(fn (Review $review): array => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'patient_name' => trim($review->patient?->first_name.' '.$review->patient?->last_name) ?: 'Patient',
                'created_at' => $review->created_at?->format('M j, Y'),
            ])->values();
        $services = ClinicService::query()
            ->where('clinic_id', $clinic->id)
            ->where('doctor_id', $doctor->id)
            ->orderBy('service_name')
            ->get();
        $schedules = DoctorClinicSchedule::query()
            ->where('clinic_id', $clinic->id)
            ->where('doctor_id', $doctor->id)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(fn (DoctorClinicSchedule $schedule): array => [
                'id' => $schedule->id,
                'day_of_week' => $schedule->day_of_week,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'max_patients' => $schedule->max_patients_per_slot,
            ])->values();
        $sessionCounts = Reservation::query()
            ->where('clinic_id', $clinic->id)
            ->where('doctor_id', $doctor->id)
            ->whereBetween('appointment_at', [now()->startOfDay(), now()->addDays(20)->endOfDay()])
            ->whereIn('status', ['Pending', 'Reserved', 'Confirmed', 'Checked In'])
            ->get(['schedule_id', 'appointment_at'])
            ->groupBy(fn (Reservation $reservation): string => $reservation->appointment_at->format('Y-m-d').'|'.$reservation->schedule_id)
            ->map(fn (Collection $reservations): int => $reservations->count())
            ->all();

        return Inertia::render('Client/Clinics/Show', [
            'clinic' => [
                'id' => $clinic->id,
                'name' => $clinic->clinic_name,
                'address' => $clinic->complete_address,
                'region' => $clinic->complete_address,
                'products' => [],
                'rating' => round((float) ($reviewStats?->average_rating ?? 0), 1),
                'reviews_count' => (int) ($reviewStats?->review_count ?? 0),
            ],
            'availableClinics' => $availableClinics->map(fn (Clinic $availableClinic): array => [
                'id' => $availableClinic->id,
                'name' => $availableClinic->clinic_name,
            ])->values(),
            'doctor' => [
                'id' => $doctor->id,
                'first_name' => $doctor->first_name,
                'middle_name' => $doctor->middle_name,
                'last_name' => $doctor->last_name,
                'specialization' => ['name' => $doctor->specialization?->name ?? 'General practice'],
                'experience_years' => $doctor->experience_years,
                'photo' => $doctor->photo_url,
                'languages' => [],
                'about' => $doctor->about ?? $doctor->complete_address,
                'region' => $doctor->region,
                'gender' => $doctor->gender,
                'age' => $doctor->birthdate?->age,
                'birthdate' => $doctor->birthdate?->format('Y-m-d'),
                'rating' => round((float) ($reviewStats?->average_rating ?? 0), 1),
                'reviews' => (int) ($reviewStats?->review_count ?? 0),
            ],
            'services' => $services->map(fn (ClinicService $service): array => [
                'id' => $service->id,
                'name' => $service->service_name,
                'price' => (float) $service->amount,
                'image' => $service->image_url,
            ])->values(),
            'schedules' => $schedules,
            'sessionCounts' => $sessionCounts,
            'reviews' => $reviews,
        ]);
    }

    /**
     * Doctor services.
     */
    public function services(Clinic $clinic, Doctor $doctor): Response
    {
        abort_unless(in_array(strtolower($clinic->status), ['active', 'approved'], true), 404);
        abort_unless($doctor->clinics()->whereKey($clinic->id)->exists(), 404);
        abort_unless(strtolower($doctor->status) === 'active', 404);

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
    public function availability(Clinic $clinic, Doctor $doctor): Response
    {
        abort_unless(in_array(strtolower($clinic->status), ['active', 'approved'], true), 404);
        abort_unless($doctor->clinics()->whereKey($clinic->id)->exists(), 404);
        abort_unless(strtolower($doctor->status) === 'active', 404);

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
        abort_unless($clinic->status === 'active', 404);

        $patient = auth('patient')->user();

        $patient->update([
            'clinic_id' => $clinic->id,
        ]);

        return back()->with('success', 'Clinic selected successfully.');
    }

    /* ---------- Helpers ---------- */

    private function imageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return str_starts_with($path, 'http') || str_starts_with($path, '/')
            ? $path
            : Storage::disk('public')->url($path);
    }

    /**
     * Map a day_of_week value to an offset from the start of the week
     * (Carbon default: Monday = 0 .. Sunday = 6).
     *
     * Accepts either numeric values (0 = Sunday .. 6 = Saturday)
     * or day names ("Monday", "mon", ...). Returns null if unreadable.
     */
    private function dayOffset(mixed $day): ?int
    {
        if (is_numeric($day)) {
            return (((int) $day) + 6) % 7; // 0=Sun..6=Sat -> Mon=0..Sun=6
        }

        $map = [
            'mon' => 0,
            'tue' => 1,
            'wed' => 2,
            'thu' => 3,
            'fri' => 4,
            'sat' => 5,
            'sun' => 6,
        ];

        return $map[strtolower(substr(trim((string) $day), 0, 3))] ?? null;
    }

    /**
     * Next weekly slot as a label such as "Today, 4:30 pm".
     * ASSUMPTION: schedule rows have `day_of_week` (numeric 0 = Sunday .. 6 = Saturday,
     * or a day name) and `start_time` (HH:MM[:SS]).
     */
    private function nextSlot(Collection $rows): string
    {
        $now = now();
        $best = null;

        foreach ($rows as $r) {
            $offset = $this->dayOffset($r->day_of_week);

            if ($offset === null || ! $r->start_time) {
                continue; // skip rows we can't interpret
            }

            $slot = $now->copy()
                ->startOfWeek()
                ->addDays($offset)
                ->setTimeFromTimeString($r->start_time);

            if ($slot->lt($now)) {
                $slot->addWeek();
            }

            if (! $best || $slot->lt($best)) {
                $best = $slot;
            }
        }

        if (! $best) {
            return 'No upcoming slots';
        }

        if ($best->isToday()) {
            return 'Today, '.$best->format('g:i a');
        }

        if ($best->isTomorrow()) {
            return 'Tomorrow, '.$best->format('g:i a');
        }

        return $best->format('D, g:i a');
    }
}
