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
        foreach (['drugs', 'medical_products'] as $catalogTable) {
            if (Schema::hasTable($catalogTable) && ! Schema::hasColumn($catalogTable, 'image_path')) {
                Schema::table($catalogTable, function (Blueprint $table): void {
                    $table->string('image_path')->nullable()->after('sku');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Keep repaired columns available to the original catalog migration.
    }
};
