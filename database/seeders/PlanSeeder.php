<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Essential tools for a small clinic.',
                'price' => 0,
                'duration_days' => 30,
                'features' => ['doctors', 'schedules', 'patients', 'services', 'reservations'],
                'limits' => ['doctors' => 3, 'patients' => 500, 'monthly_reservations' => 300],
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'Expanded clinic operations with records, reporting, and finance.',
                'price' => 50000,
                'duration_days' => 30,
                'features' => ['doctors', 'schedules', 'patients', 'services', 'reservations', 'consultations', 'medical_records', 'reports', 'finance'],
                'limits' => ['doctors' => 10, 'patients' => 5000, 'monthly_reservations' => 3000],
            ],
            [
                'name' => 'Complete',
                'slug' => 'complete',
                'description' => 'All clinic features, including pharmacy and online orders.',
                'price' => 100000,
                'duration_days' => 30,
                'features' => array_keys(Plan::FEATURE_CATALOG),
                'limits' => ['doctors' => 30, 'patients' => 20000, 'monthly_reservations' => 15000],
            ],
        ];

        foreach ($plans as $plan) {
            Plan::query()->firstOrCreate(
                ['slug' => $plan['slug']],
                [...$plan, 'is_active' => true],
            );
        }
    }
}
