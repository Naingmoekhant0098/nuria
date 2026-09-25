<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\ClinicDrug;
use App\Models\ClinicMedicalProduct;
use App\Models\Doctor;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\DrugCategory;
use App\Models\DrugForm;
use App\Models\DrugUnit;
use App\Models\InventoryTransaction;
use App\Models\Manufacturer;
use App\Models\MedicalProduct;
use App\Models\MedicalProductCategory;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PrescriptionItem;
use App\Models\Reservation;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function drugs(): Response
    {
        return Inertia::render('admin/inventory/drugs', [
            'drugs' => Drug::query()
                ->with(['category', 'form', 'manufacturer', 'units'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function medicalProducts(): Response
    {
        return Inertia::render('admin/inventory/medical-products', [
            'medicalProducts' => MedicalProduct::query()
                ->with('category')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function storeDrug(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->drugRules());
        $imagePath = $request->file('image')?->store('catalog/drugs', 'public');

        DB::transaction(function () use ($validated, $imagePath): void {
            $drug = Drug::query()->create([...$this->drugAttributes($validated), 'image_path' => $imagePath]);
            $this->saveDefaultUnit($drug, $validated);
        });

        return redirect()->route('admin.inventory.drugs')->with('success', 'Drug created.');
    }

    public function updateDrug(Request $request, Drug $drug): RedirectResponse
    {
        $validated = $request->validate($this->drugRules($drug));
        $oldImagePath = $drug->image_path;
        $newImagePath = $request->file('image')?->store('catalog/drugs', 'public');
        $removeImage = ($validated['remove_image'] ?? false) && $newImagePath === null;

        DB::transaction(function () use ($drug, $validated, $newImagePath, $removeImage): void {
            $attributes = $this->drugAttributes($validated);
            if ($newImagePath !== null) {
                $attributes['image_path'] = $newImagePath;
            } elseif ($removeImage) {
                $attributes['image_path'] = null;
            }
            $drug->update($attributes);
            DrugUnit::query()->where('drug_id', $drug->id)->update(['is_active' => $validated['is_active']]);
            ClinicDrug::query()->where('drug_id', $drug->id)->update(['is_active' => $validated['is_active']]);
            $this->saveDefaultUnit($drug, $validated);
        });
        if (($newImagePath !== null || $removeImage) && $oldImagePath !== null) {
            Storage::disk('public')->delete($oldImagePath);
        }

        return redirect()->route('admin.inventory.drugs')->with('success', 'Drug updated.');
    }

    public function destroyDrug(Drug $drug): RedirectResponse
    {
        $isInUse = ClinicDrug::query()->where('drug_id', $drug->id)->exists()
            || DrugBatch::query()->where('drug_id', $drug->id)->exists()
            || PrescriptionItem::query()->where('drug_id', $drug->id)->exists()
            || SaleItem::query()->where('drug_id', $drug->id)->exists()
            || InventoryTransaction::query()->where('drug_id', $drug->id)->exists();

        if ($isInUse) {
            return back()->withErrors([
                'drug' => 'This drug has stock or clinical history and cannot be deleted.',
            ]);
        }

        $drug->delete();
        if ($drug->image_path !== null) {
            Storage::disk('public')->delete($drug->image_path);
        }

        return redirect()->route('admin.inventory.drugs')->with('success', 'Drug deleted.');
    }

    public function storeMedicalProduct(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->medicalProductRules());
        $category = MedicalProductCategory::query()->firstOrCreate(['name' => $validated['category']]);
        $imagePath = $request->file('image')?->store('catalog/medical-products', 'public');

        MedicalProduct::query()->create([
            'medical_product_category_id' => $category->id,
            'name' => $validated['name'],
            'sku' => $validated['sku'] ?? null,
            'image_path' => $imagePath,
            'is_active' => $validated['is_active'],
        ]);

        return redirect()->route('admin.inventory.medical-products')->with('success', 'Medical product created.');
    }

    public function updateMedicalProduct(Request $request, MedicalProduct $medicalProduct): RedirectResponse
    {
        $validated = $request->validate($this->medicalProductRules($medicalProduct));
        $category = MedicalProductCategory::query()->firstOrCreate(['name' => $validated['category']]);
        $oldImagePath = $medicalProduct->image_path;
        $newImagePath = $request->file('image')?->store('catalog/medical-products', 'public');
        $removeImage = ($validated['remove_image'] ?? false) && $newImagePath === null;

        $attributes = [
            'medical_product_category_id' => $category->id,
            'name' => $validated['name'],
            'sku' => $validated['sku'] ?? null,
            'is_active' => $validated['is_active'],
        ];
        if ($newImagePath !== null) {
            $attributes['image_path'] = $newImagePath;
        } elseif ($removeImage) {
            $attributes['image_path'] = null;
        }
        $medicalProduct->update($attributes);
        if (($newImagePath !== null || $removeImage) && $oldImagePath !== null) {
            Storage::disk('public')->delete($oldImagePath);
        }
        ClinicMedicalProduct::query()
            ->where('medical_product_id', $medicalProduct->id)
            ->update(['is_active' => $validated['is_active']]);

        return redirect()->route('admin.inventory.medical-products')->with('success', 'Medical product updated.');
    }

    public function destroyMedicalProduct(MedicalProduct $medicalProduct): RedirectResponse
    {
        $isInUse = ClinicMedicalProduct::query()
            ->where('medical_product_id', $medicalProduct->id)
            ->exists()
            || PrescriptionItem::query()->where('medical_product_id', $medicalProduct->id)->exists()
            || SaleItem::query()->where('medical_product_id', $medicalProduct->id)->exists()
            || InventoryTransaction::query()->where('medical_product_id', $medicalProduct->id)->exists();

        if ($isInUse) {
            return back()->withErrors([
                'medical_product' => 'This product has stock or clinical history and cannot be deleted.',
            ]);
        }

        $medicalProduct->delete();
        if ($medicalProduct->image_path !== null) {
            Storage::disk('public')->delete($medicalProduct->image_path);
        }

        return redirect()->route('admin.inventory.medical-products')->with('success', 'Medical product deleted.');
    }

    public function stock(): Response
    {
        return Inertia::render('admin/inventory/stock', [
            'clinics' => Clinic::query()->orderBy('clinic_name')->get(['id', 'clinic_name']),
            'drugs' => Drug::query()->where('is_active', true)->with('units')->orderBy('name')->get(),
            'medicalProducts' => MedicalProduct::query()->where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function allocateStock(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'clinic_id' => ['required', 'integer', 'exists:clinics,id'],
            'stock_type' => ['required', 'in:drug,medical_product'],
            'item_id' => ['required', 'integer'],
            'quantity' => ['required', 'integer', 'min:1'],
            'reference' => ['nullable', 'string', 'max:255'],
        ]);

        $table = $validated['stock_type'] === 'drug' ? 'drugs' : 'medical_products';
        $request->validate([
            'item_id' => ['exists:'.$table.',id'],
        ]);

        if ($validated['stock_type'] === 'drug') {
            $drugData = $request->validate([
                'batch_number' => ['required', 'string', 'max:255'],
                'expiry_date' => ['required', 'date', 'after_or_equal:today'],
                'purchase_price' => ['required', 'numeric', 'min:0'],
            ]);

            $this->allocateDrugStock($validated, $drugData);
        } else {
            $productData = $request->validate([
                'sale_price' => ['required', 'numeric', 'min:0'],
            ]);

            $this->allocateMedicalProductStock($validated, $productData);
        }

        return redirect()->route('admin.inventory.stock')->with('success', 'Stock assigned to clinic.');
    }

    public function reports(Request $request): Response
    {
        $filters = $this->dateFilters($request);
        $summary = InventoryTransaction::query()
            ->when($filters['start_date'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['end_date'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '<=', $date))
            ->selectRaw("CASE WHEN drug_id IS NOT NULL THEN 'drug' ELSE 'medical_product' END AS item_type, SUM(quantity) AS net_quantity")
            ->groupByRaw("CASE WHEN drug_id IS NOT NULL THEN 'drug' ELSE 'medical_product' END")
            ->get();

        return Inertia::render('admin/inventory/reports', [
            'filters' => $filters,
            'summary' => $summary,
        ]);
    }

    public function drugStockReport(Request $request): Response
    {
        $filters = $request->validate([
            'clinic_id' => ['nullable', 'integer', 'exists:clinics,id'],
            'expiry_from' => ['nullable', 'date'],
            'expiry_to' => ['nullable', 'date', 'after_or_equal:expiry_from'],
        ]);
        $batchQuery = DrugBatch::query()
            ->with(['clinic:id,clinic_name', 'drug:id,name,strength'])
            ->when($filters['clinic_id'] ?? null, fn ($query, int $clinicId) => $query->where('clinic_id', $clinicId))
            ->when($filters['expiry_from'] ?? null, fn ($query, string $date) => $query->whereDate('expiry_date', '>=', $date))
            ->when($filters['expiry_to'] ?? null, fn ($query, string $date) => $query->whereDate('expiry_date', '<=', $date))
            ->orderBy('expiry_date');
        $drugUnitTotal = (clone $batchQuery)->sum('quantity');
        $batches = $batchQuery->paginate(30)
            ->withQueryString();

        return Inertia::render('admin/inventory/reports/drugs', [
            'filters' => $filters,
            'clinics' => Clinic::query()->orderBy('clinic_name')->get(['id', 'clinic_name']),
            'drugUnitTotal' => $drugUnitTotal,
            'batches' => $batches,
        ]);
    }

    public function medicalProductStockReport(Request $request): Response
    {
        $filters = $request->validate([
            'clinic_id' => ['nullable', 'integer', 'exists:clinics,id'],
            'updated_from' => ['nullable', 'date'],
            'updated_to' => ['nullable', 'date', 'after_or_equal:updated_from'],
        ]);
        $medicalStockQuery = ClinicMedicalProduct::query()
            ->with(['clinic:id,clinic_name', 'product:id,name'])
            ->when($filters['clinic_id'] ?? null, fn ($query, int $clinicId) => $query->where('clinic_id', $clinicId))
            ->when($filters['updated_from'] ?? null, fn ($query, string $date) => $query->whereDate('updated_at', '>=', $date))
            ->when($filters['updated_to'] ?? null, fn ($query, string $date) => $query->whereDate('updated_at', '<=', $date))
            ->orderBy('updated_at', 'desc');
        $medicalProductUnitTotal = (clone $medicalStockQuery)->sum('quantity');
        $medicalStock = $medicalStockQuery->paginate(30)
            ->withQueryString();

        return Inertia::render('admin/inventory/reports/medical-products', [
            'filters' => $filters,
            'clinics' => Clinic::query()->orderBy('clinic_name')->get(['id', 'clinic_name']),
            'medicalProductUnitTotal' => $medicalProductUnitTotal,
            'medicalStock' => $medicalStock,
        ]);
    }

    public function inventoryMovementReport(Request $request): Response
    {
        $filters = $request->validate([
            'clinic_id' => ['nullable', 'integer', 'exists:clinics,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'item_type' => ['nullable', 'in:drug,medical_product'],
        ]);
        $transactions = InventoryTransaction::query()
            ->with(['clinic:id,clinic_name', 'drug:id,name', 'medicalProduct:id,name'])
            ->when($filters['clinic_id'] ?? null, fn ($query, int $clinicId) => $query->where('clinic_id', $clinicId))
            ->when($filters['start_date'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['end_date'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '<=', $date))
            ->when($filters['item_type'] ?? null, function ($query, string $itemType): void {
                $query->whereNotNull($itemType === 'drug' ? 'drug_id' : 'medical_product_id');
            })
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('admin/inventory/reports/movements', [
            'filters' => $filters,
            'clinics' => Clinic::query()->orderBy('clinic_name')->get(['id', 'clinic_name']),
            'transactions' => $transactions,
        ]);
    }

    public function reservationReport(Request $request): Response
    {
        $filters = $request->validate([
            'clinic_id' => ['nullable', 'integer', 'exists:clinics,id'],
            'doctor_id' => ['nullable', 'string', 'exists:doctors,id'],
            'status' => ['nullable', 'string', 'max:100'],
            'search' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);
        $reservations = Reservation::query()
            ->with(['clinic:id,clinic_name', 'doctor:id,first_name,last_name', 'patient:id,first_name,last_name', 'service:id,service_name'])
            ->when($filters['clinic_id'] ?? null, fn ($query, int $id) => $query->where('clinic_id', $id))
            ->when($filters['doctor_id'] ?? null, fn ($query, string $id) => $query->where('doctor_id', $id))
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query->filter(['search' => $search]))
            ->when($filters['start_date'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['end_date'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '<=', $date))
            ->latest()
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('admin/inventory/reports/reservations', [
            'filters' => $filters,
            'clinics' => Clinic::query()->orderBy('clinic_name')->get(['id', 'clinic_name']),
            'doctors' => Doctor::query()->orderBy('first_name')->get(['id', 'first_name', 'last_name']),
            'reservations' => $reservations,
        ]);
    }

    public function doctorReport(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:100'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);
        $doctors = Doctor::query()->with(['specialization:id,name', 'clinics:id,clinic_name'])
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query->filter(['search' => $search]))
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['start_date'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['end_date'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '<=', $date))
            ->latest()->paginate(30)->withQueryString();

        return Inertia::render('admin/inventory/reports/doctors', ['filters' => $filters, 'doctors' => $doctors]);
    }

    public function patientReport(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:100'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);
        $patients = Patient::query()->with('clinics:id,clinic_name')
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query->filter(['search' => $search]))
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['start_date'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['end_date'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '<=', $date))
            ->latest()->paginate(30)->withQueryString();

        return Inertia::render('admin/inventory/reports/patients', ['filters' => $filters, 'patients' => $patients]);
    }

    public function reservationChargesReport(Request $request): Response
    {
        return $this->financialReport($request, 'reservation_charges');
    }

    public function reservationPaymentsReport(Request $request): Response
    {
        return $this->financialReport($request, 'reservation_payments');
    }

    public function prescriptionSalesReport(Request $request): Response
    {
        return $this->financialReport($request, 'prescription_sales');
    }

    private function financialReport(Request $request, string $reportType): Response
    {
        $filters = $request->validate([
            'clinic_id' => ['nullable', 'integer', 'exists:clinics,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);
        [$title, $amountColumn, $query] = match ($reportType) {
            'reservation_charges' => [
                'Reservation charges',
                'amount',
                Reservation::query()->with(['clinic:id,clinic_name', 'patient:id,first_name,last_name'])
                    ->when($filters['clinic_id'] ?? null, fn ($query, int $id) => $query->where('clinic_id', $id)),
            ],
            'reservation_payments' => [
                'Recorded reservation payments',
                'amount',
                Payment::query()->with(['reservation.clinic:id,clinic_name', 'reservation.patient:id,first_name,last_name'])
                    ->when($filters['clinic_id'] ?? null, fn ($query, int $id) => $query->whereHas('reservation', fn ($reservations) => $reservations->where('clinic_id', $id))),
            ],
            default => [
                'Prescription sales',
                'total',
                Sale::query()->whereNotNull('prescription_id')
                    ->when($filters['clinic_id'] ?? null, fn ($query, int $id) => $query->where('clinic_id', $id)),
            ],
        };
        $query->when($filters['start_date'] ?? null, fn ($builder, string $date) => $builder->whereDate('created_at', '>=', $date))
            ->when($filters['end_date'] ?? null, fn ($builder, string $date) => $builder->whereDate('created_at', '<=', $date));

        return Inertia::render('admin/inventory/reports/revenue', [
            'reportType' => $reportType,
            'title' => $title,
            'filters' => $filters,
            'clinics' => Clinic::query()->orderBy('clinic_name')->get(['id', 'clinic_name']),
            'total' => (clone $query)->sum($amountColumn),
            'rows' => $query->latest()->paginate(30)->withQueryString(),
        ]);
    }

    /** @return array{start_date?: string|null, end_date?: string|null} */
    private function dateFilters(Request $request): array
    {
        return $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);
    }

    /** @return array<string, array<int, mixed>> */
    private function drugRules(?Drug $drug = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'form' => ['required', 'string', 'max:255'],
            'manufacturer' => ['nullable', 'string', 'max:255'],
            'strength' => ['nullable', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('drugs', 'sku')->ignore($drug?->id)],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_image' => ['sometimes', 'boolean'],
            'unit_name' => ['required', 'string', 'max:100'],
            'conversion_quantity' => ['required', 'integer', 'min:1'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /** @return array<string, array<int, mixed>> */
    private function medicalProductRules(?MedicalProduct $medicalProduct = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('medical_products', 'sku')->ignore($medicalProduct?->id)],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_image' => ['sometimes', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /** @param array<string, mixed> $validated
     * @return array<string, mixed>
     */
    private function drugAttributes(array $validated): array
    {
        $category = DrugCategory::query()->firstOrCreate(['name' => $validated['category']]);
        $form = DrugForm::query()->firstOrCreate(['name' => $validated['form']]);
        $manufacturer = filled($validated['manufacturer'] ?? null)
            ? Manufacturer::query()->firstOrCreate(['name' => $validated['manufacturer']])
            : null;

        return [
            'drug_category_id' => $category->id,
            'drug_form_id' => $form->id,
            'manufacturer_id' => $manufacturer?->id,
            'name' => $validated['name'],
            'strength' => $validated['strength'] ?? null,
            'sku' => $validated['sku'] ?? null,
            'is_active' => $validated['is_active'],
        ];
    }

    /** @param array<string, mixed> $validated */
    private function saveDefaultUnit(Drug $drug, array $validated): void
    {
        $drug->units()->update(['is_default' => false]);
        $drug->units()->updateOrCreate(
            ['unit_name' => $validated['unit_name']],
            [
                'conversion_quantity' => $validated['conversion_quantity'],
                'sale_price' => $validated['sale_price'],
                'is_default' => true,
                'is_active' => $validated['is_active'],
            ],
        );
    }

    /** @param array<string, mixed> $stock
     * @param  array<string, mixed>  $details
     */
    private function allocateDrugStock(array $stock, array $details): void
    {
        DB::transaction(function () use ($stock, $details): void {
            $drug = Drug::query()->where('is_active', true)->findOrFail($stock['item_id']);
            $batch = DrugBatch::query()
                ->where('clinic_id', $stock['clinic_id'])
                ->where('drug_id', $drug->id)
                ->where('batch_number', $details['batch_number'])
                ->lockForUpdate()
                ->first();

            if ($batch) {
                $batch->increment('quantity', $stock['quantity']);
                $batch->update(['purchase_price' => $details['purchase_price'], 'expiry_date' => $details['expiry_date']]);
            } else {
                $batch = DrugBatch::query()->create([
                    'clinic_id' => $stock['clinic_id'],
                    'drug_id' => $drug->id,
                    'batch_number' => $details['batch_number'],
                    'expiry_date' => $details['expiry_date'],
                    'purchase_price' => $details['purchase_price'],
                    'quantity' => $stock['quantity'],
                ]);
            }

            ClinicDrug::query()->firstOrCreate(
                ['clinic_id' => $stock['clinic_id'], 'drug_id' => $drug->id],
                ['is_active' => true],
            )->update(['is_active' => true]);

            InventoryTransaction::query()->create([
                'clinic_id' => $stock['clinic_id'],
                'drug_id' => $drug->id,
                'drug_batch_id' => $batch->id,
                'transaction_type' => 'admin_allocation',
                'quantity' => $stock['quantity'],
                'reference' => $stock['reference'] ?? null,
            ]);
        });
    }

    /** @param array<string, mixed> $stock
     * @param  array<string, mixed>  $details
     */
    private function allocateMedicalProductStock(array $stock, array $details): void
    {
        DB::transaction(function () use ($stock, $details): void {
            $product = MedicalProduct::query()->where('is_active', true)->findOrFail($stock['item_id']);
            $clinicStock = ClinicMedicalProduct::query()
                ->where('clinic_id', $stock['clinic_id'])
                ->where('medical_product_id', $product->id)
                ->lockForUpdate()
                ->first();

            if ($clinicStock) {
                $clinicStock->increment('quantity', $stock['quantity']);
                $clinicStock->update(['sale_price' => $details['sale_price'], 'is_active' => true]);
            } else {
                $clinicStock = ClinicMedicalProduct::query()->create([
                    'clinic_id' => $stock['clinic_id'],
                    'medical_product_id' => $product->id,
                    'quantity' => $stock['quantity'],
                    'sale_price' => $details['sale_price'],
                    'is_active' => true,
                ]);
            }

            InventoryTransaction::query()->create([
                'clinic_id' => $stock['clinic_id'],
                'medical_product_id' => $product->id,
                'transaction_type' => 'admin_allocation',
                'quantity' => $stock['quantity'],
                'reference' => $stock['reference'] ?? null,
            ]);
        });
    }
}
