<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:bookings confirm', ['only' => ['confirm']]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id'    => ['required', 'exists:students,id'],
            'facility_id'   => ['required', 'exists:facilities,id'],
            'start_time'    => ['required', 'date_format:Y-m-d H:i:s'],
            'end_time'      => ['required', 'date_format:Y-m-d H:i:s', 'after:start_time'],
        ]);

        $booking = new Booking;
        $booking->student_id = $request->student_id;
        $booking->facility_id = $request->facility_id;
        $booking->start_time = $request->start_time;
        $booking->end_time = $request->end_time;
        $booking->status = 'requested';
        $booking->save();

        return response()->json([
            'status' => true,
            'message' => 'Booking successful!',
            'result' => $booking->load('student.class.level', 'facility')
        ], Response::HTTP_OK);
    }

    public function confirm(int $id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'status' => false,
                'message' => 'Booking not found.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($booking->status === 'cancelled') {
            return response()->json([
                'status' => false,
                'message' => 'Booking already cancelled.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($booking->status === 'closed') {
            return response()->json([
                'status' => false,
                'message' => 'Booking already closed.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $booking->status = 'reserved';
        $booking->save();

        return response()->json([
            'status' => true,
            'message' => 'Booking confirmed!',
            'result' => $booking
        ], Response::HTTP_OK);
    }

    public function cancel(int $id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'status' => false,
                'message' => 'Booking not found.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($booking->status === 'cancelled') {
            return response()->json([
                'status' => false,
                'message' => 'Booking already cancelled.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($booking->status === 'closed') {
            return response()->json([
                'status' => false,
                'message' => 'Booking already closed.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $booking->status = 'cancelled';
        $booking->save();

        return response()->json([
            'status' => true,
            'message' => 'Booking cancelled!',
            'result' => $booking
        ], Response::HTTP_OK);
    }
}
