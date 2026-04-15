<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\SocialAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

// Routes that need session (for Sanctum SPA authentication)
Route::middleware(['web'])->group(function () {
    // Get CSRF Token (wajib dipanggil sebelum login/register dari SPA)
    Route::get('/csrf-cookie', function () {
        return response()->json(['message' => 'CSRF cookie set']);
    });

    // Authentication
    Route::prefix('auth')->group(function () {
        // Email/Password Auth
        Route::post('/register', [RegisteredUserController::class, 'store']);
        Route::post('/login', [AuthenticatedSessionController::class, 'login']);

        // Google OAuth
        Route::get('/google', [SocialAuthController::class, 'redirectToGoogle']);
        Route::get('/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);

        // Microsoft OAuth (optional)
        // Route::get('/microsoft', [SocialAuthController::class, 'redirectToMicrosoft']);
        // Route::get('/microsoft/callback', [SocialAuthController::class, 'handleMicrosoftCallback']);
    });
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Authentication Required)
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'auth:sanctum'])->group(function () {
    // Auth User Info & Logout
    Route::get('/user', [AuthenticatedSessionController::class, 'user']);
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    // TODO: Add other protected routes here
    // Route::apiResource('journals', JournalController::class);
    // Route::apiResource('universities', UniversityController::class);
});
