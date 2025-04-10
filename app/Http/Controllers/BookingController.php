<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

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
            'end_time'      => ['required', 'date_format:Y-m-d H:i:s']
        ]);

        $booking = new Booking;

        $booking->student_id = $request->student_id;

        $booking->facility_id = $request->facility_id;

        $booking->start_time = $request->start_time;

        $booking->end_time = $request->end_time;

        $booking->save();

        return response()->json(['status' => true, 'message' => 'Booking successful!', 'result' => $booking->load('student', 'facility')], Response::HTTP_OK);
    }

    public function confirm(Int $id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['status' => false, 'message' => 'Booking not found.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($booking->status == 'cancelled') {
            return response()->json(['status' => false, 'message' => 'Booking already cancelled.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $booking->status = 'confirmed';

        $booking->save();

        return response()->json(['status' => true, 'message' => 'Booking confirmed!'], Response::HTTP_OK);
    }

    public function cancel(Int $id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['status' => false, 'message' => 'Booking not found.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($booking->status == 'cancelled') {
            return response()->json(['status' => false, 'message' => 'Booking already cancelled.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($booking->status == 'closed') {
            return response()->json(['status' => false, 'message' => 'Booking already closed.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $booking->status = 'cancelled';

        $booking->save();

        return response()->json(['status' => true, 'message' => 'Booking cancelled!'], Response::HTTP_OK);
    }
}
