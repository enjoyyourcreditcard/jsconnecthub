<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cca;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CcaController extends Controller
{
    public function index(Request $request)
    {
        $query = Cca::query()->where('active', true);
        if ($request->filled('name')) {
            $query->where('name', 'like', '%'.$request->name.'%');
        }
        $data = $query->orderBy('name')->get();
        return response()->json([
            'status' => true,
            'message' => $data->isNotEmpty() ? 'Records found' : 'No records found',
            'result' => $data,
        ], Response::HTTP_OK);
    }
}
