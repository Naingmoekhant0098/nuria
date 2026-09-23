<?php

namespace App\Pharmacy;

use App\Models\ClinicDrug;
use App\Models\ClinicMedicalProduct;
use App\Models\DrugBatch;
use App\Models\DrugUnit;
use App\Models\InventoryTransaction;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\Reservation;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutSaleAction
{
    /** @param array<string, mixed> $data */
    public function execute(int $clinicId, array $data): Sale
    {
        return DB::transaction(function () use ($clinicId, $data): Sale {
            $items = collect($data['items']);
            $subtotal = $items->sum(fn (array $item): float => $item['quantity'] * $item['unit_price']);
            $discount = (float) ($data['discount'] ?? 0);
            $tax = (float) ($data['tax'] ?? 0);
            $reservation = null;

            if ($data['sale_type'] === 'reservation') {
                $reservation = Reservation::query()->lockForUpdate()->where('clinic_id', $clinicId)->findOrFail($data['reservation_id']);
                if ($reservation->status !== 'Checked In') {
                    throw ValidationException::withMessages(['reservation_id' => 'Only checked-in reservations can be checked out.']);
                }
            }
            if (isset($data['prescription_id'])) {
                $prescriptionQuery = Prescription::query()->where('clinic_id', $clinicId);

                if ($reservation) {
                    $prescriptionQuery->whereHas(
                        'consultation.reservation',
                        fn ($query) => $query->whereKey($reservation->id)
                    );
                }

                $prescriptionQuery->findOrFail($data['prescription_id']);
            }

            $sale = Sale::create([
                'clinic_id' => $clinicId, 'reservation_id' => $reservation?->id,
                'patient_id' => $reservation?->patient_id ?? ($data['patient_id'] ?? null),
                'prescription_id' => $data['prescription_id'] ?? null, 'sale_type' => $data['sale_type'],
                'subtotal' => $subtotal, 'discount' => $discount, 'tax' => $tax,
                'total' => $subtotal - $discount + $tax, 'payment_method' => $data['payment_method'],
                'payment_status' => 'Paid',
            ]);

            foreach ($items as $item) {
                $baseQuantity = 0;
                if ($item['item_type'] === 'drug') {
                    ClinicDrug::query()->where('clinic_id', $clinicId)->where('drug_id', $item['drug_id'])->where('is_active', true)->firstOrFail();
                    $unit = DrugUnit::query()->where('drug_id', $item['drug_id'])->where('is_active', true)->findOrFail($item['drug_unit_id']);
                    $baseQuantity = $item['quantity'] * $unit->conversion_quantity;
                    $this->deductDrug($clinicId, $sale->id, (int) $item['drug_id'], $baseQuantity);
                }
                if ($item['item_type'] === 'medical_product') {
                    $stock = ClinicMedicalProduct::query()->lockForUpdate()->where('clinic_id', $clinicId)->where('medical_product_id', $item['medical_product_id'])->where('is_active', true)->firstOrFail();
                    if ($stock->quantity < $item['quantity']) {
                        throw ValidationException::withMessages(['items' => "Insufficient stock for {$stock->product->name}."]);
                    }
                    $stock->decrement('quantity', $item['quantity']);
                    InventoryTransaction::create(['clinic_id' => $clinicId, 'medical_product_id' => $stock->medical_product_id, 'sale_id' => $sale->id, 'transaction_type' => 'sale', 'quantity' => -$item['quantity']]);
                }
                $sale->items()->create(array_merge($item, ['base_quantity' => $baseQuantity, 'description' => $item['description'] ?? $item['item_type'], 'line_total' => $item['quantity'] * $item['unit_price']]));
            }
            if ($reservation) {
                Payment::create(['reservation_id' => $reservation->id, 'amount' => $sale->total, 'payment_method' => $data['payment_method'], 'payment_status' => 'Paid']);
                $reservation->update(['status' => 'Checked Out']);
            }

            return $sale->load('items');
        });
    }

    private function deductDrug(int $clinicId, int $saleId, int $drugId, int $quantity): void
    {
        $batches = DrugBatch::query()->lockForUpdate()->where('clinic_id', $clinicId)->where('drug_id', $drugId)->where('expiry_date', '>', today())->where('quantity', '>', 0)->orderBy('expiry_date')->orderBy('id')->get();
        if ($batches->sum('quantity') < $quantity) {
            throw ValidationException::withMessages(['items' => 'Insufficient non-expired drug stock.']);
        }
        foreach ($batches as $batch) {
            $deduction = min($batch->quantity, $quantity);
            $batch->decrement('quantity', $deduction);
            InventoryTransaction::create(['clinic_id' => $clinicId, 'drug_id' => $drugId, 'drug_batch_id' => $batch->id, 'sale_id' => $saleId, 'transaction_type' => 'sale', 'quantity' => -$deduction]);
            $quantity -= $deduction;
            if ($quantity === 0) {
                break;
            }
        }
    }
}
