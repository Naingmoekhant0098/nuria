<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drug_categories', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->timestamps();
        });
        Schema::create('drug_forms', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->timestamps();
        });
        Schema::create('manufacturers', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->timestamps();
        });
        Schema::create('drugs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('drug_category_id')->constrained()->restrictOnDelete();
            $t->foreignId('drug_form_id')->constrained()->restrictOnDelete();
            $t->foreignId('manufacturer_id')->nullable()->constrained()->nullOnDelete();
            $t->string('name');
            $t->string('strength')->nullable();
            $t->string('sku')->nullable()->unique();
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });
        Schema::create('drug_units', function (Blueprint $t) {
            $t->id();
            $t->foreignId('drug_id')->constrained()->cascadeOnDelete();
            $t->string('unit_name');
            $t->unsignedInteger('conversion_quantity');
            $t->decimal('sale_price', 12, 2);
            $t->boolean('is_default')->default(false);
            $t->boolean('is_active')->default(true);
            $t->timestamps();
            $t->unique(['drug_id', 'unit_name']);
        });
        Schema::create('clinic_drugs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('clinic_id')->constrained()->cascadeOnDelete();
            $t->foreignId('drug_id')->constrained()->cascadeOnDelete();
            $t->boolean('is_active')->default(true);
            $t->decimal('sale_price_override', 12, 2)->nullable();
            $t->timestamps();
            $t->unique(['clinic_id', 'drug_id']);
        });
        Schema::create('medical_product_categories', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->timestamps();
        });
        Schema::create('medical_products', function (Blueprint $t) {
            $t->id();
            $t->foreignId('medical_product_category_id')->constrained()->restrictOnDelete();
            $t->string('name');
            $t->string('sku')->nullable()->unique();
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });
        Schema::create('clinic_medical_products', function (Blueprint $t) {
            $t->id();
            $t->foreignId('clinic_id')->constrained()->cascadeOnDelete();
            $t->foreignId('medical_product_id')->constrained()->cascadeOnDelete();
            $t->unsignedInteger('quantity')->default(0);
            $t->decimal('sale_price', 12, 2);
            $t->boolean('is_active')->default(true);
            $t->timestamps();
            $t->unique(['clinic_id', 'medical_product_id']);
        });
        Schema::create('drug_batches', function (Blueprint $t) {
            $t->id();
            $t->foreignId('clinic_id')->constrained()->cascadeOnDelete();
            $t->foreignId('drug_id')->constrained()->cascadeOnDelete();
            $t->string('batch_number');
            $t->date('expiry_date');
            $t->decimal('purchase_price', 12, 2);
            $t->unsignedInteger('quantity')->default(0);
            $t->timestamps();
            $t->unique(['clinic_id', 'drug_id', 'batch_number']);
            $t->index(['clinic_id', 'drug_id', 'expiry_date']);
        });
        Schema::create('prescriptions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('consultation_id')->constrained()->cascadeOnDelete();
            $t->foreignId('clinic_id')->constrained()->cascadeOnDelete();
            $t->text('notes')->nullable();
            $t->timestamps();
            $t->unique('consultation_id');
        });
        Schema::create('prescription_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('prescription_id')->constrained()->cascadeOnDelete();
            $t->foreignId('drug_id')->constrained()->restrictOnDelete();
            $t->foreignId('drug_unit_id')->nullable()->constrained()->nullOnDelete();
            $t->unsignedInteger('quantity');
            $t->unsignedInteger('base_quantity');
            $t->string('instructions')->nullable();
            $t->timestamps();
        });
        Schema::create('sales', function (Blueprint $t) {
            $t->id();
            $t->foreignId('clinic_id')->constrained()->cascadeOnDelete();
            $t->foreignId('reservation_id')->nullable()->constrained()->nullOnDelete();
            $t->string('patient_id')->nullable();
            $t->foreign('patient_id')->references('id')->on('patients')->nullOnDelete();
            $t->foreignId('prescription_id')->nullable()->constrained()->nullOnDelete();
            $t->string('sale_type');
            $t->decimal('subtotal', 12, 2);
            $t->decimal('discount', 12, 2)->default(0);
            $t->decimal('tax', 12, 2)->default(0);
            $t->decimal('total', 12, 2);
            $t->string('payment_method');
            $t->string('payment_status')->default('Paid');
            $t->timestamps();
        });
        Schema::create('sale_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $t->string('item_type');
            $t->foreignId('drug_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('drug_unit_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('medical_product_id')->nullable()->constrained()->nullOnDelete();
            $t->string('description');
            $t->unsignedInteger('quantity');
            $t->unsignedInteger('base_quantity')->default(0);
            $t->decimal('unit_price', 12, 2);
            $t->decimal('line_total', 12, 2);
            $t->timestamps();
        });
        Schema::create('inventory_transactions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('clinic_id')->constrained()->cascadeOnDelete();
            $t->foreignId('drug_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('medical_product_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('drug_batch_id')->nullable()->constrained('drug_batches')->nullOnDelete();
            $t->foreignId('sale_id')->nullable()->constrained()->nullOnDelete();
            $t->string('transaction_type');
            $t->integer('quantity');
            $t->string('reference')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['inventory_transactions', 'sale_items', 'sales', 'prescription_items', 'prescriptions', 'drug_batches', 'clinic_medical_products', 'medical_products', 'medical_product_categories', 'clinic_drugs', 'drug_units', 'drugs', 'manufacturers', 'drug_forms', 'drug_categories'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
