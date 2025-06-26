<?php

namespace App\Console\Commands;

use App\Jobs\CheckoutUpdateJob;
use Illuminate\Console\Command;

class CheckoutCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:checkout-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto checkout every 6PM';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        CheckoutUpdateJob::dispatch();

        $this->info('CheckoutUpdateJob dispatched.');
    }
}
