<?php

namespace App\Jobs;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CloseBookingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $bookingId;

    public function __construct(int $bookingId)
    {
        $this->bookingId = $bookingId;
    }

    public function handle()
    {
        $booking = Booking::find($this->bookingId);
        $endTime = Carbon::parse($booking->end_time);
        if (!$endTime->isValid()) {
            return;
        }

        if (
            in_array($booking->status, ['requested', 'reserved']) &&
            $endTime->isPast()
        ) {
            $booking->status = $booking->status === 'reserved' ? 'closed' : 'ignored';
            $booking->job_id = null;
            $booking->save();
        }
    }
}
