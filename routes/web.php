<?php

// Route::get('/', function () {
//     if (auth('admin')->check()) {
//         return redirect()->route('admin.dashboard');
//     }

//     if (auth('clinic')->check()) {
//         return redirect()->route('dashboard');
//     }

//     return redirect()->route('clinic.login');
// })->name('home');

require __DIR__.'/client.php';
require __DIR__.'/clinic.php';
require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
