<?php

use App\Http\Controllers\Api\MasterApiController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

/**
 * References
 */
Route::get('/app', fn() => response()->json(['status' => true, 'result' => ['tes' => 'up']]));

Route::get('/sample', function () {
    return response()->json([
        'status' => true,
        'result' => [
            ['id' => 1, 'username' => 'asadcool', 'email' => 'asad@example.com', 'date' => '2025-03-14'],
            ['id' => 2, 'username' => 'jane_doe', 'email' => 'jane.doe@example.com', 'date' => '2025-03-15'],
            ['id' => 3, 'username' => 'johnsmith', 'email' => 'john.smith@example.com', 'date' => '2025-03-16'],
        ]
    ]);
});

/**
 * Authentication
 */
Route::post('/login', [LoginController::class, 'login']);

Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::post('/logout', [LoginController::class, 'logout']);
});

/**
 * Master data
 */
Route::group(['middleware' => 'auth:sanctum'], function () {
    $types = config('constants.MASTER_TYPE_ARRAY');

    Route::prefix('{type}')->where(['type' => implode('|', $types)])->group(function () {
        Route::get('/', [MasterApiController::class, 'index']);
        Route::get('/{id}', [MasterApiController::class, 'show']);
        Route::post('/', [MasterApiController::class, 'store']);
        Route::put('/{id}', [MasterApiController::class, 'update']);
        Route::delete('/{id}', [MasterApiController::class, 'destroy']);
    });
});
