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
        Schema::create('doctors', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->foreignId('specialization_id')->constrained('specializations')->onDelete('cascade');
            $table->foreignId('user_id')->nullable();
            $table->string('last_name');
            $table->text('complete_address');
            $table->string('email')->unique();
            $table->string('contact_number');
            $table->string('proof_of_identity');
            $table->string('user_name')->unique();
            $table->string('status');
            $table->foreignId('nrc_id')->nullable();
            $table->string('nrc_number')->nullable();
            $table->string('password');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
