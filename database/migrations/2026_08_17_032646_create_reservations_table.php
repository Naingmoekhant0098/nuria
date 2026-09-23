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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_code')->unique();

            $table->string('patient_id');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');

            $table->string('doctor_id');
            $table->foreign('doctor_id')->references('id')->on('doctors')->onDelete('cascade');

            $table->foreignId('clinic_id')->constrained('clinics')->onDelete('cascade');
            $table->foreignId('service_id')->constrained('clinic_services')->onDelete('cascade');

            $table->foreignId('schedule_id')->constrained('doctor_clinic_schedules')->onDelete('cascade');

            $table->string('appointment_type');
            $table->string('status');
            $table->text('remarks')->nullable();
            $table->decimal('amount', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
