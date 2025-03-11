<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/sample', fn() => response()->json(['status' => true, 'result' => ['supguys' => 'from Laravel']]));
