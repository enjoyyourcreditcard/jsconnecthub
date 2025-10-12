<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentLoan;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class EquipmentLoanController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:bookings confirm', ['only' => ['confirm']]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'equipment_id' => ['required', 'exists:equipment,id'],
            'student_id' => ['nullable', 'exists:students,id'],
            'user_id' => ['nullable', 'exists:users,id'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'notes' => ['nullable', 'string'],
        ]);

        if (!$request->student_id && !$request->user_id) {
            return response()->json([
                'status' => false,
                'message' => 'Either student_id or user_id is required.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $start = Carbon::parse($request->start_date)->startOfDay();
        $end = Carbon::parse($request->end_date)->endOfDay();

        if ($start->diffInDays($end) > 2) { // max 2 days
            return response()->json([
                'status' => false,
                'message' => 'Maximum loan duration is 2 days.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $equipment = Equipment::findOrFail($request->equipment_id);

        // Check availability against quantity
        $overlaps = EquipmentLoan::where('equipment_id', $equipment->id)
            ->where('status', 'reserved')
            ->where(function ($q) use ($start, $end) {
                $q->where(function ($q) use ($start, $end) {
                    $q->whereDate('start_date', '<=', $end->toDateString())
                      ->whereDate('end_date', '>=', $start->toDateString());
                });
            })
            ->count();

        if ($overlaps >= $equipment->quantity) {
            return response()->json([
                'status' => false,
                'message' => 'Equipment not available for the selected dates.',
            ], Response::HTTP_CONFLICT);
        }

        $loan = EquipmentLoan::create([
            'equipment_id' => $equipment->id,
            'student_id' => $request->student_id,
            'user_id' => $request->user_id,
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
            'status' => 'requested',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Loan requested',
            'result' => $loan->load('equipment.cca'),
        ], Response::HTTP_CREATED);
    }

    public function confirm(int $id)
    {
        $loan = EquipmentLoan::find($id);
        if (!$loan) {
            return response()->json(['status' => false, 'message' => 'Loan not found'], Response::HTTP_NOT_FOUND);
        }
        if ($loan->status === 'cancelled' || $loan->status === 'returned') {
            return response()->json(['status' => false, 'message' => 'Cannot confirm this loan'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        $loan->status = 'reserved';
        $loan->save();
        return response()->json(['status' => true, 'message' => 'Loan confirmed', 'result' => $loan], Response::HTTP_OK);
    }

    public function cancel($id)
    {
        $loan = EquipmentLoan::find($id);
        if (!$loan) {
            return response()->json(['status' => false, 'message' => 'Loan not found'], Response::HTTP_NOT_FOUND);
        }
        if ($loan->status !== 'reserved') {
            return response()->json(['status' => false, 'message' => 'Only reserved loans can be cancelled'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        $loan->status = 'cancelled';
        $loan->save();
        return response()->json(['status' => true, 'message' => 'Loan cancelled', 'result' => $loan], Response::HTTP_OK);
    }

    public function markReturned($id)
    {
        $loan = EquipmentLoan::find($id);
        if (!$loan) {
            return response()->json(['status' => false, 'message' => 'Loan not found'], Response::HTTP_NOT_FOUND);
        }
        if ($loan->status !== 'reserved') {
            return response()->json(['status' => false, 'message' => 'Only reserved loans can be marked returned'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        $loan->status = 'returned';
        $loan->save();
        return response()->json(['status' => true, 'message' => 'Loan marked as returned', 'result' => $loan], Response::HTTP_OK);
    }
}
