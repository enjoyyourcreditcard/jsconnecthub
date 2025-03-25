<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Services\MasterService;
use Illuminate\Validation\Rule;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\Route;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Validator;

class MasterApiController extends Controller
{
    protected $masterService;

    public function __construct(MasterService $masterService)
    {
        $this->masterService = $masterService;

        foreach (config('constants.MASTER_TYPE_ARRAY') as $masterType) {
            // $this->middleware('permission:' . $masterType . ' list', ['only' => ['index', 'show']]);
            $this->middleware('permission:' . $masterType . ' create', ['only' => ['store', 'import']]);
            $this->middleware('permission:' . $masterType . ' edit', ['only' => ['update']]);
            $this->middleware('permission:' . $masterType . ' delete', ['only' => ['destroy']]);
        }
    }

    private function getRuleValidationByType($type)
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

        return $rules;
    }

    private function doRequestValidation(Request $request, $type)
    {
        $rules = $this->getRuleValidationByType($type);

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
        $data = $this->masterService->getAll($type, $request);
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

    public function import(Request $request, $type)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx|max:10240',
        ]);

        $file = $request->file('file');

        try {
            $data = Excel::toArray([], $file)[0];
            $headers = array_shift($data);
            $rows = $data;

            if (empty($rows)) {
                return response()->json(['status' => false, 'message' => 'File is empty'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $headerMapping = $this->changeImportHeader($type);
            $transformedHeaders = array_map(function ($header) use ($headerMapping) {
                return $headerMapping[strtolower($header)] ?? strtolower($header);
            }, $headers);

            $foreignKeys = $this->getForeignKeys($type);

            $imported = [];
            DB::beginTransaction();

            foreach ($rows as $index => $row) {
                $rowData = array_combine($transformedHeaders, $row);

                foreach ($foreignKeys as $fk => $relatedType) {
                    if (isset($rowData[$fk]) && !is_numeric($rowData[$fk])) {
                        $relatedModel = $this->masterService->getByName($relatedType, $rowData[$fk]);
                        if ($relatedModel) {
                            $rowData[$fk] = $relatedModel->id;
                        } else {
                            throw new \Exception("Invalid $fk: '{$rowData[$fk]}' not found at row " . ($index + 2));
                        }
                    }
                }

                $validationRules = $this->getRuleValidationByType($type);
                $validator = Validator::make($rowData, $validationRules);

                if ($validator->fails()) {
                    throw new \Exception("Validation failed at row " . ($index + 2) . ": " . implode(", ", $validator->errors()->all()));
                }

                try {
                    $result = $this->masterService->create($type, $rowData);
                    $imported[] = $result;
                } catch (\Illuminate\Database\QueryException $e) {
                    if ($e->getCode() === '23000') {
                        $field = $this->extractFieldFromUniqueError($e->getMessage(), $type);
                        throw new \Exception("Duplicate entry for $field: '{$rowData[$field]}' at row " . ($index + 2));
                    }
                    throw new \Exception("Error at row " . ($index + 2) . ": Unable to save record");
                }
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => count($imported) . ' ' . ($type) . " imported successfully",
                'result' => $imported
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }



    public function destroy(Request $request, $type, $id)
    {
        $this->masterService->delete($type, $id);
        return response()->json(['status' => true, 'message' => "$type deleted"], Response::HTTP_OK);
    }

    // misc
    private function changeImportHeader($type)
    {
        return [
            'class' => ['level' => 'level_id'],
            'students' => ['class' => 'class_id'],
            'checkins' => ['student' => 'student_id', 'activity' => 'activity_id'],
        ][$type] ?? [];
    }

    private function getForeignKeys($type)
    {
        return [
            'class' => ['level_id' => 'levels'],
            'students' => ['class_id' => 'class'],
            'checkins' => ['student_id' => 'students', 'activity_id' => 'activities'],
        ][$type] ?? [];
    }

    private function extractFieldFromUniqueError($errorMessage, $type)
    {
        $uniqueFields = [
            'class' => 'name',
            'levels' => 'name',
            'activities' => 'name',
        ];

        $field = $uniqueFields[$type] ?? 'name';

        if (preg_match("/for key '.*\.([^.]+)_unique'/", $errorMessage, $matches)) {
            $field = $matches[1];
        }

        return $field;
    }
}
