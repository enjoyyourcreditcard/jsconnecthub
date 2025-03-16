<?php

use App\Http\Controllers\Api\MasterApiController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

/**
 * References
 */
Route::post('/login', [LoginController::class, 'login']);
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

Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::post('/logout', [LoginController::class, 'logout']);

    $types = config('constants.MASTER_TYPE_ARRAY');

    // foreach ($types as $type) {
    //     Route::prefix($type)->group(function () use ($type) {
    //         Route::get('/', [MasterApiController::class, 'index'])->name("$type.index");
    //         Route::get('/{id}', [MasterApiController::class, 'show']);
    //         Route::post('/', [MasterApiController::class, 'store']);
    //         Route::put('/{id}', [MasterApiController::class, 'update']);
    //         Route::delete('/{id}', [MasterApiController::class, 'destroy']);
    //     });
    // }
    Route::prefix('{type}')->where(['type' => implode('|', $types)])->group(function () {
        Route::get('/', [MasterApiController::class, 'index']);
        Route::get('/{id}', [MasterApiController::class, 'show']);
        Route::post('/', [MasterApiController::class, 'store']);
        Route::put('/{id}', [MasterApiController::class, 'update']);
        Route::delete('/{id}', [MasterApiController::class, 'destroy']);
    });

});
