<!-- <?php

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
        // Schema::create('medical_records', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('patient_id');
        //     $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
        //     $table->string('doctor_id');
        //     $table->foreign('doctor_id')->references('id')->on('doctors')->onDelete('cascade');
        //     $table->string('record_title');
        //     $table->string('file_attachment')->nullable();
        //     $table->text('notes')->nullable();
        //     $table->dateTime('record_date');
        //     $table->timestamps();
        // });

        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->string('patient_id');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');

            $table->string('doctor_id');
            $table->foreign('doctor_id')->references('id')->on('doctors')->onDelete('cascade');

            // Consultation သို့မဟုတ် Reservation နှင့် ချိတ်ဆက်ရန် appointment_code ကို ထည့်ပါ
            $table->string('appointment_code');
            $table->foreign('appointment_code')->references('appointment_code')->on('reservations')->onDelete('cascade');

            $table->string('record_title');
            $table->string('file_attachment')->nullable();
            $table->text('notes')->nullable();
            $table->dateTime('record_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
