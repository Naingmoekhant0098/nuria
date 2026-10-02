<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicDrug;
use App\Models\ClinicMedicalProduct;
use App\Models\DrugBatch;
use App\Models\DrugUnit;
use App\Models\InventoryTransaction;
use App\Models\MedicalProduct;
use App\Models\PatientCartItem;
use App\Models\PaymentMethod;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ClientShopController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', Rule::in(['drug', 'medical_product'])],
            'clinic_id' => ['nullable', 'integer', 'exists:clinics,id'],
        ]);
        $drugs = ClinicDrug::query()
            ->with(['clinic:id,clinic_name', 'drug:id,name,strength,sku,image_path', 'drug.units'])
            ->where('is_active', true)
            ->whereHas('clinic', fn ($query) => $query->whereIn('status', ['active', 'approved']))
            ->when(($filters['type'] ?? null) === 'medical_product', fn ($query) => $query->whereRaw('1 = 0'))
            ->when($filters['clinic_id'] ?? null, fn ($query, int $clinicId) => $query->where('clinic_id', $clinicId))
            ->whereHas('drug', fn ($query) => $query
                ->where('is_active', true)
                ->when($filters['search'] ?? null, fn ($query, string $search) => $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")->orWhere('strength', 'like', "%{$search}%");
                })))
            ->get()
            ->filter(fn (ClinicDrug $row): bool => $row->clinic->hasPlanFeature('online_orders'))
            ->map(fn (ClinicDrug $row): array => [
                'key' => "drug-{$row->clinic_id}-{$row->drug_id}",
                'item_type' => 'drug', 'item_id' => $row->drug_id, 'clinic_id' => $row->clinic_id,
                'name' => $row->drug->name, 'subtitle' => $row->drug->strength,
                'clinic_name' => $row->clinic->clinic_name, 'image_url' => $row->drug->image_url,
                'drug_unit_id' => $row->drug->units->where('is_active', true)->sortByDesc('is_default')->first()?->id,
                'price' => (float) ($row->sale_price_override ?? $row->drug->units()->where('is_active', true)->min('sale_price') ?? 0),
            ]);

        $medicalProducts = ClinicMedicalProduct::query()
            ->with(['clinic:id,clinic_name', 'product:id,name,sku,image_path'])
            ->where('is_active', true)->where('quantity', '>', 0)
            ->whereHas('clinic', fn ($query) => $query->whereIn('status', ['active', 'approved']))
            ->when(($filters['type'] ?? null) === 'drug', fn ($query) => $query->whereRaw('1 = 0'))
            ->when($filters['clinic_id'] ?? null, fn ($query, int $clinicId) => $query->where('clinic_id', $clinicId))
            ->whereHas('product', fn ($query) => $query
                ->where('is_active', true)
                ->when($filters['search'] ?? null, fn ($query, string $search) => $query->where('name', 'like', "%{$search}%")))
            ->get()
            ->filter(fn (ClinicMedicalProduct $row): bool => $row->clinic->hasPlanFeature('online_orders'))
            ->map(fn (ClinicMedicalProduct $row): array => [
                'key' => "medical_product-{$row->clinic_id}-{$row->medical_product_id}",
                'item_type' => 'medical_product', 'item_id' => $row->medical_product_id, 'clinic_id' => $row->clinic_id,
                'name' => $row->product->name, 'subtitle' => $row->clinic->clinic_name,
                'clinic_name' => $row->clinic->clinic_name, 'image_url' => $row->product->image_url,
                'price' => (float) $row->sale_price,
            ]);

        $products = $drugs->concat($medicalProducts)->values();

        return Inertia::render('Client/Shop/Index', [
            'products' => $products,
            'cartCount' => auth('patient')->user()?->cartItems()->sum('quantity') ?? 0,
            'clinics' => ClinicDrug::query()->with('clinic:id,clinic_name')->where('is_active', true)->get()->pluck('clinic')->filter()->unique('id')->values(),
            'filters' => $filters,
        ]);
    }

    public function show(MedicalProduct $product): Response
    {
        abort_unless($product->is_active, 404);

        return Inertia::render('Client/Shop/Show', ['product' => $product]);
    }

    public function cart(): Response
    {
        $items = $this->cartItems()->map(fn (PatientCartItem $item): array => $this->cartData($item));

        return Inertia::render('Client/Shop/Cart', [
            'items' => $items,
            'subtotal' => $items->sum('line_total'),
            'paymentMethods' => PaymentMethod::query()->supported()->where('status', 'Active')->orderBy('name')->pluck('name')->values(),
        ]);
    }

    public function addToCart(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'clinic_id' => ['required', 'integer', 'exists:clinics,id'],
            'item_type' => ['required', Rule::in(['drug', 'medical_product'])],
            'item_id' => ['required', 'integer'],
            'drug_unit_id' => ['nullable', 'integer', 'required_if:item_type,drug'],
            'quantity' => ['required', 'integer', 'min:1', 'max:1000'],
        ]);
        abort_unless(Clinic::query()->findOrFail($data['clinic_id'])->hasPlanFeature('online_orders'), 404);
        $attributes = ['patient_id' => auth('patient')->id(), 'clinic_id' => $data['clinic_id'], 'item_type' => $data['item_type']];
        if ($this->cartItems()->where('clinic_id', '!=', $data['clinic_id'])->isNotEmpty()) {
            throw ValidationException::withMessages(['cart' => 'Please complete your current clinic order before adding items from another clinic.']);
        }
        if ($data['item_type'] === 'drug') {
            $clinicDrug = ClinicDrug::query()->where('clinic_id', $data['clinic_id'])->where('drug_id', $data['item_id'])->where('is_active', true)->firstOrFail();
            $unit = DrugUnit::query()->where('drug_id', $clinicDrug->drug_id)->where('is_active', true)->findOrFail($data['drug_unit_id']);
            $available = (int) (DrugBatch::query()->where('clinic_id', $data['clinic_id'])->where('drug_id', $data['item_id'])->where('expiry_date', '>', today())->sum('quantity') / $unit->conversion_quantity);
            $attributes += ['drug_id' => $clinicDrug->drug_id, 'drug_unit_id' => $unit->id, 'medical_product_id' => null];
        } else {
            $stock = ClinicMedicalProduct::query()->where('clinic_id', $data['clinic_id'])->where('medical_product_id', $data['item_id'])->where('is_active', true)->firstOrFail();
            $available = $stock->quantity;
            $attributes += ['drug_id' => null, 'drug_unit_id' => null, 'medical_product_id' => $stock->medical_product_id];
        }
        $item = PatientCartItem::query()->firstOrNew($attributes);
        if ($available < ((int) $item->quantity + $data['quantity'])) {
            throw ValidationException::withMessages(['quantity' => 'Requested quantity exceeds available stock.']);
        }
        $item->quantity = (int) $item->quantity + $data['quantity'];
        $item->save();

        return back()->with('success', 'Added to your cart.');
    }

    public function updateCartItem(Request $request, PatientCartItem $cartItem): RedirectResponse
    {
        abort_unless($cartItem->patient_id === auth('patient')->id(), 404);
        $data = $request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:1000']]);
        $available = $cartItem->item_type === 'drug'
            ? (int) (DrugBatch::query()->where('clinic_id', $cartItem->clinic_id)->where('drug_id', $cartItem->drug_id)->where('expiry_date', '>', today())->sum('quantity') / $cartItem->drugUnit->conversion_quantity)
            : (int) ClinicMedicalProduct::query()->where('clinic_id', $cartItem->clinic_id)->where('medical_product_id', $cartItem->medical_product_id)->value('quantity');
        if ($data['quantity'] > $available) {
            throw ValidationException::withMessages(['quantity' => 'Requested quantity exceeds available stock.']);
        }
        $cartItem->update($data);

        return back()->with('success', 'Cart updated.');
    }

    public function removeCartItem(PatientCartItem $cartItem): RedirectResponse
    {
        abort_unless($cartItem->patient_id === auth('patient')->id(), 404);
        $cartItem->delete();

        return back()->with('success', 'Item removed from your cart.');
    }

    public function checkout(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'clinic_id' => ['required', 'integer', 'exists:clinics,id'],
            'delivery_address' => ['required', 'string', 'max:2000'],
            'delivery_contact' => ['required', 'string', 'max:50'],
            'order_note' => ['nullable', 'string', 'max:1000'],
            'payment_method' => ['required', Rule::exists('payment_methods', 'name')->where('status', 'Active')],
            'transaction_code' => ['nullable', 'string', 'max:255'],
            'payment_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);
        abort_unless(Clinic::query()->findOrFail($data['clinic_id'])->hasPlanFeature('online_orders'), 404);
        DB::transaction(function () use ($request, $data): void {
            $items = $this->cartItems()->where('clinic_id', $data['clinic_id'])->lockForUpdate()->get();
            if ($items->isEmpty()) {
                throw ValidationException::withMessages(['cart' => 'Your cart is empty.']);
            }
            $rows = [];
            $subtotal = 0.0;
            foreach ($items as $item) {
                $row = $this->checkoutRow($item);
                $subtotal += $row['line_total'];
                $rows[] = [$row, $item];
            }
            $sale = Sale::query()->create([
                'clinic_id' => $data['clinic_id'], 'patient_id' => auth('patient')->id(), 'sale_type' => 'online_order',
                'subtotal' => $subtotal, 'discount' => 0, 'tax' => 0, 'total' => $subtotal,
                'payment_method' => $data['payment_method'], 'transaction_code' => $data['transaction_code'] ?? null,
                'payment_image_path' => $request->file('payment_image')?->store('payment-proofs', 'public'),
                'payment_status' => 'Pending', 'order_status' => 'Pending', 'delivery_address' => $data['delivery_address'],
                'delivery_contact' => $data['delivery_contact'], 'order_note' => $data['order_note'] ?? null,
            ]);
            foreach ($rows as [$row, $item]) {
                $sale->items()->create($row);
                if ($row['item_type'] === 'drug') {
                    $this->deductDrug((int) $data['clinic_id'], $sale->id, (int) $row['drug_id'], (int) $row['base_quantity']);
                } else {
                    $stock = ClinicMedicalProduct::query()->where('clinic_id', $data['clinic_id'])->where('medical_product_id', $row['medical_product_id'])->lockForUpdate()->firstOrFail();
                    if ($stock->quantity < $row['quantity']) {
                        throw ValidationException::withMessages(['cart' => "Insufficient stock for {$row['description']}."]);
                    }
                    $stock->decrement('quantity', $row['quantity']);
                    InventoryTransaction::query()->create(['clinic_id' => $data['clinic_id'], 'medical_product_id' => $row['medical_product_id'], 'sale_id' => $sale->id, 'transaction_type' => 'online_order', 'quantity' => -$row['quantity']]);
                }
                $item->delete();
            }
        });

        return redirect()->route('client.shop.orders')->with('success', 'Your order has been placed.');
    }

    public function orders(): Response
    {
        return Inertia::render('Client/Shop/Orders', ['orders' => auth('patient')->user()->sales()->where('sale_type', 'online_order')->latest()->paginate(10)]);
    }

    public function order(Sale $sale): Response
    {
        abort_unless($sale->patient_id === auth('patient')->id() && $sale->sale_type === 'online_order', 404);

        return Inertia::render('Client/Shop/Order', ['order' => $sale->load('items')]);
    }

    private function cartItems(): Collection
    {
        return auth('patient')->user()->cartItems()->with(['drug', 'drugUnit', 'medicalProduct'])->get();
    }

    private function cartData(PatientCartItem $item): array
    {
        $price = $item->item_type === 'drug'
            ? (float) (ClinicDrug::query()->where('clinic_id', $item->clinic_id)->where('drug_id', $item->drug_id)->value('sale_price_override') ?? $item->drugUnit?->sale_price ?? 0)
            : (float) (ClinicMedicalProduct::query()->where('clinic_id', $item->clinic_id)->where('medical_product_id', $item->medical_product_id)->value('sale_price') ?? 0);

        return ['id' => $item->id, 'clinic_id' => $item->clinic_id, 'item_type' => $item->item_type, 'item_id' => $item->drug_id ?? $item->medical_product_id, 'name' => $item->drug?->name ?? $item->medicalProduct?->name, 'unit' => $item->drugUnit?->unit_name, 'quantity' => $item->quantity, 'unit_price' => $price, 'line_total' => $item->quantity * $price];
    }

    private function checkoutRow(PatientCartItem $item): array
    {
        if ($item->item_type === 'drug') {
            $drug = $item->drug()->where('is_active', true)->firstOrFail();
            $unit = $item->drugUnit()->where('is_active', true)->firstOrFail();
            $price = (float) (ClinicDrug::query()->where('clinic_id', $item->clinic_id)->where('drug_id', $drug->id)->value('sale_price_override') ?? $unit->sale_price);

            return ['item_type' => 'drug', 'drug_id' => $drug->id, 'drug_unit_id' => $unit->id, 'medical_product_id' => null, 'description' => $drug->name.' ('.$unit->unit_name.')', 'quantity' => $item->quantity, 'unit_price' => $price, 'line_total' => $item->quantity * $price, 'base_quantity' => $item->quantity * $unit->conversion_quantity];
        }
        $product = $item->medicalProduct()->where('is_active', true)->firstOrFail();
        $price = (float) ClinicMedicalProduct::query()->where('clinic_id', $item->clinic_id)->where('medical_product_id', $product->id)->value('sale_price');

        return ['item_type' => 'medical_product', 'drug_id' => null, 'drug_unit_id' => null, 'medical_product_id' => $product->id, 'description' => $product->name, 'quantity' => $item->quantity, 'unit_price' => $price, 'line_total' => $item->quantity * $price, 'base_quantity' => $item->quantity];
    }

    private function deductDrug(int $clinicId, int $saleId, int $drugId, int $quantity): void
    {
        $batches = DrugBatch::query()->lockForUpdate()->where('clinic_id', $clinicId)->where('drug_id', $drugId)->where('expiry_date', '>', today())->where('quantity', '>', 0)->orderBy('expiry_date')->orderBy('id')->get();
        if ($batches->sum('quantity') < $quantity) {
            throw ValidationException::withMessages(['cart' => 'Insufficient non-expired drug stock.']);
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
