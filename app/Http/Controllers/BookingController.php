<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:bookings confirm', ['only' => ['confirm']]);
    }

    public function store(Request $request)
    {
        $rules = config('constants.MASTER_VALIDATION_ARRAY.BOOKING_MASTER_VALIDATION');
        $validation = Validator::make($request->all(), $rules);
        if ($validation->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation errors',
                'errors' => $validation->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $booking = new Booking;
        $booking->student_id = $request->student_id;
        $booking->facility_id = $request->facility_id;
        $booking->start_time = $request->start_time;
        $booking->end_time = $request->end_time;
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

        // $this->sendToSocket();

        return response()->json([
            'status' => true,
            'message' => 'Booking confirmed!',
            'result' => $booking
        ], Response::HTTP_OK);
    }

    private function sendToSocket($param = null)
    {
        $client = new Client();

        $socketAddress = env('APP_SOCKET_URL') . '/booking-confirmation';

        $client->post($socketAddress, [
            'json' => ['data' => $param]
        ]);
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
