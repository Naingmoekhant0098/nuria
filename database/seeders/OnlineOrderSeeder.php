<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OnlineOrderSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        $patients = DB::table('patients')->where('status', 'Active')->orderBy('id')->limit(4)->get(['id', 'complete_address', 'contact_number']);

        if ($patients->isEmpty()) {
            return;
        }

        $pendingStatuses = array_values(array_filter($statuses, fn (string $status): bool => ! DB::table('sales')->where('sale_type', 'online_order')->where('order_note', 'online-order-demo:'.$status)->exists()));
        if ($pendingStatuses === []) {
            return;
        }

        $item = $this->medicalProductOption() ?? $this->drugOption();
        if ($item === null) {
            return;
        }

        foreach (array_slice($pendingStatuses, 0, min(count($pendingStatuses), $item['capacity'])) as $index => $status) {
            $patient = $patients[$index % $patients->count()];
            $marker = 'online-order-demo:'.$status;
            $createdAt = now()->subDays(($index + 1) * 2);

            DB::transaction(function () use ($createdAt, $item, $marker, $patient, $status): void {
                $lineTotal = $item['unit_price'];
                $saleId = DB::table('sales')->insertGetId([
                    'clinic_id' => $item['clinic_id'], 'patient_id' => $patient->id, 'sale_type' => 'online_order',
                    'subtotal' => $lineTotal, 'discount' => 0, 'tax' => 0, 'total' => $lineTotal,
                    'payment_method' => 'Cash on delivery', 'payment_status' => $status === 'Delivered' ? 'Paid' : 'Pending',
                    'order_status' => $status, 'delivery_address' => $patient->complete_address,
                    'delivery_contact' => $patient->contact_number, 'order_note' => $marker,
                    'created_at' => $createdAt, 'updated_at' => $createdAt,
                ]);

                DB::table('sale_items')->insert([
                    'sale_id' => $saleId, 'item_type' => $item['item_type'],
                    'drug_id' => $item['item_type'] === 'drug' ? $item['item_id'] : null,
                    'drug_unit_id' => $item['drug_unit_id'],
                    'medical_product_id' => $item['item_type'] === 'medical_product' ? $item['item_id'] : null,
                    'description' => $item['description'], 'quantity' => 1, 'base_quantity' => $item['base_quantity'],
                    'unit_price' => $item['unit_price'], 'line_total' => $lineTotal,
                    'created_at' => $createdAt, 'updated_at' => $createdAt,
                ]);

                if ($item['item_type'] === 'medical_product') {
                    DB::table('clinic_medical_products')->where('clinic_id', $item['clinic_id'])->where('medical_product_id', $item['item_id'])->decrement('quantity');
                    DB::table('inventory_transactions')->insert([
                        'clinic_id' => $item['clinic_id'], 'medical_product_id' => $item['item_id'], 'sale_id' => $saleId,
                        'transaction_type' => 'online_order', 'quantity' => -1, 'reference' => $marker,
                        'created_at' => $createdAt, 'updated_at' => $createdAt,
                    ]);
                } else {
                    $this->deductDrugStock($item, $saleId, $marker, $createdAt);
                }
            });
        }
    }

    /** @return array{clinic_id: int, item_type: string, item_id: int, drug_unit_id: int|null, base_quantity: int, unit_price: float, description: string, capacity: int}|null */
    private function medicalProductOption(): ?array
    {
        $product = DB::table('clinic_medical_products as stock')
            ->join('medical_products as product', 'product.id', '=', 'stock.medical_product_id')
            ->where('stock.is_active', true)->where('stock.quantity', '>', 0)->where('product.is_active', true)
            ->orderByDesc('stock.quantity')->first(['stock.clinic_id', 'stock.medical_product_id', 'stock.quantity', 'stock.sale_price', 'product.name']);

        if ($product === null) {
            return null;
        }

        return ['clinic_id' => (int) $product->clinic_id, 'item_type' => 'medical_product', 'item_id' => (int) $product->medical_product_id,
            'drug_unit_id' => null, 'base_quantity' => 1, 'unit_price' => (float) $product->sale_price,
            'description' => $product->name, 'capacity' => (int) $product->quantity];
    }

    /** @return array{clinic_id: int, item_type: string, item_id: int, drug_unit_id: int|null, base_quantity: int, unit_price: float, description: string, capacity: int}|null */
    private function drugOption(): ?array
    {
        $drug = DB::table('clinic_drugs as assignment')
            ->join('drugs as drug', 'drug.id', '=', 'assignment.drug_id')
            ->join('drug_units as unit', 'unit.drug_id', '=', 'drug.id')
            ->where('assignment.is_active', true)->where('drug.is_active', true)
            ->where('unit.is_active', true)->where('unit.is_default', true)
            ->orderBy('assignment.clinic_id')->first(['assignment.clinic_id', 'assignment.drug_id', 'assignment.sale_price_override', 'drug.name', 'drug.strength', 'unit.id as drug_unit_id', 'unit.unit_name', 'unit.conversion_quantity', 'unit.sale_price']);

        if ($drug === null || (int) $drug->conversion_quantity < 1) {
            return null;
        }

        $baseStock = (int) DB::table('drug_batches')->where('clinic_id', $drug->clinic_id)->where('drug_id', $drug->drug_id)->whereDate('expiry_date', '>', today())->sum('quantity');
        $capacity = intdiv($baseStock, (int) $drug->conversion_quantity);

        if ($capacity < 1) {
            return null;
        }

        return ['clinic_id' => (int) $drug->clinic_id, 'item_type' => 'drug', 'item_id' => (int) $drug->drug_id,
            'drug_unit_id' => (int) $drug->drug_unit_id, 'base_quantity' => (int) $drug->conversion_quantity,
            'unit_price' => (float) ($drug->sale_price_override ?? $drug->sale_price),
            'description' => trim($drug->name.' '.$drug->strength.' ('.$drug->unit_name.')'), 'capacity' => $capacity];
    }

    /** @param array{clinic_id: int, item_id: int, base_quantity: int} $item */
    private function deductDrugStock(array $item, int $saleId, string $marker, mixed $createdAt): void
    {
        $remainingQuantity = $item['base_quantity'];
        $batches = DB::table('drug_batches')->where('clinic_id', $item['clinic_id'])->where('drug_id', $item['item_id'])
            ->whereDate('expiry_date', '>', today())->where('quantity', '>', 0)->orderBy('expiry_date')->orderBy('id')->lockForUpdate()->get();

        if ($batches->sum('quantity') < $remainingQuantity) {
            throw new \RuntimeException('Insufficient non-expired drug stock to seed online orders.');
        }

        foreach ($batches as $batch) {
            $deduction = min((int) $batch->quantity, $remainingQuantity);
            DB::table('drug_batches')->where('id', $batch->id)->decrement('quantity', $deduction);
            DB::table('inventory_transactions')->insert([
                'clinic_id' => $item['clinic_id'], 'drug_id' => $item['item_id'], 'drug_batch_id' => $batch->id,
                'sale_id' => $saleId, 'transaction_type' => 'online_order', 'quantity' => -$deduction,
                'reference' => $marker, 'created_at' => $createdAt, 'updated_at' => $createdAt,
            ]);
            $remainingQuantity -= $deduction;

            if ($remainingQuantity === 0) {
                break;
            }
        }
    }
}
