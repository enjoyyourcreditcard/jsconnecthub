<?php

use App\Http\Controllers\Api\MasterApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/sample', fn() => response()->json(['status' => true, 'result' => ['supguys' => 'wefniejnwf']]));

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
