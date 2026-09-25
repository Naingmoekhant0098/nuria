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
        Schema::table('drugs', function (Blueprint $table): void {
            $table->string('image_path')->nullable()->after('sku');
        });

        Schema::table('medical_products', function (Blueprint $table): void {
            $table->string('image_path')->nullable()->after('sku');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medical_products', function (Blueprint $table): void {
            $table->dropColumn('image_path');
        });

        Schema::table('drugs', function (Blueprint $table): void {
            $table->dropColumn('image_path');
        });
    }
};
