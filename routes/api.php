<?php

use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\AdminResourceController;
use App\Http\Controllers\Api\ClinicDiscoveryController;
use App\Http\Controllers\Api\ClinicPortalController;
use App\Http\Controllers\Api\PatientAuthController;
use App\Http\Controllers\Api\PatientShopController;
use App\Http\Controllers\Api\PortalAuthController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Clinic\OnlineOrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/register', [PatientAuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/login', [PatientAuthController::class, 'login'])->middleware('throttle:6,1');

    Route::post('/admin/login', [PortalAuthController::class, 'adminLogin'])->middleware('throttle:6,1');
    Route::post('/clinic/login', [PortalAuthController::class, 'clinicLogin'])->middleware('throttle:6,1');

    Route::get('/clinics', [ClinicDiscoveryController::class, 'clinics']);
    Route::get('/clinics/{clinic}/doctors', [ClinicDiscoveryController::class, 'doctors']);
    Route::get('/clinics/{clinic}/doctors/{doctor}/services', [ClinicDiscoveryController::class, 'services']);
    Route::get('/clinics/{clinic}/doctors/{doctor}/availability', [ClinicDiscoveryController::class, 'availability']);

    Route::get('/shop/products', [PatientShopController::class, 'products']);
    Route::get('/payment-methods', [PatientShopController::class, 'paymentMethods']);

    Route::prefix('admin')->middleware(['auth:sanctum', 'admin.api'])->group(function (): void {
        Route::get('/me', [PortalAuthController::class, 'adminMe']);
        Route::post('/logout', [PortalAuthController::class, 'logout']);
        Route::get('/orders', [AdminOrderController::class, 'apiIndex'])->middleware('admin.permission:orders.manage');

        Route::middleware('admin.permission:admins.manage')->group(function (): void {
            Route::get('/users', [AdminResourceController::class, 'users']);
            Route::post('/users', [AdminResourceController::class, 'storeUser']);
            Route::put('/users/{user}', [AdminResourceController::class, 'updateUser']);
            Route::delete('/users/{user}', [AdminResourceController::class, 'destroyUser']);
        });

        Route::get('/permissions', [AdminResourceController::class, 'permissions'])
            ->middleware('admin.permission:permissions.view');

        Route::middleware('admin.permission:roles.manage')->group(function (): void {
            Route::get('/roles', [AdminResourceController::class, 'roles']);
            Route::post('/roles', [AdminResourceController::class, 'storeRole']);
            Route::put('/roles/{role}', [AdminResourceController::class, 'updateRole']);
            Route::delete('/roles/{role}', [AdminResourceController::class, 'destroyRole']);
        });
    });

    Route::prefix('clinic')->middleware(['auth:sanctum', 'clinic.api'])->group(function (): void {
        Route::get('/me', [PortalAuthController::class, 'clinicMe']);
        Route::post('/logout', [PortalAuthController::class, 'logout']);

        Route::middleware('clinic.subscription')->group(function (): void {
            Route::get('/doctors', [ClinicPortalController::class, 'doctors'])->middleware('clinic.feature:doctors');
            Route::get('/services', [ClinicPortalController::class, 'services'])->middleware('clinic.feature:services');
            Route::get('/patients', [ClinicPortalController::class, 'patients'])->middleware('clinic.feature:patients');
            Route::get('/reservations', [ClinicPortalController::class, 'reservations'])->middleware('clinic.feature:reservations');
            Route::get('/schedules', [ClinicPortalController::class, 'schedules'])->middleware('clinic.feature:schedules');
            Route::get('/orders', [OnlineOrderController::class, 'apiIndex'])->middleware('clinic.feature:online_orders');
            Route::patch('/orders/{sale}', [OnlineOrderController::class, 'update'])->middleware('clinic.feature:online_orders');
        });
    });

    Route::middleware(['auth:sanctum', 'patient.api'])->group(function (): void {
        Route::post('/logout', [PatientAuthController::class, 'logout']);
        Route::get('/shop/cart', [PatientShopController::class, 'cart']);
        Route::post('/shop/cart/items', [PatientShopController::class, 'addToCart']);
        Route::put('/shop/cart/items/{cartItem}', [PatientShopController::class, 'updateCartItem']);
        Route::delete('/shop/cart/items/{cartItem}', [PatientShopController::class, 'removeCartItem']);
        Route::post('/shop/checkout', [PatientShopController::class, 'checkout']);
        Route::get('/shop/orders', [PatientShopController::class, 'orders']);
        Route::get('/shop/orders/{sale}', [PatientShopController::class, 'showOrder']);
        Route::post('/clinics/{clinic}/select', [ClinicDiscoveryController::class, 'select']);
        Route::get('/reservations', [ReservationController::class, 'index']);
        Route::post('/reservations', [ReservationController::class, 'store']);
    });
});
