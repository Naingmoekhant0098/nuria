<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\ClinicDrug;
use App\Models\ClinicMedicalProduct;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\DrugCategory;
use App\Models\DrugForm;
use App\Models\DrugUnit;
use App\Models\Manufacturer;
use App\Models\MedicalProduct;
use App\Models\MedicalProductCategory;
use Illuminate\Database\Seeder;

class PharmacyInventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $drugCategory = DrugCategory::firstOrCreate(['name' => 'General Medicine']);
        $tabletForm = DrugForm::firstOrCreate(['name' => 'Tablet']);
        $manufacturer = Manufacturer::firstOrCreate(['name' => 'Clinic Pharmacy']);
        $productCategory = MedicalProductCategory::firstOrCreate(['name' => 'Clinical Supplies']);

        $drugImages = [
            'Paracetamol' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
            'Amoxicillin' => 'https://images.unsplash.com/photo-1550572017-edd951aa8ca9?auto=format&fit=crop&w=800&q=80',
            'Cetirizine' => 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80',
        ];

        $productImages = [
            'Bandage' => 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
            'Surgical Gloves' => 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80',
            'Syringe' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        ];
        $localImage = '/images/healthcare-demo.jpg';
        $drugImages = array_fill_keys(array_keys($drugImages), $localImage);
        $productImages = array_fill_keys(array_keys($productImages), $localImage);

        $drugs = collect([
            ['name' => 'Paracetamol', 'strength' => '500mg', 'sale_price' => 150, 'purchase_price' => 80],
            ['name' => 'Amoxicillin', 'strength' => '500mg', 'sale_price' => 350, 'purchase_price' => 220],
            ['name' => 'Cetirizine', 'strength' => '10mg', 'sale_price' => 200, 'purchase_price' => 120],
        ])->map(function (array $item) use ($drugCategory, $tabletForm, $manufacturer): array {
            $drug = Drug::firstOrCreate(
                ['name' => $item['name'], 'strength' => $item['strength']],
                ['drug_category_id' => $drugCategory->id, 'drug_form_id' => $tabletForm->id, 'manufacturer_id' => $manufacturer->id, 'image_path' => $drugImages[$item['name']], 'is_active' => true]
            );
            if ($drug->image_path === null || str_starts_with($drug->image_path, 'https://images.unsplash.com/')) {
                $drug->update(['image_path' => $drugImages[$item['name']]]);
            }

            $unit = DrugUnit::firstOrCreate(
                ['drug_id' => $drug->id, 'unit_name' => 'Tablet'],
                ['conversion_quantity' => 1, 'sale_price' => $item['sale_price'], 'is_default' => true, 'is_active' => true]
            );

            return ['drug' => $drug, 'unit' => $unit, 'purchase_price' => $item['purchase_price']];
        });

        $products = collect([
            ['name' => 'Bandage', 'sale_price' => 500],
            ['name' => 'Surgical Gloves', 'sale_price' => 300],
            ['name' => 'Syringe', 'sale_price' => 250],
        ])->map(function (array $item) use ($productCategory, $productImages): array {
            $product = MedicalProduct::firstOrCreate(
                ['name' => $item['name']],
                ['medical_product_category_id' => $productCategory->id, 'image_path' => $productImages[$item['name']], 'is_active' => true]
            );

            if ($product->image_path === null || str_starts_with($product->image_path, 'https://images.unsplash.com/')) {
                $product->update(['image_path' => $productImages[$item['name']]]);
            }

            return ['product' => $product, 'sale_price' => $item['sale_price']];
        });

        Clinic::query()->each(function (Clinic $clinic) use ($drugs, $products): void {
            foreach ($drugs as $item) {
                ClinicDrug::firstOrCreate(
                    ['clinic_id' => $clinic->id, 'drug_id' => $item['drug']->id],
                    ['is_active' => true]
                );

                DrugBatch::firstOrCreate(
                    ['clinic_id' => $clinic->id, 'drug_id' => $item['drug']->id, 'batch_number' => "SEED-{$clinic->id}-{$item['drug']->id}"],
                    ['expiry_date' => today()->addYear(), 'purchase_price' => $item['purchase_price'], 'quantity' => 100]
                );
            }

            foreach ($products as $item) {
                ClinicMedicalProduct::firstOrCreate(
                    ['clinic_id' => $clinic->id, 'medical_product_id' => $item['product']->id],
                    ['quantity' => 100, 'sale_price' => $item['sale_price'], 'is_active' => true]
                );
            }
        });
    }
}
