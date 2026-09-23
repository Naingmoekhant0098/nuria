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
        Schema::table('prescription_items', function (Blueprint $table) {
            $table->foreignId('medical_product_id')->nullable()->after('drug_unit_id')->constrained()->nullOnDelete();
            $table->string('item_type')->default('drug')->after('prescription_id');
            $table->decimal('unit_price', 12, 2)->default(0)->after('base_quantity');
            $table->foreignId('drug_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prescription_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('medical_product_id');
            $table->dropColumn(['item_type', 'unit_price']);
            $table->foreignId('drug_id')->nullable(false)->change();
        });
    }
};
