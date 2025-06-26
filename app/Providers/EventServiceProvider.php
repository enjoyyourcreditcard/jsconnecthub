<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Checkin;
use App\Observers\BookingObserver;
use App\Observers\CheckinObserver;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // other events...
    ];

    public function boot()
    {
        Booking::observe(BookingObserver::class);
        Checkin::observe(CheckinObserver::class);
    }
}
