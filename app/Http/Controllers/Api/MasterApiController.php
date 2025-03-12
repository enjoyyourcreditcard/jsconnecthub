<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MasterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class MasterApiController extends Controller
{
    protected $masterService;

    public function __construct(MasterService $masterService)
    {
        $this->masterService = $masterService;
    }

    public function index(Request $request, $type)
    {
        $data = $this->masterService->getAll($type);
        return response()->json(['status' => true, 'result' => $data]);
    }

    public function show(Request $request, $type, $id)
    {
        $item = $this->masterService->getById($type, $id);
        return response()->json(['status' => true, 'result' => $item]);
    }

    public function store(Request $request, $type)
    {
        $data = $request->all();
        $result = $this->masterService->create($type, $data);
        return response()->json(['status' => true, 'message' => "$type created", 'result' => $result]);
    }

    public function update(Request $request, $type, $id)
    {
        $data = $request->all();
        $result = $this->masterService->update($type, $id, $data);
        return response()->json(['status' => true, 'message' => "$type updated", 'result' => $result]);
    }

    public function destroy(Request $request, $type, $id)
    {
        $this->masterService->delete($type, $id);
        return response()->json(['status' => true, 'message' => "$type deleted"]);
    }
}
