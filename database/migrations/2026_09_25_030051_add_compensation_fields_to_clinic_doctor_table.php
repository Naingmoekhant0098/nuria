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
        Schema::table('clinic_doctor', function (Blueprint $table): void {
            $table->string('compensation_type')->nullable()->after('doctor_id');
            $table->decimal('compensation_rate', 12, 2)->nullable()->after('compensation_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clinic_doctor', function (Blueprint $table): void {
            $table->dropColumn(['compensation_type', 'compensation_rate']);
        });
    }
};
