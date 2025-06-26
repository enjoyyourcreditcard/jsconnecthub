<?php

namespace App\Jobs;

use App\Models\Checkin;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;

class CheckoutUpdateJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Checkin::whereNull('checkout_time')->update([
            'checkout_time' => now()
        ]);

        Log::info('CheckoutUpdateJob: Checkout');
    }
}
