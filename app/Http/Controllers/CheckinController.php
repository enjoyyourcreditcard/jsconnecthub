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
                'message' => 'You have already checked in. Please check out before attempting to check in again.'
            ], 422);
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
        $request->validate([
            'student_id' => ['required', 'exists:students,id']
        ]);

        $checkin = Checkin::whereDate('checkin_time', Carbon::today())
            ->where([ ['student_id', $request->student_id]])
            ->orderBy('checkin_time', 'desc')
            ->first();

        $isCheckedIn = $checkin ? true : false;

        if (!$isCheckedIn) {
            return New JsonResponse([
                'message' => 'You have not checked in yet. Please check in first.'
            ], 422);
        }

        if ($checkin->checkout_time) {
            return response()->json([
                'message' => 'You have already checked out.'
            ], 422);
        }

        $checkin->checkout_time = now();
        $checkin->save();

        return New JsonResponse([
            'message' => 'Check-out successful!',
            'data'      => [
                'student'   => $checkin->student->name,
                'class'     => $checkin->student->dataClass->name,
                'level'     => $checkin->student->dataClass->level->name,
                'checkin'   => $checkin->checkin_time,
                'checkout'  => $checkin->checkout_time
            ]
        ], 200);
    }
}
