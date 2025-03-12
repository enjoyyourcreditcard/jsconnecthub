<?php

use App\Http\Controllers\Auth\LoginController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [LoginController::class, 'login']);

Route::get('/sample', fn() => response()->json(['status' => true, 'result' => ['supguys' => 'from Laravel']]));
