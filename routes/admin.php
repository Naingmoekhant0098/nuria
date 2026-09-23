<?php
 

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\ClinicController;
use App\Http\Controllers\Admin\UserController;
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
    });

// Admin Logout
Route::post('/admin/logout', [AdminAuthController::class, 'destroy'])
    ->middleware('auth:admin')
    ->name('admin.logout');


/*
|--------------------------------------------------------------------------
| Admin Application
|--------------------------------------------------------------------------
*/

Route::prefix('admin')
    ->middleware(['auth:admin', 'verified'])
    ->name('admin.')
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get('/dashboard', AdminDashboardController::class)
            ->name('dashboard');


        /*
        |--------------------------------------------------------------------------
        | Clinics
        |--------------------------------------------------------------------------
        */

        Route::resource('clinics', ClinicController::class);


        /*
        |--------------------------------------------------------------------------
        | Users
        |--------------------------------------------------------------------------
        */

        Route::resource('users', UserController::class);
    });