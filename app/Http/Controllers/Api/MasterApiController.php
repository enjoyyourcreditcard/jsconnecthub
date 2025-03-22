<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MasterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Api\Route;

class MasterApiController extends Controller
{
    protected $masterService;

    public function __construct(MasterService $masterService)
    {
        $this->masterService = $masterService;

        foreach (config('constants.MASTER_TYPE_ARRAY') as $masterType) {
            $this->middleware('permission:' . $masterType . ' list', ['only' => ['index', 'show']]);
            $this->middleware('permission:' . $masterType . ' create', ['only' => ['store']]);
            $this->middleware('permission:' . $masterType . ' edit', ['only' => ['update']]);
            $this->middleware('permission:' . $masterType . ' delete', ['only' => ['destroy']]);
        }
    }

    private function doRequestValidation(Request $request, $type)
    {
        $rules = [];

        if ($type === config('constants.MASTER_TYPE_ARRAY.LEVEL_MASTER_TYPE')) {
            $rules = config('constants.MASTER_VALIDATION_ARRAY.LEVEL_MASTER_VALIDATION');
        }

        if ($type === config('constants.MASTER_TYPE_ARRAY.CLASS_MASTER_TYPE')) {
            $rules = config('constants.MASTER_VALIDATION_ARRAY.CLASS_MASTER_VALIDATION');
        }
        if ($type === config('constants.MASTER_TYPE_ARRAY.STUDENT_MASTER_TYPE')) {
            $rules = config('constants.MASTER_VALIDATION_ARRAY.STUDENT_MASTER_VALIDATION');
        }
        if ($type === config('constants.MASTER_TYPE_ARRAY.ACTIVITY_MASTER_TYPE')) {
            $rules = config('constants.MASTER_VALIDATION_ARRAY.ACTIVITY_MASTER_VALIDATION');
        }

        if ($type === config('constants.MASTER_TYPE_ARRAY.STUDENT_MASTER_TYPE')) {
            $rules = config('constants.MASTER_VALIDATION_ARRAY.STUDENT_MASTER_VALIDATION');
        }

        if ($type === config('constants.MASTER_TYPE_ARRAY.ACTIVITY_MASTER_TYPE')) {
            $rules = config('constants.MASTER_VALIDATION_ARRAY.ACTIVITY_MASTER_VALIDATION');
        }

        if ($type === config('constants.MASTER_TYPE_ARRAY.ROLE_MASTER_TYPE')) {
            $rules = config('constants.MASTER_VALIDATION_ARRAY.ROLE_MASTER_VALIDATION');
        }

        if ($type === config('constants.MASTER_TYPE_ARRAY.CHECKIN_MASTER_TYPE')) {
            $rules = config('constants.MASTER_VALIDATION_ARRAY.CHECKIN_MASTER_VALIDATION');
        }

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        return true;
    }

    public function index(Request $request, $type)
    {
        $data = $this->masterService->getAll($type);
        if ($data->isNotEmpty()) {
            return response()->json(['status' => true, 'message' => 'Records found', 'result' => $data], Response::HTTP_OK);
        } else {
            return response()->json(['status' => true, 'message' => 'No records found'], Response::HTTP_NOT_FOUND);
        }
    }

    public function show(Request $request, $type, $id)
    {
        $item = $this->masterService->getById($type, $id);
        if ($item) {
            return response()->json(['status' => true, 'message' => 'Record found', 'result' => $item], Response::HTTP_OK);
        } else {
            return response()->json(['status' => false, 'message' => 'Record not found'], Response::HTTP_NOT_FOUND);
        }
    }

    public function store(Request $request, $type)
    {
        $validation = $this->doRequestValidation($request, $type);
        if ($validation !== true) {
            return $validation;
        }

        $data = $request->all();
        $result = $this->masterService->create($type, $data);
        return response()->json(['status' => true, 'message' => "$type created", 'result' => $result], Response::HTTP_CREATED);
    }

    public function update(Request $request, $type, $id)
    {
        $validation = $this->doRequestValidation($request, $type, $id);
        if ($validation !== true) {
            return $validation;
        }

        $data = $request->all();
        $result = $this->masterService->update($type, $id, $data);
        return response()->json(['status' => true, 'message' => "$type updated", 'result' => $result], Response::HTTP_OK);
    }

    public function destroy(Request $request, $type, $id)
    {
        $this->masterService->delete($type, $id);
        return response()->json(['status' => true, 'message' => "$type deleted"], Response::HTTP_OK);
    }

}
