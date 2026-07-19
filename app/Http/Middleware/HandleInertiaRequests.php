<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $settings = Storage::disk('local')->exists('settings.json')
            ? (json_decode(Storage::disk('local')->get('settings.json'), true) ?? [
                'app_name' => config('app.name'),
                'app_logo' => null,
            ])
            : [
                'app_name' => config('app.name'),
                'app_logo' => null,
            ];

        return [
            ...parent::share($request),
            'name' => $settings['app_name'],
            'logo' => $settings['app_logo'] ? asset('storage/'.$settings['app_logo']) : null,
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ?
                    $request->user()->load(['role', 'university']) :
                    null,
                'notifications' => $request->user() ?
                    $request->user()->notifications()->orderBy('created_at', 'desc')->limit(5)->get()->map(fn ($n) => [
                        'id' => $n->id,
                        'type' => $n->type,
                        'data' => $n->data,
                        'read_at' => $n->read_at?->format('Y-m-d H:i:s'),
                        'created_at' => $n->created_at->format('Y-m-d H:i:s'),
                    ]) : [],
                'unread_notifications_count' => $request->user() ?
                    $request->user()->unreadNotifications()->count() : 0,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'csrf_token' => csrf_token(), // Add CSRF token for all Inertia requests
        ];
    }
}
