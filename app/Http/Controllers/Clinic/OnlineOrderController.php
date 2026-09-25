<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicMedicalProduct;
use App\Models\DrugBatch;
use App\Models\InventoryTransaction;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OnlineOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $clinic = $request->user();
        $filters = $this->validateFilters($request, includePagination: false);
        $query = $this->queryOrders($clinic, $filters);
        $orders = (clone $query)->paginate(20)->withQueryString();

        return Inertia::render('clinic/orders/index', [
            'orders' => $orders,
            'clinics' => [$clinic->only(['id', 'clinic_name'])],
            'filters' => $filters,
            'summary' => $this->summarize($query),
        ]);
    }

    public function apiIndex(Request $request): JsonResponse
    {
        $clinic = $request->user();
        $filters = $this->validateFilters($request, includePagination: true);

        return response()->json($this->queryOrders($clinic, $filters)->paginate($filters['per_page'] ?? 20));
    }

    public function export(Request $request): StreamedResponse
    {
        $clinic = $request->user();
        $filters = $this->validateFilters($request, includePagination: false);

        return response()->streamDownload(function () use ($clinic, $filters): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Order ID', 'Placed at', 'Patient', 'Items', 'Payment method', 'Payment status', 'Order status', 'Total']);

            $this->queryOrders($clinic, $filters)->with('patient:id,first_name,last_name')->reorder()->chunkById(500, function ($orders) use ($output): void {
                foreach ($orders as $order) {
                    fputcsv($output, [
                        $order->id,
                        $order->created_at?->toDateTimeString(),
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

    public function update(Request $request, Sale $sale): JsonResponse|RedirectResponse
    {
        $clinic = $request->user();
        abort_unless((int) $sale->clinic_id === (int) $clinic->id && $sale->sale_type === 'online_order', 404);

        $data = $request->validate([
            'order_status' => ['sometimes', 'required', Rule::in(['Processing', 'Shipped', 'Delivered', 'Cancelled'])],
            'payment_status' => ['sometimes', 'required', Rule::in(['Pending', 'Paid', 'Failed', 'Refunded', 'Cancelled'])],
        ]);

        abort_if($data === [], 422, 'Select an order or payment field to update.');

        DB::transaction(function () use ($data, $sale): void {
            $order = Sale::query()->lockForUpdate()->findOrFail($sale->id);

            if (isset($data['order_status'])) {
                $allowedStatuses = match ($order->order_status) {
                    'Pending' => ['Processing', 'Cancelled'],
                    'Processing' => ['Shipped', 'Cancelled'],
                    'Shipped' => ['Delivered'],
                    default => [],
                };
                abort_unless(in_array($data['order_status'], $allowedStatuses, true), 422, 'This order cannot move to the selected status.');

                if ($data['order_status'] === 'Cancelled') {
                    $this->restoreStock($order);
                    $order->payment_status = $order->payment_status === 'Paid' ? 'Refunded' : 'Cancelled';
                }

                $order->order_status = $data['order_status'];
            }

            if (array_key_exists('payment_status', $data)) {
                $order->payment_status = $data['payment_status'];
            }
            $order->save();
        });

        if ($request->expectsJson()) {
            return response()->json(['order' => $sale->fresh()->load(['items', 'clinic:id,clinic_name', 'patient:id,first_name,last_name,email'])]);
        }

        return back()->with('success', 'Order updated.');
    }

    private function queryOrders(Clinic $clinic, array $filters): Builder
    {
        return Sale::query()->with(['items', 'clinic:id,clinic_name', 'patient:id,first_name,last_name,email,contact_number'])
            ->where('clinic_id', $clinic->id)->where('sale_type', 'online_order')
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('order_status', $status))
            ->when($filters['payment_status'] ?? null, fn ($query, string $status) => $query->where('payment_status', $status))
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

    private function restoreStock(Sale $sale): void
    {
        $transactions = InventoryTransaction::query()->where('sale_id', $sale->id)->where('transaction_type', 'online_order')->lockForUpdate()->get();
        foreach ($transactions as $transaction) {
            $quantity = abs($transaction->quantity);
            if ($transaction->drug_batch_id !== null) {
                DrugBatch::query()->whereKey($transaction->drug_batch_id)->lockForUpdate()->increment('quantity', $quantity);
            } elseif ($transaction->medical_product_id !== null) {
                ClinicMedicalProduct::query()->where('clinic_id', $sale->clinic_id)->where('medical_product_id', $transaction->medical_product_id)->lockForUpdate()->increment('quantity', $quantity);
            }
            InventoryTransaction::query()->create([
                'clinic_id' => $sale->clinic_id, 'drug_id' => $transaction->drug_id,
                'medical_product_id' => $transaction->medical_product_id, 'drug_batch_id' => $transaction->drug_batch_id,
                'sale_id' => $sale->id, 'transaction_type' => 'online_order_cancelled', 'quantity' => $quantity,
            ]);
        }
    }
}
