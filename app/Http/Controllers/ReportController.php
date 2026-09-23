<?php

namespace App\Http\Controllers;

use App\Models\ClinicMedicalProduct;
use App\Models\Consultation;
use App\Models\DrugBatch;
use App\Models\Reservation;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function stock(Request $request): Response
    {
        $clinicId = $request->user()->id;
        $today = today();
        $expiresWithinThirtyDays = today()->addDays(30);
        $batches = DrugBatch::query()
            ->with('drug')
            ->where('clinic_id', $clinicId)
            ->get();

        $drugStock = $batches
            ->groupBy('drug_id')
            ->map(function ($drugBatches) use ($today, $expiresWithinThirtyDays): array {
                return [
                    'name' => $drugBatches->first()->drug->name,
                    'strength' => $drugBatches->first()->drug->strength,
                    'available_quantity' => $drugBatches
                        ->filter(fn (DrugBatch $batch): bool => $batch->expiry_date->isAfter($today))
                        ->sum('quantity'),
                    'expiring_quantity' => $drugBatches
                        ->filter(fn (DrugBatch $batch): bool => $batch->expiry_date->isAfter($today) && $batch->expiry_date->lessThanOrEqualTo($expiresWithinThirtyDays))
                        ->sum('quantity'),
                    'expired_quantity' => $drugBatches
                        ->filter(fn (DrugBatch $batch): bool => $batch->expiry_date->lessThanOrEqualTo($today))
                        ->sum('quantity'),
                ];
            })
            ->sortBy('name')
            ->values();

        $medicalStock = ClinicMedicalProduct::query()
            ->with('product')
            ->where('clinic_id', $clinicId)
            ->get()
            ->map(fn (ClinicMedicalProduct $stock): array => [
                'name' => $stock->product->name,
                'quantity' => $stock->quantity,
                'sale_price' => $stock->sale_price,
                'is_active' => $stock->is_active,
            ])
            ->sortBy('name')
            ->values();

        return Inertia::render('reports/stock', [
            'summary' => [
                'available_drug_units' => $drugStock->sum('available_quantity'),
                'expiring_drug_units' => $drugStock->sum('expiring_quantity'),
                'expired_drug_units' => $drugStock->sum('expired_quantity'),
                'medical_product_units' => $medicalStock->sum('quantity'),
            ],
            'drugStock' => $drugStock,
            'medicalStock' => $medicalStock,
        ]);
    }

    public function operations(Request $request): Response
    {
        $clinicId = $request->user()->id;
        $sales = Sale::query()->where('clinic_id', $clinicId);

        return Inertia::render('reports/operations', [
            'summary' => [
                'sales_count' => (clone $sales)->count(),
                'sales_total' => (clone $sales)->sum('total'),
                'month_sales_total' => (clone $sales)
                    ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
                    ->sum('total'),
                'reservations_count' => Reservation::query()
                    ->where('clinic_id', $clinicId)
                    ->count(),
                'consultations_count' => Consultation::query()
                    ->whereHas('reservation', fn ($query) => $query->where('clinic_id', $clinicId))
                    ->count(),
            ],
            'reservationStatuses' => Reservation::query()
                ->where('clinic_id', $clinicId)
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->orderBy('status')
                ->get(),
            'topItems' => DB::table('sale_items')
                ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
                ->where('sales.clinic_id', $clinicId)
                ->select('sale_items.description', DB::raw('sum(sale_items.quantity) as quantity'), DB::raw('sum(sale_items.line_total) as total'))
                ->groupBy('sale_items.description')
                ->orderByDesc('total')
                ->limit(10)
                ->get(),
            'recentSales' => $sales
                ->latest()
                ->limit(10)
                ->get(['id', 'sale_type', 'total', 'payment_method', 'payment_status', 'created_at']),
        ]);
    }
}
