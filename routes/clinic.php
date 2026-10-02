<?php

use App\Http\Controllers\Clinic\ClinicAuthController;
use App\Http\Controllers\Clinic\ClinicServiceController;
use App\Http\Controllers\Clinic\DoctorController;
use App\Http\Controllers\Clinic\DoctorScheduleController;
use App\Http\Controllers\Clinic\OnlineOrderController;
use App\Http\Controllers\Clinic\PatientController;
use App\Http\Controllers\Clinic\PlanController;
use App\Http\Controllers\Clinic\ServiceNameController;
use App\Http\Controllers\Consultation\ConsultationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MedicalRecords\MedicalRecordController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\PaymentReportController;
use App\Http\Controllers\Pharmacy\InventoryController;
use App\Http\Controllers\Pharmacy\PosController;
use App\Http\Controllers\Pharmacy\PrescriptionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Reservation\ReservationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Clinic Authentication
|--------------------------------------------------------------------------
*/

Route::prefix('clinic')
    ->middleware('guest:clinic')
    ->group(function () {

        // Clinic Login Page
        Route::get('/login', [ClinicAuthController::class, 'create'])
            ->name('clinic.login');

        // Clinic Login
        Route::post('/login', [ClinicAuthController::class, 'store'])
            ->name('clinic.login.store');
    });

// Clinic Logout
Route::post('/clinic/logout', [ClinicAuthController::class, 'destroy'])
    ->middleware('auth:clinic')
    ->name('clinic.logout');

/*
|--------------------------------------------------------------------------
| Clinic Application
|--------------------------------------------------------------------------
*/

Route::prefix('clinic')
    ->middleware(['auth:clinic', 'verified', 'clinic.subscription'])
    ->group(function () {

        Route::get('/plans', [PlanController::class, 'index'])
            ->name('clinic.plans.index');
        Route::post('/plans/{plan}/subscribe', [PlanController::class, 'subscribe'])
            ->name('clinic.plans.subscribe');
        Route::get('/subscription', [PlanController::class, 'index'])
            ->name('clinic.subscription.show');

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get('/dashboard', DashboardController::class)
            ->name('dashboard');

        /*
        |--------------------------------------------------------------------------
        | Services
        |--------------------------------------------------------------------------
        */

        Route::resource('services', ClinicServiceController::class)
            ->names('clinic.services')
            ->middleware('clinic.feature:services');

        Route::get('/service-images', [ClinicServiceController::class, 'images'])
            ->name('clinic.service-images.index')
            ->middleware('clinic.feature:services');
        Route::post('/service-images', [ClinicServiceController::class, 'storeImage'])
            ->name('clinic.service-images.store')
            ->middleware('clinic.feature:services');
        Route::delete('/service-images/{service}', [ClinicServiceController::class, 'destroyImage'])
            ->name('clinic.service-images.destroy')
            ->middleware('clinic.feature:services');

        Route::resource('service-names', ServiceNameController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('clinic.service-names')
            ->middleware('clinic.feature:services');

        /*
        |--------------------------------------------------------------------------
        | Doctors
        |--------------------------------------------------------------------------
        */

        Route::resource('doctors', DoctorController::class)
            ->middleware('clinic.feature:doctors');

        /*
        |--------------------------------------------------------------------------
        | Doctor Schedules
        |--------------------------------------------------------------------------
        */

        Route::resource('doctor-schedules', DoctorScheduleController::class)
            ->middleware('clinic.feature:schedules');

        /*
        |--------------------------------------------------------------------------
        | Patients
        |--------------------------------------------------------------------------
        */

        Route::resource('patients', PatientController::class)
            ->middleware('clinic.feature:patients');

        Route::get('/orders', [OnlineOrderController::class, 'index'])
            ->name('orders.index')
            ->middleware('clinic.feature:online_orders');
        Route::get('/orders/report.csv', [OnlineOrderController::class, 'export'])
            ->name('orders.report')
            ->middleware('clinic.feature:online_orders');
        Route::patch('/orders/{sale}', [OnlineOrderController::class, 'update'])
            ->name('orders.update')
            ->middleware('clinic.feature:online_orders');

        /*
        |--------------------------------------------------------------------------
        | Payment Methods
        |--------------------------------------------------------------------------
        */

        Route::get('/payment-methods', [PaymentMethodController::class, 'index'])
            ->name('payment-methods.index')
            ->middleware('clinic.feature:finance');

        Route::put('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update'])
            ->name('payment-methods.update')
            ->middleware('clinic.feature:finance');

        /*
        |--------------------------------------------------------------------------
        | Payments
        |--------------------------------------------------------------------------
        */

        Route::get('/payments', [PaymentReportController::class, 'index'])
            ->name('payments.index')
            ->middleware('clinic.feature:finance');
        Route::patch('/payments/{payment}', [PaymentReportController::class, 'update'])
            ->name('payments.update')
            ->middleware('clinic.feature:finance');

        /*
        |--------------------------------------------------------------------------
        | Reports
        |--------------------------------------------------------------------------
        */

        Route::get('/reports/stock', [ReportController::class, 'stock'])
            ->name('reports.stock')
            ->middleware('clinic.feature:reports');

        Route::get('/reports/operations', [ReportController::class, 'operations'])
            ->name('reports.operations')
            ->middleware('clinic.feature:reports');

        /*
        |--------------------------------------------------------------------------
        | Reservations
        |--------------------------------------------------------------------------
        */

        Route::resource('reservations', ReservationController::class)
            ->middleware('clinic.feature:reservations');

        /*
        |--------------------------------------------------------------------------
        | Consultations
        |--------------------------------------------------------------------------
        */

        Route::resource('consultations', ConsultationController::class)
            ->except(['create', 'edit'])
            ->middleware('clinic.feature:consultations');

        /*
        |--------------------------------------------------------------------------
        | Medical Records
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/consultations/{consultation}/medical-record',
            [MedicalRecordController::class, 'store']
        )->name('consultations.medical-record.store')
            ->middleware('clinic.feature:medical_records');

        Route::resource('medical-records', MedicalRecordController::class)
            ->except(['edit'])
            ->middleware('clinic.feature:medical_records');

        /*
        |--------------------------------------------------------------------------
        | Prescriptions
        |--------------------------------------------------------------------------
        */

        Route::post('/prescriptions', [PrescriptionController::class, 'store'])
            ->name('prescriptions.store')
            ->middleware('clinic.feature:pharmacy');

        /*
        |--------------------------------------------------------------------------
        | Pharmacy POS
        |--------------------------------------------------------------------------
        */

        Route::get('/pos', [PosController::class, 'index'])
            ->name('pos.index')
            ->middleware('clinic.feature:pharmacy');

        Route::post('/pos', [PosController::class, 'store'])
            ->name('pos.store')
            ->middleware('clinic.feature:pharmacy');

        /*
        |--------------------------------------------------------------------------
        | Inventory
        |--------------------------------------------------------------------------
        */

        Route::get('/inventory', [InventoryController::class, 'index'])
            ->name('inventory.index')
            ->middleware('clinic.feature:pharmacy');

        Route::get('/pharmacy/drugs', [InventoryController::class, 'drugs'])
            ->name('pharmacy.drugs.index')
            ->middleware('clinic.feature:pharmacy');

        Route::get('/pharmacy/stock', [InventoryController::class, 'stock'])
            ->name('pharmacy.stock.index')
            ->middleware('clinic.feature:pharmacy');

        Route::get('/pharmacy/sales', [InventoryController::class, 'sales'])
            ->name('pharmacy.sales.index')
            ->middleware('clinic.feature:pharmacy');
    });
