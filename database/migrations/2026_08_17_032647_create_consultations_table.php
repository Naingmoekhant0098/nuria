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
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_code');
            $table->foreign('appointment_code')->references('appointment_code')->on('reservations')->onDelete('cascade');
            $table->dateTime('date_of_consultation');
            $table->text('diagnosis');
            $table->text('treatment');
            $table->string('upload_prescription')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
