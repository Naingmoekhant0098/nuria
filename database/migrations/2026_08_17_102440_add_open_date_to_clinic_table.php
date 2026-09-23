<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clinics', function (Blueprint $table) {
            $table->time('open_time')->nullable()->after('clinic_name');
            $table->time('close_time')->nullable()->after('open_time');
            $table->string('password');

        });
    }

    public function down(): void
    {
        Schema::table('clinics', function (Blueprint $table) {
            $table->dropColumn([
                'open_time',
                'close_time',
            ]);
        });
    }
};
