<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Cash', 'Cash on Delivery', 'KBZPay', 'Wave Money', 'Other'] as $name) {
            PaymentMethod::firstOrCreate(['name' => $name], ['status' => 'Active']);
        }
    }
}
