<?php

use App\Http\Controllers\Api\MasterApiController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Api\CheckinController;
use Illuminate\Support\Facades\Route;

/**
 * References
 */
Route::get('/app', fn() => response()->json(['status' => true, 'result' => ['tes' => 'tes']]));

/**
 * Authentication
 */
Route::post('/login', [LoginController::class, 'login']);

Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::post('/logout', [LoginController::class, 'logout']);
});

/**
 * Dashboard
 */
Route::group(['middleware' => 'auth:sanctum'], function () {
    /**
     * Master data
     */
    $types = config('constants.MASTER_TYPE_ARRAY');

    Route::prefix('{type}')->where(['type' => implode('|', $types)])->group(function () {
        Route::get('/', [MasterApiController::class, 'index']);
        Route::get('/{id}', [MasterApiController::class, 'show']);
        Route::post('/', [MasterApiController::class, 'store']);
        Route::put('/{id}', [MasterApiController::class, 'update']);
        Route::delete('/{id}', [MasterApiController::class, 'destroy']);
    });
});

/**
 * Check-in & out
 */
Route::post('/check-in', [CheckinController::class, 'checkin']);
Route::post('/check-out', [CheckinController::class, 'checkout']);
