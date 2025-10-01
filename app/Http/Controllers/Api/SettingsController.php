<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SettingsController extends Controller
{
    public const LOGIN_REQUIRED_KEY = 'login_required';

    public function __construct()
    {
        $this->middleware('permission:settings toggle-login', ['only' => ['setLoginRequired']]);
    }

    public function getLoginRequired()
    {
        $value = Setting::where('key', self::LOGIN_REQUIRED_KEY)->value('value');
        $enabled = filter_var($value, FILTER_VALIDATE_BOOL);
        return response()->json([
            'status' => true,
            'result' => ['login_required' => $enabled],
        ], Response::HTTP_OK);
    }

    public function setLoginRequired(Request $request)
    {
        $request->validate([
            'login_required' => ['required', 'boolean'],
        ]);

        $record = Setting::updateOrCreate(
            ['key' => self::LOGIN_REQUIRED_KEY],
            ['value' => $request->boolean('login_required') ? '1' : '0']
        );

        return response()->json([
            'status' => true,
            'message' => 'Setting updated',
            'result' => ['login_required' => $record->value === '1'],
        ], Response::HTTP_OK);
    }
}
