<?php

namespace App\Observers;

use App\Jobs\CloseBookingJob;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Exception;

class BookingObserver
{
    public function created(Booking $booking)
    {
        try {
            $this->dispatchCloseBookingJob($booking);
        } catch (Exception $e) {
            Log::error('BookingObserver: Failed to dispatch job on created', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function updated(Booking $booking)
    {
        try {
            if ($booking->wasChanged('status') && in_array($booking->status, ['cancelled', 'closed'])) {
                $this->cancelCloseBookingJob($booking);
                return;
            }

            if (
                $booking->wasChanged(['end_time', 'status']) &&
                in_array($booking->status, ['requested', 'reserved'])
            ) {
                $this->cancelCloseBookingJob($booking);
                $this->dispatchCloseBookingJob($booking);
            }
        } catch (Exception $e) {
            Log::error('BookingObserver: Failed to handle updated event', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    protected function dispatchCloseBookingJob(Booking $booking)
    {
        $endTime = Carbon::parse($booking->end_time);
        if (!$endTime->isValid()) {
            Log::error('BookingObserver: Invalid end_time', [
                'booking_id' => $booking->id,
                'end_time' => $booking->end_time
            ]);
            return;
        }

        $jobId = uniqid('booking_' . $booking->id . '_');
        $booking->job_id = $jobId;
        $booking->saveQuietly();

        if ($endTime->isPast()) {
            CloseBookingJob::dispatch($booking->id)->onQueue('default');
        } else {
            CloseBookingJob::dispatch($booking->id)
                ->onQueue('default')
                ->delay($endTime);
        }
    }

    protected function cancelCloseBookingJob(Booking $booking)
    {
        if ($booking->job_id) {
            $booking->job_id = null;
            $booking->saveQuietly();
        }
    }
}
