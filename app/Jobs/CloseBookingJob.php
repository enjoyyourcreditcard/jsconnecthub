<?php

namespace App\Jobs;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CloseBookingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $bookingId;

    public function __construct($bookingId)
    {
        $this->bookingId = $bookingId;
    }

    public function handle()
    {
        $booking = Booking::find($this->bookingId);

        if (!$booking) {
            Log::warning('CloseBookingJob: Booking not found', [
                'booking_id' => $this->bookingId
            ]);
            return;
        }

        $booking->status = $booking->status === 'reserved' ? 'closed' : 'ignored';
        $booking->save();

        Log::info('CloseBookingJob: Booking closed', [
            'booking_id' => $this->bookingId
        ]);
    }
}
