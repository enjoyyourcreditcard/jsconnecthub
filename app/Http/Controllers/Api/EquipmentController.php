<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EquipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Equipment::query()->with('cca')->where('active', true);
        if ($request->filled('cca_id')) {
            $query->where('cca_id', $request->cca_id);
        }
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
