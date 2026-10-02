<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $index = 'reviews_clinic_id_doctor_id_patient_id_unique';

        $hasIndex = collect(Schema::getIndexes('reviews'))
            ->contains(fn (array $existingIndex): bool => $existingIndex['name'] === $index);

        if ($hasIndex) {
            Schema::table('reviews', function (Blueprint $table) use ($index): void {
                $table->dropForeign('reviews_clinic_id_foreign');
                $table->dropUnique($index);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table): void {
            $table->unique(['clinic_id', 'doctor_id', 'patient_id']);
            $table->foreign('clinic_id')->references('id')->on('clinics')->onDelete('cascade');
        });
    }
};
