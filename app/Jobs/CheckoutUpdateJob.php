<?php

namespace App\Jobs;

use App\Models\Checkin;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CheckoutUpdateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $checkinId;

    public function __construct($checkinId)
    {
        $this->checkinId = $checkinId;
    }

    public function handle(): void
    {
        $checkin = Checkin::find($this->checkinId);

        if (!$checkin || $checkin->checkout_time) {
            return;
        }

        $checkin->checkout_time = now();
        $checkin->save();

        Log::info('CheckoutUpdateJob: Checkout done', [
            'checkin_id' => $this->checkinId,
        ]);
    }
}
