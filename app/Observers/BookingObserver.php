<?php

namespace App\Observers;

use Exception;
use Carbon\Carbon;
use App\Models\Booking;
use App\Jobs\CloseBookingJob;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

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

    public function deleted(Booking $booking)
    {
        try {
            $this->cancelCloseBookingJob($booking);
            $booking->delete();
        } catch (Exception $e) {
            Log::error('BookingObserver: Failed to handle deleted event', [
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

        $job = (new CloseBookingJob($booking->id))->onQueue('default');
        $jobId = null;
        if (config('queue.default') === 'database') {
            $payload = json_encode([
                'displayName' => get_class($job),
                'job' => 'Illuminate\Queue\CallQueuedHandler@call',
                'maxTries' => $job->tries ?? null,
                'timeout' => $job->timeout ?? null,
                'data' => [
                    'commandName' => get_class($job),
                    'command' => serialize(clone $job),
                ],
            ]);

            $jobId = DB::table('jobs')->insertGetId([
                'queue' => 'default',
                'payload' => $payload,
                'attempts' => 0,
                'reserved_at' => null,
                'available_at' => $endTime->isPast() ? now()->timestamp : $endTime->timestamp,
                'created_at' => now()->timestamp,
            ]);
        } else {
            $jobId = uniqid('booking_' . $booking->id . '_');
            if ($endTime->isPast()) {
                Queue::push($job);
            } else {
                Queue::later($endTime, $job);
            }
        }

        $booking->job_id = $jobId;
        $booking->saveQuietly();
    }

    protected function cancelCloseBookingJob(Booking $booking)
    {
        if ($booking->job_id && config('queue.default') === 'database') {
            try {
                $deleted = DB::table('jobs')->where('id', $booking->job_id)->delete();
                if ($deleted) {
                    Log::info('BookingObserver: Job removed from queue', [
                        'booking_id' => $booking->id,
                        'job_id' => $booking->job_id
                    ]);
                } else {
                    Log::warning('BookingObserver: Job not found in queue', [
                        'booking_id' => $booking->id,
                        'job_id' => $booking->job_id
                    ]);
                }
            } catch (Exception $e) {
                Log::error('BookingObserver: Failed to remove job from queue', [
                    'booking_id' => $booking->id,
                    'job_id' => $booking->job_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        if ($booking->job_id) {
            $booking->job_id = null;
            $booking->saveQuietly();
        }
    }
}
