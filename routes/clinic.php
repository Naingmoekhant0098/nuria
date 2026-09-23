 <?php

 

use App\Http\Controllers\Clinic\ClinicAuthController;
use App\Http\Controllers\Clinic\ClinicServiceController;
use App\Http\Controllers\Clinic\DoctorController;
use App\Http\Controllers\Clinic\DoctorScheduleController;
use App\Http\Controllers\Clinic\PatientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Consultation\ConsultationController;
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
    ->middleware(['auth:clinic', 'verified'])
    ->group(function () {

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
            ->names('clinic.services');


        /*
        |--------------------------------------------------------------------------
        | Doctors
        |--------------------------------------------------------------------------
        */

        Route::resource('doctors', DoctorController::class);


        /*
        |--------------------------------------------------------------------------
        | Doctor Schedules
        |--------------------------------------------------------------------------
        */

        Route::resource('doctor-schedules', DoctorScheduleController::class);


        /*
        |--------------------------------------------------------------------------
        | Patients
        |--------------------------------------------------------------------------
        */

        Route::resource('patients', PatientController::class);


        /*
        |--------------------------------------------------------------------------
        | Payment Methods
        |--------------------------------------------------------------------------
        */

        Route::get('/payment-methods', [PaymentMethodController::class, 'index'])
            ->name('payment-methods.index');

        Route::put('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update'])
            ->name('payment-methods.update');


        /*
        |--------------------------------------------------------------------------
        | Payments
        |--------------------------------------------------------------------------
        */

        Route::get('/payments', [PaymentReportController::class, 'index'])
            ->name('payments.index');


        /*
        |--------------------------------------------------------------------------
        | Reports
        |--------------------------------------------------------------------------
        */

        Route::get('/reports/stock', [ReportController::class, 'stock'])
            ->name('reports.stock');

        Route::get('/reports/operations', [ReportController::class, 'operations'])
            ->name('reports.operations');


        /*
        |--------------------------------------------------------------------------
        | Reservations
        |--------------------------------------------------------------------------
        */

        Route::resource('reservations', ReservationController::class);


        /*
        |--------------------------------------------------------------------------
        | Consultations
        |--------------------------------------------------------------------------
        */

        Route::resource('consultations', ConsultationController::class)
            ->except(['create', 'edit']);


        /*
        |--------------------------------------------------------------------------
        | Medical Records
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/consultations/{consultation}/medical-record',
            [MedicalRecordController::class, 'store']
        )->name('consultations.medical-record.store');

        Route::resource('medical-records', MedicalRecordController::class)
            ->except(['edit']);


        /*
        |--------------------------------------------------------------------------
        | Prescriptions
        |--------------------------------------------------------------------------
        */

        Route::post('/prescriptions', [PrescriptionController::class, 'store'])
            ->name('prescriptions.store');


        /*
        |--------------------------------------------------------------------------
        | Pharmacy POS
        |--------------------------------------------------------------------------
        */

        Route::get('/pos', [PosController::class, 'index'])
            ->name('pos.index');

        Route::post('/pos', [PosController::class, 'store'])
            ->name('pos.store');


        /*
        |--------------------------------------------------------------------------
        | Inventory
        |--------------------------------------------------------------------------
        */

        Route::get('/inventory', [InventoryController::class, 'index'])
            ->name('inventory.index');

        Route::get('/pharmacy/drugs', [InventoryController::class, 'drugs'])
            ->name('pharmacy.drugs.index');

        Route::get('/pharmacy/stock', [InventoryController::class, 'stock'])
            ->name('pharmacy.stock.index');

        Route::get('/pharmacy/sales', [InventoryController::class, 'sales'])
            ->name('pharmacy.sales.index');
    });



// use App\Http\Controllers\Clinic\ClinicAuthController;
// use App\Http\Controllers\Clinic\ClinicServiceController;
// use App\Http\Controllers\Clinic\DoctorController;
// use App\Http\Controllers\Clinic\DoctorScheduleController;
// use App\Http\Controllers\Clinic\PatientController;
// use App\Http\Controllers\DashboardController;
// use App\Http\Controllers\Consultation\ConsultationController;
// use App\Http\Controllers\MedicalRecords\MedicalRecordController;
// use App\Http\Controllers\PaymentMethodController;
// use App\Http\Controllers\PaymentReportController;
// use App\Http\Controllers\Pharmacy\InventoryController;
// use App\Http\Controllers\Pharmacy\PosController;
// use App\Http\Controllers\Pharmacy\PrescriptionController;
// use App\Http\Controllers\ReportController;
// use App\Http\Controllers\Reservation\ReservationController;
// use Illuminate\Support\Facades\Route;

// /*
// |--------------------------------------------------------------------------
// | Clinic Authentication
// |--------------------------------------------------------------------------
// */

// Route::post('/clinic/login', [ClinicAuthController::class, 'store'])
//     ->name('clinic.login.store');


// /*
// |--------------------------------------------------------------------------
// | Clinic Application
// |--------------------------------------------------------------------------
// */

// Route::middleware(['auth:clinic', 'verified'])
//     ->prefix('clinic')
//     ->group(function () {

//         // Dashboard
//         Route::get('/dashboard', DashboardController::class)
//             ->name('dashboard');

//         // Services
//         Route::resource('services', ClinicServiceController::class)
//             ->names('clinic.services');

//         // Doctors
//         Route::resource('doctors', DoctorController::class);

//         // Doctor schedules
//         Route::resource('doctor-schedules', DoctorScheduleController::class);

//         // Patients
//         Route::resource('patients', PatientController::class);

//         // Payment methods
//         Route::get('/payment-methods', [PaymentMethodController::class, 'index'])
//             ->name('payment-methods.index');

//         Route::put('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update'])
//             ->name('payment-methods.update');

//         // Payments
//         Route::get('/payments', [PaymentReportController::class, 'index'])
//             ->name('payments.index');

//         // Reports
//         Route::get('/reports/stock', [ReportController::class, 'stock'])
//             ->name('reports.stock');

//         Route::get('/reports/operations', [ReportController::class, 'operations'])
//             ->name('reports.operations');

//         // Reservations
//         Route::resource('reservations', ReservationController::class);

//         // Consultations
//         Route::resource('consultations', ConsultationController::class)
//             ->except(['create', 'edit']);

//         // Medical records
//         Route::post(
//             '/consultations/{consultation}/medical-record',
//             [MedicalRecordController::class, 'store']
//         )->name('consultations.medical-record.store');

//         Route::resource('medical-records', MedicalRecordController::class)
//             ->except(['edit']);

//         // Prescriptions
//         Route::post('/prescriptions', [PrescriptionController::class, 'store'])
//             ->name('prescriptions.store');

//         // POS
//         Route::get('/pos', [PosController::class, 'index'])
//             ->name('pos.index');

//         Route::post('/pos', [PosController::class, 'store'])
//             ->name('pos.store');

//         // Inventory
//         Route::get('/inventory', [InventoryController::class, 'index'])
//             ->name('inventory.index');

//         Route::get('/pharmacy/drugs', [InventoryController::class, 'drugs'])
//             ->name('pharmacy.drugs.index');

//         Route::get('/pharmacy/stock', [InventoryController::class, 'stock'])
//             ->name('pharmacy.stock.index');

//         Route::get('/pharmacy/sales', [InventoryController::class, 'sales'])
//             ->name('pharmacy.sales.index');
//     });  