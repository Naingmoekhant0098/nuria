<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patient_clinic', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->cascadeOnDelete();
            $table->string('patient_id');
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['clinic_id', 'patient_id']);
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('INSERT IGNORE INTO patient_clinic (clinic_id, patient_id, created_at, updated_at) SELECT DISTINCT clinic_id, patient_id, NOW(), NOW() FROM reservations');

            return;
        }

        DB::table('reservations')->select('clinic_id', 'patient_id')->distinct()->orderBy('clinic_id')->each(function (object $reservation): void {
            DB::table('patient_clinic')->insertOrIgnore([
                'clinic_id' => $reservation->clinic_id,
                'patient_id' => $reservation->patient_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_clinic');
    }
};
