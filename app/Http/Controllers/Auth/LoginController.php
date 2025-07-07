<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
        $this->middleware('auth')->only('logout');
    }

    /**
     * Login process and generate token.
     *
     * @return JsonResponse
     */
    public function login(Request $request)
    {
        $validatedData = $request->validate([
            'email'     => ['required', 'email'],
            'password'  => ['required', 'string']
        ]);

        $user = User::where([['email', $validatedData['email']], ['deleted_at', null]])->first();

        if (!$user || !Hash::check($validatedData['password'], $user->password)) {
            throw new HttpResponseException(response([
                "errors" => [
                    "message" => [
                        "Email or password is wrong"
                    ]
                ]
            ], 401));
        }

        $user->tokens()->delete();

        $tokenString = $user->name . "-" . $user->email . "_" . $user->id;

        return response()->json([
            'status' => true,
            'result' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
            'token' => $user->createToken($tokenString)->plainTextToken
        ]);
    }

    /**
     * Logout process and delete token.
     *
     * @return JsonResponse
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        $user->tokens()->delete();

        return response()->json(['status' => true, 'message' => 'logged out']);
    }
}
