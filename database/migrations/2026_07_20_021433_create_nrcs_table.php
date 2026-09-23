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
        Schema::create('nrcs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nrc_state_id')->constrained();
            $table->foreignId('nrc_township_id')->constrained();
            $table->foreignId('nrc_type_id')->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nrcs');
    }
};
