<?php

use App\Http\Controllers\Clinic\ClinicAuthController;
use App\Http\Controllers\Clinic\ClinicBranchController;
use App\Http\Controllers\Clinic\ClinicServiceController;
use App\Http\Controllers\Clinic\DoctorController;
use App\Http\Controllers\Clinic\DoctorScheduleController;
use App\Http\Controllers\Clinic\PatientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Consultation\ConsultationController;
use App\Http\Controllers\MedicalRecords\MedicalRecordController;
use App\Http\Controllers\Pharmacy\PosController;
use App\Http\Controllers\Pharmacy\InventoryController;
use App\Http\Controllers\Pharmacy\PrescriptionController;
use App\Http\Controllers\Reservation\ReservationController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\PaymentReportController;
use App\Http\Controllers\ReportController;

// Route::get('/', function () {
//     return auth()->check()
//         ? redirect()->route('dashboard')
//         : redirect()->route('login');
// })->name('home');



Route::get('/', function () {
    if (auth('admin')->check()) {
        return redirect()->route('admin.dashboard');
    }

    if (auth('clinic')->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('clinic.login');
})->name('home');



require __DIR__ . '/clinic.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/settings.php';
