<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpException;

class Handler extends ExceptionHandler
{
    public function register(): void
    {
        $this->renderable(function (HttpException $e, $request) {
            if ($e->getStatusCode() === 403) {
                if ($request->wantsJson() || $request->is('api/*')) {
                    return response()->json(['message' => 'Forbidden'], 403);
                }

                return Inertia::render('Errors/403')->toResponse($request)->setStatusCode(403);
            }
        });
    }
}
