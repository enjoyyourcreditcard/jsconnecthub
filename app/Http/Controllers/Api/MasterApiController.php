<?php

namespace App\Http\Controllers\Api;

use App\Models\Question;
use App\Models\RadioOption;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Services\MasterService;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Validator;

class MasterApiController extends Controller
{
    protected $masterService;

    public function __construct(MasterService $masterService, RadioOption $radioOption, Question $question)
    {
        $this->masterService = $masterService;
        $this->radioOption = $radioOption;
        $this->question = $question;

        $urlMasterType = request()->segment(2);

        if (!in_array($urlMasterType, config('constants.MASTER_TYPE_ARRAY'))) {
            return response()->json(['status' => false, 'message' => 'Master Type not found'], Response::HTTP_NOT_FOUND);
        }

        $this->middleware('permission:' . $urlMasterType . ' create', ['only' => ['store', 'import']]);
        $this->middleware('permission:' . $urlMasterType . ' edit', ['only' => ['update']]);
        $this->middleware('permission:' . $urlMasterType . ' delete', ['only' => ['destroy']]);
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
        if ($type === config('constants.MASTER_TYPE_ARRAY.ROLE_MASTER_TYPE')) {
            $rules = config('constants.MASTER_VALIDATION_ARRAY.ROLE_MASTER_VALIDATION');
        }
        if ($type === config('constants.MASTER_TYPE_ARRAY.CHECKIN_MASTER_TYPE')) {
            $rules = config('constants.MASTER_VALIDATION_ARRAY.CHECKIN_MASTER_VALIDATION');
        }
        if ($type === config('constants.MASTER_TYPE_ARRAY.BOOKING_MASTER_TYPE')) {
            $rules = config('constants.MASTER_VALIDATION_ARRAY.BOOKING_MASTER_VALIDATION');
        }
        if ($type === config('constants.MASTER_TYPE_ARRAY.SUPPORT_STRATEGY_TYPE')) {
            $rules = config('constants.MASTER_VALIDATION_ARRAY.SUPPORT_STRATEGY_VALIDATION');
        }
        if ($type === config('constants.MASTER_TYPE_ARRAY.QUESTION_TYPE')) {
            $rules = [
                'support_strategy_id' => ['required', 'exists:support_strategies,id'],
                'order' => ['required', 'integer', 'min:1'],
                'text' => ['required', 'string'],
                'type' => ['required', 'in:text,radio'],
                'radio_options' => ['required_if:type,radio', 'array', 'min:2'],
                'radio_options.*' => ['required', 'string', 'max:255'],
            ];
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
            return response()->json(['status' => false, 'message' => 'No records found'], Response::HTTP_OK);
        }
    }

    public function show(Request $request, $type, $id)
    {
        $item = $this->masterService->getById($type, $id);
        if ($item) {
            return response()->json(['status' => true, 'message' => 'Record found', 'result' => $item], Response::HTTP_OK);
        } else {
            return response()->json(['status' => false, 'message' => 'Record not found'], Response::HTTP_OK);
        }
    }

    public function store(Request $request, $type)
    {
        $validation = $this->doRequestValidation($request, $type);
        if ($validation !== true) {
            return $validation;
        }

        if ($type === 'questions') {
            $data = $request->only(['support_strategy_id', 'order', 'text', 'type']);
            $radioOptions = $request->input('radio_options', []);
            try {
                $storedQuestion = $this->masterService->create($type, $data);
                if ($data['type'] === 'radio' && !empty($radioOptions)) {
                    foreach ($radioOptions as $option) {
                        $this->masterService->create('radio-options', [
                            'question_id' => $storedQuestion->id,
                            'text' => $option,
                        ]);
                    }
                }
                return response()->json([
                    'status' => true,
                    'message' => "$type created",
                    'result' => $storedQuestion->load('radioOptions')
                ], Response::HTTP_CREATED);
            } catch (\Exception $e) {
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to create question: ' . $e->getMessage()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        } else {
            $data = $request->all();
            $result = $this->masterService->create($type, $data);
            return response()->json(['status' => true, 'message' => "$type created", 'result' => $result], Response::HTTP_CREATED);
        }
    }

    public function update(Request $request, $type, $id)
    {
        $validation = $this->doRequestValidation($request, $type);
        if ($validation !== true) {
            return $validation;
        }

        if ($type === 'questions') {
            $data = $request->only(['support_strategy_id', 'order', 'text', 'type']);
            $radioOptions = $request->input('radio_options', []);

            try {
                $updatedQuestion = $this->masterService->update($type, $id, $data);
                if ($data['type'] === 'radio') {
                    $this->radioOption->where('question_id', $id)->delete();
                    foreach ($radioOptions as $option) {
                        $this->masterService->create('radio-options', [
                            'question_id' => $id,
                            'text' => $option,
                        ]);
                    }
                } else {
                    $this->radioOption->where('question_id', $id)->delete();
                }

                return response()->json([
                    'status' => true,
                    'message' => "$type updated",
                    'result' => $updatedQuestion->load('radioOptions')
                ], Response::HTTP_OK);
            } catch (\Exception $e) {
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to update question: ' . $e->getMessage()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        } else {
            $data = $request->all();
            $result = $this->masterService->update($type, $id, $data);
            return response()->json(['status' => true, 'message' => "$type updated", 'result' => $result], Response::HTTP_OK);
        }
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
        if ($type === 'support-strategies') {
            try {
                $questions = $this->question->where('support_strategy_id', $id)->get();

                foreach ($questions as $question) {
                    if ($question->type === 'radio') {
                        $this->radioOption->where('question_id', $question->id)->delete();
                    }
                    $this->masterService->delete('questions', $question->id);
                }

                $this->masterService->delete($type, $id);
                return response()->json(['status' => true, 'message' => "support strategies deleted"], Response::HTTP_OK);
            } catch (\Exception $e) {
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to delete support strategy: ' . $e->getMessage()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        } elseif ($type === 'questions') {
            try {
                $question = $this->masterService->getById($type, $id);

                if ($question && $question->type === 'radio') {
                    $this->radioOption->where('question_id', $id)->delete();
                }

                $this->masterService->delete($type, $id);
                return response()->json(['status' => true, 'message' => "$type deleted"], Response::HTTP_OK);
            } catch (\Exception $e) {
                return response()->json([
                    'status' => false,
                    'message' => 'Failed to delete question: ' . $e->getMessage()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        } else {
            $this->masterService->delete($type, $id);
            return response()->json(['status' => true, 'message' => "$type deleted"], Response::HTTP_OK);
        }
    }

    private function changeImportHeader($type)
    {
        return [
            'class' => ['level' => 'level_id'],
            'students' => ['class' => 'class_id'],
            'checkins' => ['student' => 'student_id', 'activity' => 'activity_id'],
            'questions' => ['support_strategy' => 'support_strategy_id'],
        ][$type] ?? [];
    }

    private function getForeignKeys($type)
    {
        return [
            'class' => ['level_id' => 'levels'],
            'students' => ['class_id' => 'class'],
            'checkins' => ['student_id' => 'students', 'activity_id' => 'activities'],
            'questions' => ['support_strategy_id' => 'support_strategies'],
        ][$type] ?? [];
    }

    private function extractFieldFromUniqueError($errorMessage, $type)
    {
        $uniqueFields = [
            'class' => 'name',
            'levels' => 'name',
            'activities' => 'name',
            'support_strategies' => 'name',
        ];

        $field = $uniqueFields[$type] ?? 'name';

        if (preg_match("/for key '.*\.([^.]+)_unique'/", $errorMessage, $matches)) {
            $field = $matches[1];
        }

        return $field;
    }
}
