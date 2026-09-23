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

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::post('clinic/login', [ClinicAuthController::class, 'store'])->name('clinic.login.store');

Route::middleware(['auth:clinic', 'verified'])->prefix('clinic')->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Explicitly define the path for services so it becomes /clinic/services
    Route::resource('services', ClinicServiceController::class)->names('clinic.services');

    // Keep or adjust other resources as needed:
    // Route::resource('clinic-branches', ClinicBranchController::class);
    Route::resource('doctor-schedules', DoctorScheduleController::class);
    Route::resource('doctors', DoctorController::class);
    Route::resource('patients', PatientController::class);
    Route::get('payment-methods', [PaymentMethodController::class, 'index'])->name('payment-methods.index');
    Route::put('payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update'])->name('payment-methods.update');
    Route::get('payments', [PaymentReportController::class, 'index'])->name('payments.index');
    Route::get('reports/stock', [ReportController::class, 'stock'])->name('reports.stock');
    Route::get('reports/operations', [ReportController::class, 'operations'])->name('reports.operations');
    Route::resource('reservations', ReservationController::class);
    Route::resource('consultations', ConsultationController::class)
        ->except(['create', 'edit']);
    Route::post(
        '/consultations/{consultation}/medical-record',
        [MedicalRecordController::class, 'store']
    )->name('consultations.medical-record.store');

    Route::resource('medical-records', MedicalRecordController::class)
        ->except(['edit']);
    Route::post('prescriptions', [PrescriptionController::class, 'store'])->name('prescriptions.store');
    Route::get('pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('pos', [PosController::class, 'store'])->name('pos.store');
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::get('pharmacy/drugs', [InventoryController::class, 'drugs'])->name('pharmacy.drugs.index');
    Route::get('pharmacy/stock', [InventoryController::class, 'stock'])->name('pharmacy.stock.index');
    Route::get('pharmacy/sales', [InventoryController::class, 'sales'])->name('pharmacy.sales.index');
});

require __DIR__.'/settings.php';
