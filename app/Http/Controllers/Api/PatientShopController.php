<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicDrug;
use App\Models\ClinicMedicalProduct;
use App\Models\DrugBatch;
use App\Models\DrugUnit;
use App\Models\InventoryTransaction;
use App\Models\Patient;
use App\Models\PatientCartItem;
use App\Models\PaymentMethod;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PatientShopController extends Controller
{
    public function paymentMethods(): JsonResponse
    {
        return response()->json(['data' => PaymentMethod::query()->supported()->where('status', 'Active')->orderBy('name')->get(['id', 'name'])]);
    }

    public function products(Request $request): JsonResponse
    {
        $filters = $request->validate(['clinic_id' => ['required', 'integer', 'exists:clinics,id'], 'search' => ['nullable', 'string', 'max:120'], 'type' => ['nullable', Rule::in(['drug', 'medical_product'])]]);
        $clinicId = (int) $filters['clinic_id'];
        abort_unless(Clinic::query()->findOrFail($clinicId)->hasPlanFeature('online_orders'), 404);
        $data = collect();
        if (($filters['type'] ?? null) !== 'medical_product') {
            $data = $data->concat(ClinicDrug::query()->with(['drug.category', 'drug.form', 'drug.manufacturer', 'drug.units'])
                ->where('clinic_id', $clinicId)->where('is_active', true)->whereHas('drug', fn (Builder $q) => $q->where('is_active', true)->when($filters['search'] ?? null, fn (Builder $q, string $s) => $q->where('name', 'like', "%{$s}%")))
                ->get()->map(fn (ClinicDrug $row): array => ['type' => 'drug', 'id' => $row->drug->id, 'name' => $row->drug->name, 'sku' => $row->drug->sku, 'image_url' => $row->drug->image_url, 'strength' => $row->drug->strength, 'category' => $row->drug->category?->name, 'form' => $row->drug->form?->name, 'manufacturer' => $row->drug->manufacturer?->name,
                    'available_quantity' => (int) DrugBatch::query()->where('clinic_id', $clinicId)->where('drug_id', $row->drug_id)->where('expiry_date', '>', today())->sum('quantity'),
                    'units' => $row->drug->units->where('is_active', true)->values()->map(fn (DrugUnit $unit): array => ['id' => $unit->id, 'name' => $unit->unit_name, 'conversion_quantity' => $unit->conversion_quantity, 'price' => (float) ($row->sale_price_override ?? $unit->sale_price)])]));
        }
        if (($filters['type'] ?? null) !== 'drug') {
            $data = $data->concat(ClinicMedicalProduct::query()->with('product.category')->where('clinic_id', $clinicId)->where('is_active', true)->where('quantity', '>', 0)
                ->whereHas('product', fn (Builder $q) => $q->where('is_active', true)->when($filters['search'] ?? null, fn (Builder $q, string $s) => $q->where('name', 'like', "%{$s}%")))
                ->get()->map(fn (ClinicMedicalProduct $row): array => ['type' => 'medical_product', 'id' => $row->product->id, 'name' => $row->product->name, 'sku' => $row->product->sku, 'image_url' => $row->product->image_url, 'category' => $row->product->category?->name, 'available_quantity' => $row->quantity, 'price' => (float) $row->sale_price]));
        }

        return response()->json(['data' => $data->values()]);
    }

    public function cart(Request $request): JsonResponse
    {
        $items = PatientCartItem::query()->with(['drug', 'drugUnit', 'medicalProduct'])->where('patient_id', $this->patient($request)->id)->when($request->query('clinic_id'), fn (Builder $q, $clinicId) => $q->where('clinic_id', $clinicId))->get()->map(fn (PatientCartItem $item): array => $this->cartData($item));

        return response()->json(['data' => $items, 'count' => $items->sum('quantity'), 'subtotal' => round($items->sum(fn (array $i): float => $i['line_total']), 2)]);
    }

    public function addToCart(Request $request): JsonResponse
    {
        $data = $request->validate(['clinic_id' => ['required', 'integer', 'exists:clinics,id'], 'item_type' => ['required', Rule::in(['drug', 'medical_product'])], 'item_id' => ['required', 'integer'], 'drug_unit_id' => ['required_if:item_type,drug', 'nullable', 'integer'], 'quantity' => ['required', 'integer', 'min:1', 'max:1000']]);
        $attributes = ['patient_id' => $this->patient($request)->id, 'clinic_id' => $data['clinic_id'], 'item_type' => $data['item_type']];
        if ($data['item_type'] === 'drug') {
            $clinicDrug = ClinicDrug::query()->where('clinic_id', $data['clinic_id'])->where('drug_id', $data['item_id'])->where('is_active', true)->whereHas('drug', fn (Builder $q) => $q->where('is_active', true))->firstOrFail();
            $unit = DrugUnit::query()->where('drug_id', $clinicDrug->drug_id)->where('is_active', true)->findOrFail($data['drug_unit_id']);
            $available = (int) (DrugBatch::query()->where('clinic_id', $data['clinic_id'])->where('drug_id', $data['item_id'])->where('expiry_date', '>', today())->sum('quantity') / $unit->conversion_quantity);
            $attributes += ['drug_id' => $clinicDrug->drug_id, 'drug_unit_id' => $unit->id, 'medical_product_id' => null];
        } else {
            $stock = ClinicMedicalProduct::query()->where('clinic_id', $data['clinic_id'])->where('medical_product_id', $data['item_id'])->where('is_active', true)->whereHas('product', fn (Builder $q) => $q->where('is_active', true))->firstOrFail();
            $available = $stock->quantity;
            $attributes += ['drug_id' => null, 'drug_unit_id' => null, 'medical_product_id' => $stock->medical_product_id];
        }
        $cartItem = PatientCartItem::query()->firstOrNew($attributes);
        if ($available < ((int) $cartItem->quantity + $data['quantity'])) {
            throw ValidationException::withMessages(['quantity' => ['Requested quantity exceeds available stock.']]);
        }
        $cartItem->quantity = (int) $cartItem->quantity + $data['quantity'];
        $cartItem->save();

        return response()->json(['item' => $this->cartData($cartItem->load(['drug', 'drugUnit', 'medicalProduct']))], 201);
    }

    public function updateCartItem(Request $request, PatientCartItem $cartItem): JsonResponse
    {
        abort_unless($cartItem->patient_id === $this->patient($request)->id, 404);
        $cartItem->update($request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:1000']]));

        return response()->json(['item' => $this->cartData($cartItem->fresh()->load(['drug', 'drugUnit', 'medicalProduct']))]);
    }

    public function removeCartItem(Request $request, PatientCartItem $cartItem): JsonResponse
    {
        abort_unless($cartItem->patient_id === $this->patient($request)->id, 404);
        $cartItem->delete();

        return response()->json(['message' => 'Cart item removed.']);
    }

    public function checkout(Request $request): JsonResponse
    {
        $patient = $this->patient($request);
        $data = $request->validate([
            'clinic_id' => ['required', 'integer', 'exists:clinics,id'],
            'delivery_address' => ['required', 'string', 'max:2000'],
            'delivery_contact' => ['required', 'string', 'max:50'],
            'order_note' => ['nullable', 'string', 'max:1000'],
            'payment_method' => ['required', Rule::in(PaymentMethod::SUPPORTED_NAMES), Rule::exists('payment_methods', 'name')->where('status', 'Active')],
            'transaction_code' => ['required_unless:payment_method,Cash,Cash on Delivery', 'nullable', 'string', 'max:255'],
            'payment_image' => ['required_unless:payment_method,Cash,Cash on Delivery', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);
        abort_unless(Clinic::query()->findOrFail((int) $data['clinic_id'])->hasPlanFeature('online_orders'), 404);
        $sale = DB::transaction(function () use ($patient, $data, $request): Sale {
            $cart = PatientCartItem::query()->where('patient_id', $patient->id)->where('clinic_id', $data['clinic_id'])->lockForUpdate()->get();
            if ($cart->isEmpty()) {
                throw ValidationException::withMessages(['cart' => ['Your cart is empty.']]);
            }
            $rows = [];
            $subtotal = 0.0;
            foreach ($cart as $item) {
                if ($item->item_type === 'drug') {
                    $assignment = ClinicDrug::query()->where('clinic_id', $data['clinic_id'])->where('drug_id', $item->drug_id)->where('is_active', true)->firstOrFail();
                    $drug = $item->drug()->where('is_active', true)->firstOrFail();
                    $unit = DrugUnit::query()->where('drug_id', $drug->id)->where('is_active', true)->findOrFail($item->drug_unit_id);
                    $price = (float) ($assignment->sale_price_override ?? $unit->sale_price);
                    $line = ['item_type' => 'drug', 'drug_id' => $drug->id, 'drug_unit_id' => $unit->id, 'medical_product_id' => null, 'description' => $drug->name.' ('.$unit->unit_name.')', 'base_quantity' => $item->quantity * $unit->conversion_quantity];
                } else {
                    $stock = ClinicMedicalProduct::query()->where('clinic_id', $data['clinic_id'])->where('medical_product_id', $item->medical_product_id)->where('is_active', true)->lockForUpdate()->firstOrFail();
                    $product = $item->medicalProduct()->where('is_active', true)->firstOrFail();
                    $price = (float) $stock->sale_price;
                    $line = ['item_type' => 'medical_product', 'drug_id' => null, 'drug_unit_id' => null, 'medical_product_id' => $product->id, 'description' => $product->name, 'base_quantity' => $item->quantity];
                }
                $line += ['quantity' => $item->quantity, 'unit_price' => $price, 'line_total' => $item->quantity * $price];
                $subtotal += $line['line_total'];
                $rows[] = [$line, $item];
            }
            $sale = Sale::query()->create(['clinic_id' => $data['clinic_id'], 'patient_id' => $patient->id, 'sale_type' => 'online_order', 'subtotal' => $subtotal, 'discount' => 0, 'tax' => 0, 'total' => $subtotal, 'payment_method' => $data['payment_method'], 'transaction_code' => $data['transaction_code'] ?? null, 'payment_image_path' => $request->hasFile('payment_image') ? $request->file('payment_image')->store('payment-proofs', 'public') : null, 'payment_status' => 'Pending', 'order_status' => 'Pending', 'delivery_address' => $data['delivery_address'], 'delivery_contact' => $data['delivery_contact'], 'order_note' => $data['order_note'] ?? null]);
            foreach ($rows as [$line, $item]) {
                $sale->items()->create($line);
                if ($line['item_type'] === 'drug') {
                    $this->deductDrug((int) $data['clinic_id'], $sale->id, (int) $line['drug_id'], (int) $line['base_quantity']);
                } else {
                    $stock = ClinicMedicalProduct::query()->where('clinic_id', $data['clinic_id'])->where('medical_product_id', $line['medical_product_id'])->lockForUpdate()->firstOrFail();
                    if ($stock->quantity < $line['quantity']) {
                        throw ValidationException::withMessages(['cart' => ["Insufficient stock for {$line['description']}."]]);
                    }
                    $stock->decrement('quantity', $line['quantity']);
                    InventoryTransaction::query()->create(['clinic_id' => $data['clinic_id'], 'medical_product_id' => $line['medical_product_id'], 'sale_id' => $sale->id, 'transaction_type' => 'online_order', 'quantity' => -$line['quantity']]);
                }
                $item->delete();
            }

            return $sale->load(['items', 'clinic:id,clinic_name']);
        });

        return response()->json(['order' => $sale], 201);
    }

    public function orders(Request $request): JsonResponse
    {
        $data = $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);

        return response()->json(Sale::query()->with(['items', 'clinic:id,clinic_name'])->where('patient_id', $this->patient($request)->id)->where('sale_type', 'online_order')->latest()->paginate($data['per_page'] ?? 20));
    }

    public function showOrder(Request $request, Sale $sale): JsonResponse
    {
        abort_unless($sale->patient_id === $this->patient($request)->id && $sale->sale_type === 'online_order', 404);

        return response()->json(['order' => $sale->load(['items', 'clinic:id,clinic_name'])]);
    }

    private function patient(Request $request): Patient
    {
        return $request->user();
    }

    /** @return array<string, mixed> */
    private function cartData(PatientCartItem $item): array
    {
        $price = $item->item_type === 'drug'
            ? (float) (ClinicDrug::query()->where('clinic_id', $item->clinic_id)->where('drug_id', $item->drug_id)->value('sale_price_override') ?? $item->drugUnit?->sale_price ?? 0)
            : (float) (ClinicMedicalProduct::query()->where('clinic_id', $item->clinic_id)->where('medical_product_id', $item->medical_product_id)->value('sale_price') ?? 0);

        return ['id' => $item->id, 'clinic_id' => $item->clinic_id, 'item_type' => $item->item_type, 'item_id' => $item->drug_id ?? $item->medical_product_id, 'drug_unit_id' => $item->drug_unit_id, 'name' => $item->drug?->name ?? $item->medicalProduct?->name, 'unit' => $item->drugUnit?->unit_name, 'quantity' => $item->quantity, 'unit_price' => $price, 'line_total' => round($item->quantity * $price, 2)];
    }

    private function deductDrug(int $clinicId, int $saleId, int $drugId, int $quantity): void
    {
        $batches = DrugBatch::query()->lockForUpdate()->where('clinic_id', $clinicId)->where('drug_id', $drugId)->where('expiry_date', '>', today())->where('quantity', '>', 0)->orderBy('expiry_date')->orderBy('id')->get();
        if ($batches->sum('quantity') < $quantity) {
            throw ValidationException::withMessages(['cart' => ['Insufficient non-expired drug stock.']]);
        }
        foreach ($batches as $batch) {
            $deduction = min((int) $batch->quantity, $quantity);
            $batch->decrement('quantity', $deduction);
            InventoryTransaction::query()->create(['clinic_id' => $clinicId, 'drug_id' => $drugId, 'drug_batch_id' => $batch->id, 'sale_id' => $saleId, 'transaction_type' => 'online_order', 'quantity' => -$deduction]);
            $quantity -= $deduction;
            if ($quantity === 0) {
                break;
            }
        }
    }
}
