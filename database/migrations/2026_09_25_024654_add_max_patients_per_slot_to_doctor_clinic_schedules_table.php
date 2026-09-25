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
        Schema::table('doctor_clinic_schedules', function (Blueprint $table): void {
            $table->unsignedSmallInteger('max_patients_per_slot')->default(1)->after('end_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctor_clinic_schedules', function (Blueprint $table): void {
            $table->dropColumn('max_patients_per_slot');
        });
    }
};
