<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-harvest semua jurnal dengan OAI-PMH URL setiap hari pukul 02:00 WIB
// Membutuhkan cron: * * * * * cd /var/www/jurnal_mu && php artisan schedule:run >> /dev/null 2>&1
Schedule::command('journals:harvest-articles --all')
    ->dailyAt('02:00')
    ->timezone('Asia/Jakarta')
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/auto-harvest.log'));

// Refresh featured journals cache setiap hari pada tengah malam (00:00 WIB)
Schedule::command('journals:refresh-featured')
    ->dailyAt('00:00')
    ->timezone('Asia/Jakarta')
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/refresh-featured.log'));
