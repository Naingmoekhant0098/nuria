<?php

namespace App\Http\Controllers;

use App\Models\ClinicMedicalProduct;
use App\Models\Clinic;
use App\Models\Consultation;
use App\Models\DrugBatch;
use App\Models\Reservation;
use App\Models\Sale;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $filters = $request->validate([
            'period' => ['nullable', 'in:daily,weekly,monthly,custom'],
            'start_date' => ['nullable', 'date', 'required_if:period,custom'],
            'end_date' => ['nullable', 'date', 'required_if:period,custom', 'after_or_equal:start_date'],
        ]);
        $period = $filters['period'] ?? 'weekly';
        $start = match ($period) {
            'daily' => today(),
            'monthly' => today()->startOfMonth(),
            'custom' => Carbon::parse($filters['start_date'])->startOfDay(),
            default => today()->startOfWeek(),
        };
        $end = match ($period) {
            'daily' => today()->endOfDay(),
            'monthly' => today()->endOfMonth(),
            'custom' => Carbon::parse($filters['end_date'])->endOfDay(),
            default => today()->endOfWeek(),
        };
        /** @var Clinic $clinic */
        $clinic = $request->user('clinic');
        $clinicId = $clinic->id;
        $bucketFormat = $period === 'daily' ? 'H:00' : 'M j';
        $buckets = $period === 'daily'
            ? collect(range(0, 23))->mapWithKeys(fn (int $hour): array => [today()->copy()->addHours($hour)->format($bucketFormat) => ['revenue' => 0, 'reservations' => 0, 'consultations' => 0]])
            : collect(CarbonPeriod::create($start->copy()->startOfDay(), $end->copy()->startOfDay()))->mapWithKeys(fn (Carbon $date): array => [$date->format($bucketFormat) => ['revenue' => 0, 'reservations' => 0, 'consultations' => 0]]);

        $reservations = Reservation::query()->where('clinic_id', $clinicId)->whereBetween('created_at', [$start, $end]);
        $sales = Sale::query()->where('clinic_id', $clinicId)->whereBetween('created_at', [$start, $end]);
        $consultations = Consultation::query()->whereHas('reservation', fn ($query) => $query->where('clinic_id', $clinicId))->whereBetween('created_at', [$start, $end]);

        foreach ((clone $sales)->get(['total', 'created_at']) as $sale) {
            $key = $sale->created_at->format($bucketFormat);
            if ($buckets->has($key)) {
                $bucket = $buckets->get($key);
                $bucket['revenue'] += (float) $sale->total;
                $buckets->put($key, $bucket);
            }
        }
        foreach ((clone $reservations)->get(['created_at']) as $reservation) {
            $key = $reservation->created_at->format($bucketFormat);
            if ($buckets->has($key)) {
                $bucket = $buckets->get($key);
                $bucket['reservations']++;
                $buckets->put($key, $bucket);
            }
        }
        foreach ((clone $consultations)->get(['created_at']) as $consultation) {
            $key = $consultation->created_at->format($bucketFormat);
            if ($buckets->has($key)) {
                $bucket = $buckets->get($key);
                $bucket['consultations']++;
                $buckets->put($key, $bucket);
            }
        }

        $stock = ClinicMedicalProduct::query()
            ->with('product')
            ->where('clinic_id', $clinicId)
            ->where('is_active', true)
            ->where('quantity', '<=', 10)
            ->get()
            ->map(fn (ClinicMedicalProduct $item): array => ['name' => $item->product->name, 'quantity' => $item->quantity, 'unit' => 'units'])
            ->merge(DrugBatch::query()->with('drug')->where('clinic_id', $clinicId)->where('quantity', '<=', 10)->whereDate('expiry_date', '>', today())->get()
                ->map(fn (DrugBatch $item): array => ['name' => $item->drug->name, 'quantity' => $item->quantity, 'unit' => 'units']))
            ->sortBy('quantity')->take(6)->values();

        return Inertia::render('dashboard', [
            'clinic' => ['name' => $clinic->clinic_name],
            'filters' => ['period' => $period, 'start_date' => $start->toDateString(), 'end_date' => $end->toDateString()],
            'summary' => [
                'revenue' => (clone $sales)->sum('total'),
                'reservations' => (clone $reservations)->count(),
                'patients' => (clone $reservations)->distinct('patient_id')->count('patient_id'),
                'consultations' => (clone $consultations)->count(),
            ],
            'trends' => $buckets->map(fn (array $values, string $label): array => ['label' => $label, ...$values])->values(),
            'reservationStatuses' => Reservation::query()->where('clinic_id', $clinicId)->whereBetween('created_at', [$start, $end])->selectRaw('status, count(*) as total')->groupBy('status')->get(),
            'recentReservations' => Reservation::query()->with(['patient', 'doctor'])->where('clinic_id', $clinicId)->latest()->limit(6)->get(),
            'lowStock' => $stock,
        ]);
    }
}
