<?php

namespace App\Observers;

use Exception;
use Carbon\Carbon;
use App\Models\Checkin;
use App\Jobs\CheckoutUpdateJob;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;

class CheckinObserver
{
    public function created(Checkin $checkin)
    {
        try {
            $this->dispatchCheckoutJob($checkin);
        } catch (Exception $e) {
            Log::error('CheckinObserver: Failed to dispatch job on created', [
                'checkin_id' => $checkin->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function updated(Checkin $checkin)
    {
        try {
            if ($checkin->wasChanged('checkout_time')) {
                if (!is_null($checkin->checkout_time)) {
                    $this->cancelCheckoutJob($checkin);
                } else {
                    $this->dispatchCheckoutJob($checkin);
                }
            }
        } catch (Exception $e) {
            Log::error('CheckinObserver: Failed to handle updated event', [
                'checkin_id' => $checkin->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function deleted(Checkin $checkin)
    {
        try {
            $this->cancelCheckoutJob($checkin);
            $checkin->delete();
        } catch (Exception $e) {
            Log::error('CheckinObserver: Failed to handle deleted event', [
                'checkin_id' => $checkin->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    protected function dispatchCheckoutJob(Checkin $checkin)
    {
        $userTime = Carbon::createFromTime(18, 0, 0, $checkin->timezone);
        $utcTime = $userTime->copy()->setTimezone('UTC');

        $job = (new CheckoutUpdateJob($checkin->id))->onQueue('default');
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
                'available_at' => $utcTime->timestamp,
                'created_at' => now()->timestamp,
            ]);
        } else {
            $jobId = uniqid('checkin_' . $checkin->id . '_');
            Queue::later($utcTime, $job);
        }

        $checkin->job_id = $jobId;
        $checkin->saveQuietly();

        Log::info('CheckinObserver: CheckoutUpdateJob dispatched', [
            'checkin_id' => $checkin->id,
            'job_id' => $jobId,
            'user_time' => $userTime->toDateTimeString(),
            'utc_time' => $utcTime->toDateTimeString(),
        ]);
    }

    protected function cancelCheckoutJob(Checkin $checkin)
    {
        if ($checkin->job_id && config('queue.default') === 'database') {
            try {
                $deleted = DB::table('jobs')->where('id', $checkin->job_id)->delete();
                if ($deleted) {
                    Log::info('CheckinObserver: Job removed from queue', [
                        'checkin_id' => $checkin->id,
                        'job_id' => $checkin->job_id
                    ]);
                } else {
                    Log::warning('CheckinObserver: Job not found in queue', [
                        'checkin_id' => $checkin->id,
                        'job_id' => $checkin->job_id
                    ]);
                }
            } catch (Exception $e) {
                Log::error('CheckinObserver: Failed to remove job from queue', [
                    'checkin_id' => $checkin->id,
                    'job_id' => $checkin->job_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        if ($checkin->job_id) {
            $checkin->job_id = null;
            $checkin->saveQuietly();
        }
    }
}
