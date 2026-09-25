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
        Schema::table('sales', function (Blueprint $table): void {
            $table->string('payment_image_path')->nullable()->after('transaction_code');
        });

        Schema::table('payments', function (Blueprint $table): void {
            $table->string('payment_image_path')->nullable()->after('transaction_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table): void {
            $table->dropColumn('payment_image_path');
        });

        Schema::table('sales', function (Blueprint $table): void {
            $table->dropColumn('payment_image_path');
        });
    }
};
