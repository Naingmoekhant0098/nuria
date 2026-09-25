<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicMedicalProduct;
use App\Models\Doctor;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\InventoryTransaction;
use App\Models\MedicalProduct;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Sale;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $admin = $request->user('admin');
        $currentMonth = CarbonImmutable::now()->startOfMonth();
        $firstMonth = $currentMonth->subMonths(5);
        $months = collect(range(5, 0))->map(function (int $monthsAgo) use ($currentMonth): array {
            $month = $currentMonth->subMonths($monthsAgo);

            return ['key' => $month->format('Y-m'), 'label' => $month->format('M')];
        });
        $reservationsByMonth = Reservation::query()->where('created_at', '>=', $firstMonth)->get(['created_at'])
            ->groupBy(fn (Reservation $reservation): string => $reservation->created_at->format('Y-m'))
            ->map(fn ($reservations): int => $reservations->count());
        $salesByMonth = Sale::query()->where('created_at', '>=', $firstMonth)->get(['created_at', 'total'])
            ->groupBy(fn (Sale $sale): string => $sale->created_at->format('Y-m'))
            ->map(fn ($sales): float => (float) $sales->sum('total'));
        $summary = [
            ['label' => 'Clinics', 'value' => Clinic::query()->count(), 'href' => '/admin/clinics', 'permission' => 'clinics.manage'],
            ['label' => 'Admin users', 'value' => User::query()->where('is_admin', true)->count(), 'href' => '/admin/users', 'permission' => 'admins.manage'],
            ['label' => 'Doctors', 'value' => Doctor::query()->count(), 'href' => '/admin/doctors', 'permission' => 'doctors.view'],
            ['label' => 'Patients', 'value' => Patient::query()->count(), 'href' => '/admin/patients', 'permission' => 'patients.view'],
            ['label' => 'Reservations', 'value' => Reservation::query()->count(), 'href' => '/admin/reservations', 'permission' => 'reservations.view'],
            ['label' => 'Drugs', 'value' => Drug::query()->count(), 'href' => '/admin/inventory/drugs', 'permission' => 'inventory.manage'],
            ['label' => 'Medical products', 'value' => MedicalProduct::query()->count(), 'href' => '/admin/inventory/medical-products', 'permission' => 'inventory.manage'],
            ['label' => 'Drug units in clinic stock', 'value' => DrugBatch::query()->sum('quantity'), 'href' => '/admin/inventory/reports/drugs', 'permission' => 'inventory.manage'],
            ['label' => 'Medical product units in clinic stock', 'value' => ClinicMedicalProduct::query()->sum('quantity'), 'href' => '/admin/inventory/reports/medical-products', 'permission' => 'inventory.manage'],
        ];
        $financialSummary = [
            ['label' => 'Reservation charges', 'amount' => Reservation::query()->sum('amount')],
            ['label' => 'Recorded reservation payments', 'amount' => Payment::query()->sum('amount')],
            ['label' => 'Prescription sales', 'amount' => Sale::query()->whereNotNull('prescription_id')->sum('total')],
        ];
        $onlineOrders = Sale::query()->where('sale_type', 'online_order');
        $onlineOrderSummary = $admin->hasAdminPermission('orders.manage') ? [
            'orders_count' => (clone $onlineOrders)->count(),
            'paid_total' => (float) (clone $onlineOrders)->where('payment_status', 'Paid')->sum('total'),
            'pending_payment_count' => (clone $onlineOrders)->where('payment_status', 'Pending')->count(),
        ] : null;

        return Inertia::render('admin/dashboard/dashboard', [
            'summary' => collect($summary)->filter(fn (array $item): bool => $admin->hasAdminPermission($item['permission']))->values(),
            'financialSummary' => $admin->hasAdminPermission('finance.view') ? $financialSummary : [],
            'onlineOrderSummary' => $onlineOrderSummary,
            'recentOnlineOrders' => $admin->hasAdminPermission('orders.manage') ? (clone $onlineOrders)
                ->with(['clinic:id,clinic_name', 'patient:id,first_name,last_name'])
                ->latest()->limit(6)
                ->get(['id', 'clinic_id', 'patient_id', 'order_status', 'payment_status', 'total', 'created_at']) : [],
            'reservationTrend' => $admin->hasAdminPermission('reservations.view') ? $months->map(fn (array $month): array => [
                'label' => $month['label'],
                'value' => $reservationsByMonth->get($month['key'], 0),
            ])->values() : [],
            'revenueTrend' => $admin->hasAdminPermission('finance.view') ? $months->map(fn (array $month): array => [
                'label' => $month['label'],
                'value' => $salesByMonth->get($month['key'], 0),
            ])->values() : [],
            'reservationStatuses' => $admin->hasAdminPermission('reservations.view')
                ? Reservation::query()->get(['status'])->groupBy('status')
                    ->map(fn ($records, string $status): array => ['label' => $status, 'value' => $records->count()])->values()
                : [],
            'clinicStatuses' => $admin->hasAdminPermission('clinics.manage')
                ? Clinic::query()->get(['status'])->groupBy('status')
                    ->map(fn ($records, string $status): array => ['label' => $status, 'value' => $records->count()])->values()
                : [],
            'clinics' => $admin->hasAdminPermission('clinics.manage') ? Clinic::query()->withCount(['doctors', 'services'])->latest()->limit(10)->get(['id', 'clinic_name', 'status', 'created_at']) : [],
            'reservations' => $admin->hasAdminPermission('reservations.view') ? Reservation::query()
                ->with(['clinic:id,clinic_name', 'doctor:id,first_name,last_name', 'patient:id,first_name,last_name'])
                ->latest()->limit(10)->get(['id', 'appointment_code', 'clinic_id', 'doctor_id', 'patient_id', 'status', 'amount', 'created_at']) : [],
            'inventoryMovements' => ($admin->hasAdminPermission('inventory.manage') || $admin->hasAdminPermission('reports.view')) ? InventoryTransaction::query()
                ->with(['clinic:id,clinic_name', 'drug:id,name', 'medicalProduct:id,name'])
                ->latest()->limit(10)->get() : [],
        ]);
    }
}
