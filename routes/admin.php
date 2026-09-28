<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminPermissionController;
use App\Http\Controllers\Admin\AdminRoleController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\ClinicSubscriptionController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Clinic\ClinicController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Authentication
|--------------------------------------------------------------------------
*/

Route::prefix('admin')
    ->middleware('guest:admin')
    ->group(function () {

        // Admin Login Page
        Route::get('/login', [AdminAuthController::class, 'create'])
            ->name('admin.login');

        // Admin Login
        Route::post('/login', [AdminAuthController::class, 'store'])
            ->name('admin.login.store');

        Route::get('/register', [AdminAuthController::class, 'createInitialAdmin'])
            ->name('admin.register');

        Route::post('/register', [AdminAuthController::class, 'storeInitialAdmin'])
            ->name('admin.register.store');
    });

// Admin Logout
Route::post('/admin/logout', [AdminAuthController::class, 'destroy'])
    ->middleware(['auth:admin', 'admin'])
    ->name('admin.logout');

/*
|--------------------------------------------------------------------------
| Admin Application
|--------------------------------------------------------------------------
*/

Route::prefix('admin')
    ->middleware(['auth:admin', 'admin'])
    ->name('admin.')
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get('/dashboard', AdminDashboardController::class)
            ->middleware('admin.permission:dashboard.view')
            ->name('dashboard');

        /*
        |--------------------------------------------------------------------------
        | Clinics
        |--------------------------------------------------------------------------
        */

        Route::resource('clinics', ClinicController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->middleware('admin.permission:clinics.manage');

        Route::get('/plans', [PlanController::class, 'index'])
            ->middleware('admin.permission:clinics.manage')
            ->name('plans.index');
        Route::post('/plans', [PlanController::class, 'store'])
            ->middleware('admin.permission:clinics.manage')
            ->name('plans.store');
        Route::put('/plans/{plan}', [PlanController::class, 'update'])
            ->middleware('admin.permission:clinics.manage')
            ->name('plans.update');
        Route::get('/subscriptions', [ClinicSubscriptionController::class, 'index'])
            ->middleware('admin.permission:clinics.manage')
            ->name('subscriptions.index');
        Route::patch('/subscriptions/{subscription}/review', [ClinicSubscriptionController::class, 'review'])
            ->middleware('admin.permission:clinics.manage')
            ->name('subscriptions.review');

        /*
        |--------------------------------------------------------------------------
        | Users
        |--------------------------------------------------------------------------
        */

        Route::resource('users', AdminUserController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->middleware('admin.permission:admins.manage');

        Route::resource('roles', AdminRoleController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->middleware('admin.permission:roles.manage');

        Route::get('/permissions', [AdminPermissionController::class, 'index'])
            ->middleware('admin.permission:permissions.view')
            ->name('permissions.index');

        Route::get('/doctors', [InventoryController::class, 'doctorReport'])
            ->middleware('admin.permission:doctors.view')
            ->name('doctors.index');
        Route::get('/patients', [InventoryController::class, 'patientReport'])
            ->middleware('admin.permission:patients.view')
            ->name('patients.index');
        Route::get('/reservations', [InventoryController::class, 'reservationReport'])
            ->middleware('admin.permission:reservations.view')
            ->name('reservations.index');

        Route::get('/orders', [OrderController::class, 'index'])
            ->middleware('admin.permission:orders.manage')
            ->name('orders.index');
        Route::get('/orders/report.csv', [OrderController::class, 'export'])
            ->middleware('admin.permission:orders.manage')
            ->name('orders.report');

        Route::middleware('admin.permission:inventory.manage')->group(function (): void {
            Route::get('/inventory/drugs', [InventoryController::class, 'drugs'])->name('inventory.drugs');
            Route::post('/inventory/drugs', [InventoryController::class, 'storeDrug'])->name('inventory.drugs.store');
            Route::put('/inventory/drugs/{drug}', [InventoryController::class, 'updateDrug'])->name('inventory.drugs.update');
            Route::delete('/inventory/drugs/{drug}', [InventoryController::class, 'destroyDrug'])->name('inventory.drugs.destroy');
            Route::post('/inventory/medical-products', [InventoryController::class, 'storeMedicalProduct'])->name('inventory.medical-products.store');
            Route::put('/inventory/medical-products/{medicalProduct}', [InventoryController::class, 'updateMedicalProduct'])->name('inventory.medical-products.update');
            Route::delete('/inventory/medical-products/{medicalProduct}', [InventoryController::class, 'destroyMedicalProduct'])->name('inventory.medical-products.destroy');
            Route::get('/inventory/medical-products', [InventoryController::class, 'medicalProducts'])->name('inventory.medical-products');
            Route::get('/inventory/stock', [InventoryController::class, 'stock'])->name('inventory.stock');
            Route::post('/inventory/stock', [InventoryController::class, 'allocateStock'])->name('inventory.stock.allocate');
            Route::get('/inventory/reports/drugs', [InventoryController::class, 'drugStockReport'])->name('inventory.reports.drugs');
            Route::get('/inventory/reports/medical-products', [InventoryController::class, 'medicalProductStockReport'])->name('inventory.reports.medical-products');
        });

        Route::middleware('admin.permission:reports.view')->group(function (): void {
            Route::get('/inventory/reports', [InventoryController::class, 'reports'])->name('inventory.reports');
            Route::get('/inventory/reports/movements', [InventoryController::class, 'inventoryMovementReport'])->name('inventory.reports.movements');
        });

        Route::middleware('admin.permission:finance.view')->group(function (): void {
            Route::get('/inventory/reports/reservation-charges', [InventoryController::class, 'reservationChargesReport'])->name('inventory.reports.reservation-charges');
            Route::get('/inventory/reports/reservation-payments', [InventoryController::class, 'reservationPaymentsReport'])->name('inventory.reports.reservation-payments');
            Route::get('/inventory/reports/prescription-sales', [InventoryController::class, 'prescriptionSalesReport'])->name('inventory.reports.prescription-sales');
        });
    });
