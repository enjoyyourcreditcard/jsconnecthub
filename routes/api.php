<?php

use App\Http\Controllers\Api\MasterApiController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

/**
 * References
 */
Route::get('/sample', fn() => response()->json(['status' => true, 'result' => ['supguys' => 'wefniejnwf']]));

Route::post('/login', [LoginController::class, 'login']);

Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::post('/logout', [LoginController::class, 'logout']);

    $types = config('constants');

    foreach ($types as $type) {
        Route::prefix($type)->group(function () use ($type) {
            Route::get('/', [MasterApiController::class, 'index']);
            Route::get('/{id}', [MasterApiController::class, 'show']);
            Route::post('/', [MasterApiController::class, 'store']);
            Route::put('/{id}', [MasterApiController::class, 'update']);
            Route::delete('/{id}', [MasterApiController::class, 'destroy']);
        });
    }
});
