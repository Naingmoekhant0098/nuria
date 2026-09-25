<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_cart_items', function (Blueprint $table): void {
            $table->id();
            $table->string('patient_id');
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
            $table->foreignId('clinic_id')->constrained()->cascadeOnDelete();
            $table->string('item_type');
            $table->foreignId('drug_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('drug_unit_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('medical_product_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity');
            $table->timestamps();
            $table->index(['patient_id', 'clinic_id']);
        });

        Schema::table('sales', function (Blueprint $table): void {
            $table->string('order_status')->nullable()->after('payment_status');
            $table->text('delivery_address')->nullable()->after('order_status');
            $table->string('delivery_contact')->nullable()->after('delivery_address');
            $table->text('order_note')->nullable()->after('delivery_contact');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table): void {
            $table->dropColumn(['order_status', 'delivery_address', 'delivery_contact', 'order_note']);
        });
        Schema::dropIfExists('patient_cart_items');
    }
};
