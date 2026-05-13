<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Enable stateful API for Sanctum SPA authentication
        $middleware->statefulApi();

        // Encrypt cookies except for appearance and sidebar state
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Add CORS for SPA - exclude API routes from CSRF verification
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        // Register middleware aliases
        $middleware->alias([
            'role' => App\Http\Middleware\CheckRole::class,
            'active' => App\Http\Middleware\EnsureUserIsActive::class,
            'journal.owner' => App\Http\Middleware\CheckJournalOwnership::class,
            'university' => App\Http\Middleware\CheckUniversity::class,
        ]);

        // Web middleware stack
        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create()
    ->usePublicPath(realpath(__DIR__.'/../'));
