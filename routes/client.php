<?php

use App\Http\Controllers\Client\ClientAuthController;
use App\Http\Controllers\Client\ClientClinicController;
use App\Http\Controllers\Client\ClientReservationController;
use App\Http\Controllers\Client\ClientShopController;
use Illuminate\Support\Facades\Route;

Route::name('client.')->group(function (): void {

    /*
    |--------------------------------------------------------------------------
    | Public Home
    |--------------------------------------------------------------------------
    */

    Route::get('/', [
        ClientClinicController::class,
        'home',
    ])->name('home');

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::middleware('guest:patient')->group(function (): void {

        Route::get('/login', [
            ClientAuthController::class,
            'showLogin',
        ])->name('login');

        Route::post('/login', [
            ClientAuthController::class,
            'login',
        ])->middleware('throttle:6,1')->name('login.store');

        Route::get('/register', [
            ClientAuthController::class,
            'showRegister',
        ])->name('register');

        Route::post('/register', [
            ClientAuthController::class,
            'register',
        ])->middleware('throttle:6,1')->name('register.store');
    });

    /*
    |--------------------------------------------------------------------------
    | Clinics
    |--------------------------------------------------------------------------
    */

    Route::get('/clinics', [
        ClientClinicController::class,
        'index',
    ])->name('clinics');

    Route::get('/clinics/{clinic}', [
        ClientClinicController::class,
        'show',
    ])->name('clinics.show');

    Route::get('/clinics/{clinic}/doctors', [
        ClientClinicController::class,
        'doctors',
    ])->name('clinics.doctors');

    Route::get('/clinics/{clinic}/doctors/{doctor}', [
        ClientClinicController::class,
        'doctor',
    ])->name('clinics.doctors.show');

    Route::get('/clinics/{clinic}/doctors/{doctor}/services', [
        ClientClinicController::class,
        'services',
    ])->name('clinics.doctors.services');

    Route::get('/clinics/{clinic}/doctors/{doctor}/availability', [
        ClientClinicController::class,
        'availability',
    ])->name('clinics.doctors.availability');

    /*
    |--------------------------------------------------------------------------
    | Shop
    |--------------------------------------------------------------------------
    */

    Route::get('/shop', [
        ClientShopController::class,
        'index',
    ])->name('shop');

    Route::get('/shop/products/{product}', [
        ClientShopController::class,
        'show',
    ])->name('shop.products.show');

    /*
    |--------------------------------------------------------------------------
    | Authenticated Patient
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:patient')->group(function (): void {

        Route::post('/logout', [
            ClientAuthController::class,
            'logout',
        ])->name('logout');

        Route::post('/clinics/{clinic}/select', [
            ClientClinicController::class,
            'select',
        ])->name('clinics.select');

        Route::get('/reservations', [
            ClientReservationController::class,
            'index',
        ])->name('reservations');

        Route::get('/reservations/create', [
            ClientReservationController::class,
            'create',
        ])->name('reservations.create');

        Route::post('/reservations', [
            ClientReservationController::class,
            'store',
        ])->name('reservations.store');

        Route::get('/reservations/{reservation}', [
            ClientReservationController::class,
            'show',
        ])->name('reservations.show');

        Route::get('/shop/cart', [
            ClientShopController::class,
            'cart',
        ])->name('shop.cart');

        Route::get('/shop/orders', [
            ClientShopController::class,
            'orders',
        ])->name('shop.orders');

        Route::get('/shop/orders/{sale}', [
            ClientShopController::class,
            'order',
        ])->name('shop.orders.show');
    });
});
