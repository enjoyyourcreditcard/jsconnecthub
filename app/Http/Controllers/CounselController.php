<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CounselController extends Controller
{
    public function counsel (Request $request)
    {
        //

        return response()->json([
            'status'    => true,
            'message'   => null
        ], Response::HTTP_OK);
    }
}
