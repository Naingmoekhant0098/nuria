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
        Schema::table('feature_settings', function (Blueprint $table): void {
            $table->boolean('subscription_enabled')->default(true)->after('feature');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feature_settings', function (Blueprint $table): void {
            $table->dropColumn('subscription_enabled');
        });
    }
};
