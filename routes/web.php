<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Review\ReviewSummaryController;
use App\Http\Controllers\Review\ReviewAssignmentController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/review/summary', [ReviewSummaryController::class, 'index'])
    ->name('review.summary');

Route::post('/review/assignments/extend-due', [ReviewAssignmentController::class, 'extendDue'])
    ->name('review.assignments.extendDue');