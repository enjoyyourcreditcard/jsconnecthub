<?php

use Illuminate\Support\Facades\Route;

Route::get('/{path?}', function () {
    return view('app');
})->where('path', '^(?!api|ui-broken).*?');

//// for production
// Route::get('/{path?}', function () {
//     $reactBuildPath = public_path('build/assets');

//     if (!is_dir($reactBuildPath)) {
//         return redirect()->route('ui-broken');
//     }

//     return view('app');
// })->where('path', '^(?!api|ui-broken).*?');

Route::get('/ui-broken', function () {
    return view('ui-broken');
})->name('ui-broken');
