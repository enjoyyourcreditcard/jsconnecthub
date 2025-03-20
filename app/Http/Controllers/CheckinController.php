<?php

namespace App\Http\Controllers;

use App\Models\Checkin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class CheckinController extends Controller
{
    public function checkin(Request $request) : JsonResponse {
        $request->validate([
            'student_id'    => ['required', 'exists:students,id'],
            'reason'        => ['nullable', 'string'],
        ]);

        $isCheckedIn = Checkin::whereDate('checkin_time', Carbon::today())
            ->where([ ['student_id', $request->student_id], ['checkout_time', null]])
            ->first() ? true : false;

        if ($isCheckedIn) {
            return New JsonResponse([
                'message' => 'Already check-in!'
            ], 200);
        }

        $checkin = Checkin::create([
            'student_id'   => $request->student_id,
            'checkin_time' => now(),
            'reason'       => $request->reason
        ]);

        return New JsonResponse([
            'message'   => 'Check-in successful!',
            'data'      => [
                'student'   => $checkin->student->name,
                'class'     => $checkin->student->dataClass->name,
                'level'     => $checkin->student->dataClass->level->name,
                'checkin'   => $checkin->checkin_time
            ]
        ], 201);
    }

    public function checkout(Request $request) : JsonResponse {

        return New JsonResponse([
            'message' => 'Check-out successful!'
        ], 200);
    }
}
