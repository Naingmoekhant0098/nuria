<?php

use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureAdminApi;
use App\Http\Middleware\EnsureAdminPermission;
use App\Http\Middleware\EnsureClinicApi;
use App\Http\Middleware\EnsureClinicFeature;
use App\Http\Middleware\EnsureClinicSubscription;
use App\Http\Middleware\EnsurePatientApi;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => EnsureAdmin::class,
            'admin.permission' => EnsureAdminPermission::class,
            'admin.api' => EnsureAdminApi::class,
            'clinic.api' => EnsureClinicApi::class,
            'clinic.subscription' => EnsureClinicSubscription::class,
            'clinic.feature' => EnsureClinicFeature::class,
            'patient.api' => EnsurePatientApi::class,
        ]);

        $middleware->redirectGuestsTo(fn (Request $request): string => $request->is('admin/*')
            ? route('admin.login')
            : route('clinic.login'));

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
