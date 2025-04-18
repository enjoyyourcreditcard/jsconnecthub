<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Result;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CounselController extends Controller
{
    public function submit(Request $request)
    {
        $validatedData = $request->validate([
            'student_id'            => ['required', 'exists:students,id'],
            'support_strategy_id'   => ['required', 'array', 'max:3'],
            'support_strategy_id.*' => ['required', 'exists:support_strategies,id'],
            'question_id'           => ['required', 'array'],
            'question_id.*'         => ['required', 'exists:questions,id'],
            'answer'                => ['required', 'array'],
            'answer.*'              => ['nullable', 'string']
        ]);

        $result = new Result;

        $result->student_id = $validatedData['student_id'];

        $result->save();

        for ($i = 0; $i < count($validatedData['question_id']); $i++) {
            $answer = new Answer;

            $answer->result_id = $result->id;

            $answer->question_id = $validatedData['question_id'][$i];

            $answer->text = $validatedData['answer'][$i];

            $answer->save();
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Counsel submitted!',
            'data'      => $result->load('student.class.level', 'answers.question')
        ], Response::HTTP_OK);
    }
}
