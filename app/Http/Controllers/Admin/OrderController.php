<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $this->validateFilters($request, includePagination: false);
        $query = $this->queryOrders($filters);
        $orders = (clone $query)->paginate(20)->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'clinics' => Clinic::query()->orderBy('clinic_name')->get(['id', 'clinic_name']),
            'filters' => $filters,
            'summary' => $this->summarize($query),
        ]);
    }

    public function apiIndex(Request $request): JsonResponse
    {
        $filters = $this->validateFilters($request, includePagination: true);

        return response()->json($this->queryOrders($filters)->paginate($filters['per_page'] ?? 20));
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->validateFilters($request, includePagination: false);

        return response()->streamDownload(function () use ($filters): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Order ID', 'Placed at', 'Clinic', 'Patient', 'Items', 'Payment method', 'Payment status', 'Order status', 'Total']);

            $this->queryOrders($filters)->with(['clinic:id,clinic_name', 'patient:id,first_name,last_name'])->reorder()->chunkById(500, function ($orders) use ($output): void {
                foreach ($orders as $order) {
                    fputcsv($output, [
                        $order->id,
                        $order->created_at?->toDateTimeString(),
                        $order->clinic?->clinic_name,
                        trim(($order->patient?->first_name ?? '').' '.($order->patient?->last_name ?? '')),
                        $order->items->map(fn ($item): string => $item->description.' x '.$item->quantity)->implode('; '),
                        $order->payment_method,
                        $order->payment_status,
                        $order->order_status,
                        $order->total,
                    ]);
                }
            });

            fclose($output);
        }, 'online-orders-report.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function queryOrders(array $filters): Builder
    {
        return Sale::query()->with(['items', 'clinic:id,clinic_name', 'patient:id,first_name,last_name,email,contact_number'])
            ->where('sale_type', 'online_order')
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('order_status', $status))
            ->when($filters['payment_status'] ?? null, fn ($query, string $status) => $query->where('payment_status', $status))
            ->when($filters['clinic_id'] ?? null, fn ($query, int $clinicId) => $query->where('clinic_id', $clinicId))
            ->when($filters['date_from'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '<=', $date))
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query->where(function ($query) use ($search): void {
                $query->where('id', 'like', "%{$search}%")->orWhere('delivery_contact', 'like', "%{$search}%")
                    ->orWhereHas('patient', fn ($patient) => $patient->where('first_name', 'like', "%{$search}%")->orWhere('last_name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            }))->latest();
    }

    private function validateFilters(Request $request, bool $includePagination): array
    {
        $rules = [
            'search' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', 'string', 'max:30'],
            'payment_status' => ['nullable', 'string', 'max:30'],
            'clinic_id' => ['nullable', 'integer', 'exists:clinics,id'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ];
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $rules['date_from'][] = 'before_or_equal:date_to';
            $rules['date_to'][] = 'after_or_equal:date_from';
        }
        if ($includePagination) {
            $rules['per_page'] = ['nullable', 'integer', 'min:1', 'max:100'];
        }

        return $request->validate($rules);
    }

    private function summarize(Builder $query): array
    {
        return [
            'orders_count' => (clone $query)->count(),
            'sales_total' => (float) (clone $query)->sum('total'),
            'paid_total' => (float) (clone $query)->where('payment_status', 'Paid')->sum('total'),
            'pending_payments_count' => (clone $query)->where('payment_status', 'Pending')->count(),
        ];
    }
}
