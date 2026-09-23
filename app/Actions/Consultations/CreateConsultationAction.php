<?php

namespace App\Actions\Consultations;

use App\Models\Consultation;
use App\Models\ClinicMedicalProduct;
use App\Models\ClinicDrug;
use App\Models\DrugUnit;
use App\Models\Prescription;
use App\Models\Reservation;
use App\Pharmacy\CheckoutSaleAction;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class CreateConsultationAction
{
    /** @param array<string, mixed> $data */
    public function execute(array $data): Consultation
    {
        return DB::transaction(function () use ($data) {

            if (
                isset($data['upload_prescription'])
                && $data['upload_prescription'] instanceof UploadedFile
            ) {
                $data['upload_prescription'] =
                    $data['upload_prescription']
                        ->store(
                            'prescriptions',
                            'public'
                        );
            }

            $items = $data['items'] ?? [];
            $paymentMethod = $data['payment_method'] ?? null;
            unset($data['items']);
            unset($data['payment_method']);
            $consultation = Consultation::create($data);
            if ($items === []) {
                return $consultation;
            }

            $clinicId = auth()->user()->id;
            $reservation = Reservation::query()->where('appointment_code', $consultation->appointment_code)->where('clinic_id', $clinicId)->lockForUpdate()->firstOrFail();
            $prescription = Prescription::create(['consultation_id' => $consultation->id, 'clinic_id' => $clinicId]);
            $additionalTotal = 0;
            $saleItems = [];

            foreach ($items as $item) {
                if ($item['item_type'] === 'drug') {
                    $clinicDrug = ClinicDrug::query()->where('clinic_id', $clinicId)->where('drug_id', $item['drug_id'])->where('is_active', true)->firstOrFail();
                    $unit = DrugUnit::query()->where('drug_id', $item['drug_id'])->where('is_active', true)->findOrFail($item['drug_unit_id']);
                    $unitPrice = $clinicDrug->sale_price_override ?? $unit->sale_price;
                    $lineTotal = $item['quantity'] * $unitPrice;
                    $prescription->items()->create(['item_type' => 'drug', 'drug_id' => $item['drug_id'], 'drug_unit_id' => $unit->id, 'quantity' => $item['quantity'], 'base_quantity' => $item['quantity'] * $unit->conversion_quantity, 'unit_price' => $unitPrice]);
                    $saleItems[] = ['item_type' => 'drug', 'drug_id' => $item['drug_id'], 'drug_unit_id' => $unit->id, 'description' => "{$unit->drug->name} ({$unit->unit_name})", 'quantity' => $item['quantity'], 'base_quantity' => $item['quantity'] * $unit->conversion_quantity, 'unit_price' => $unitPrice, 'line_total' => $lineTotal];
                } else {
                    $product = ClinicMedicalProduct::query()->where('clinic_id', $clinicId)->where('medical_product_id', $item['medical_product_id'])->where('is_active', true)->firstOrFail();
                    $lineTotal = $item['quantity'] * $product->sale_price;
                    $prescription->items()->create(['item_type' => 'medical_product', 'medical_product_id' => $product->medical_product_id, 'quantity' => $item['quantity'], 'base_quantity' => 0, 'unit_price' => $product->sale_price]);
                    $saleItems[] = ['item_type' => 'medical_product', 'medical_product_id' => $product->medical_product_id, 'description' => $product->product->name, 'quantity' => $item['quantity'], 'base_quantity' => 0, 'unit_price' => $product->sale_price, 'line_total' => $lineTotal];
                }
                $additionalTotal += $lineTotal;
            }

            $reservation->increment('amount', $additionalTotal);
            app(CheckoutSaleAction::class)->execute($clinicId, [
                'sale_type' => 'reservation',
                'reservation_id' => $reservation->id,
                'prescription_id' => $prescription->id,
                'items' => $saleItems,
                'discount' => 0,
                'tax' => 0,
                'payment_method' => $paymentMethod,
            ]);

            return $consultation;
        });
    }
}
