<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CounselController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Api\CheckinController;
use App\Http\Controllers\Api\MasterApiController;

/**
 * References
 */
$types = config('constants.MASTER_TYPE_ARRAY');
Route::get('/app', fn() => response()->json(['status' => true, 'result' => []]));

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
Route::group(['middleware' => 'auth:sanctum'], function () use ($types) {
    /**
     * Master data
     */
    Route::prefix('{type}')->where(['type' => implode('|', $types)])->group(function () {
        Route::get('/{id}', [MasterApiController::class, 'show']);
        Route::post('/', [MasterApiController::class, 'store']);
        Route::post('/import', [MasterApiController::class, 'import']);
        Route::put('/{id}', [MasterApiController::class, 'update']);
        Route::delete('/{id}', [MasterApiController::class, 'destroy']);
    });
});

Route::prefix('{type}')->where(['type' => implode('|', $types)])->group(function () {
    Route::get('/', [MasterApiController::class, 'index']);
});

/**
 * Check-in & out
 */
Route::post('/check-in', [CheckinController::class, 'checkin']);
Route::post('/check-out', [CheckinController::class, 'checkout']);

/**
 * Booking
 */
Route::post('/booking', [BookingController::class, 'store']);
Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::put('/booking-confirm/{id}', [BookingController::class, 'confirm']);
});
Route::put('/booking-cancel/{id}', [BookingController::class, 'cancel']);

/**
 * Ms Vi Counsellor
 */
Route::post('/counsel-submit', [CounselController::class, 'submit']);
