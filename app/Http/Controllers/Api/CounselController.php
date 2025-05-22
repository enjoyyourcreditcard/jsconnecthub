<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Services\MasterService;
use Illuminate\Support\Facades\DB;

class CounselController extends Controller
{
    public function __construct(MasterService $masterService)
    {
        $this->masterService = $masterService;
    }

    public function submit(Request $request)
    {
        $validatedData = $request->validate(config('constants.MASTER_VALIDATION_ARRAY.COUNSEL_VALIDATION'));

        DB::beginTransaction();
        try {
            $counsel = $this->masterService->create('counsels', [
                'student_id' => $validatedData['student_id'],
                'support_strategy_id' => $validatedData['support_strategy_id'],
            ]);

            foreach ($validatedData['question_id'] as $i => $questionId) {
                $question = $this->masterService->getById('questions', $questionId);
                $answerData = [
                    'result_id' => $counsel->id,
                    'question_id' => $questionId,
                ];

                if ($question->type === 'radio') {
                    $answerData['radio_option_id'] = $validatedData['answer'][$i];
                } else {
                    $answerData['text'] = $validatedData['answer'][$i];
                }

                $this->masterService->create('answers', $answerData);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Counsel created',
                'result' => $counsel->load('answers')
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to create counsel: ' . $e->getMessage()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
