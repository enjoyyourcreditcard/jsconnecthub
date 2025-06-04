<?php

namespace App\Console\Commands;

use App\Models\Checkin;
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
        Checkin::whereNull('checkout_time')->update([
            'checkout_time' => now()
        ]);

        $this->info('Data updated successfully.');
    }
}
