<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('clinic_services', function (Blueprint $table): void {
            $table->foreignId('service_name_id')->nullable()->after('clinic_id')->constrained('service_names')->nullOnDelete();
        });

        $serviceNames = DB::table('clinic_services')->select('service_name')->whereNotNull('service_name')->distinct()->pluck('service_name');
        foreach ($serviceNames as $serviceName) {
            $serviceNameId = DB::table('service_names')->insertGetId([
                'name' => $serviceName,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('clinic_services')->where('service_name', $serviceName)->update(['service_name_id' => $serviceNameId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clinic_services', function (Blueprint $table): void {
            $table->dropForeign(['service_name_id']);
            $table->dropColumn('service_name_id');
        });
    }
};
