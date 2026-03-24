<?php

use App\Http\Controllers\Admin\AccreditationTemplateController;
use App\Http\Controllers\Admin\AdminKampusController;
use App\Http\Controllers\Admin\AssessmentController as AdminAssessmentController;
use App\Http\Controllers\Admin\DataMasterController;
use App\Http\Controllers\Admin\EssayQuestionController;
use App\Http\Controllers\Admin\EvaluationCategoryController;
use App\Http\Controllers\Admin\EvaluationIndicatorController;
use App\Http\Controllers\Admin\EvaluationSubCategoryController;
use App\Http\Controllers\Admin\PembinaanController as AdminPembinaanController;
use App\Http\Controllers\Admin\UniversityController;
use App\Http\Controllers\AdminKampus\AssessmentController as AdminKampusAssessmentController;
use App\Http\Controllers\AdminKampus\JournalApprovalController;
use App\Http\Controllers\AdminKampus\PembinaanController as AdminKampusPembinaanController;
use App\Http\Controllers\AdminKampus\ReviewerController;
use App\Http\Controllers\AdminKampus\UserApprovalController;
use App\Http\Controllers\AdminKampus\UserController as AdminKampusUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Dikti\AssessmentController as DiktiAssessmentController;
use App\Http\Controllers\ResourcesController;
use App\Http\Controllers\ReviewerController as MainReviewerController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\User\AssessmentController;
use App\Http\Controllers\User\JournalController as UserJournalController;
use App\Http\Controllers\User\PembinaanController as UserPembinaanController;
use App\Http\Controllers\User\ProfilController;
use App\Models\Role;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Storage File Serving
|--------------------------------------------------------------------------
|
| Serves files stored on the "public" disk (storage/app/public/).
| This route is required because PHP's built-in dev server (artisan serve)
| does not follow Windows directory junctions, so the public/storage
| junction is not traversed for static files. This route streams files
| directly from the storage layer, bypassing the junction entirely.
|
| In production (Apache/Nginx), the web server serves these files
| directly from the public/storage symlink before PHP is invoked,
| so this route is never reached and adds zero overhead.
*/
Route::get('/storage/{path}', function (string $path) {
    // Basic path hardening: reject traversal, backslashes, and absolute paths
    if (str_contains($path, '..') || str_contains($path, '\\') || str_starts_with($path, '/')) {
        abort(400);
    }

    try {
        if (! Storage::disk('public')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public')->response($path);
    } catch (\Throwable $e) {
        // Avoid leaking storage layer errors
        abort(404);
    }
})->where('path', '.+')->name('storage.serve');

//  Laman Page
Route::get('/', function () {
    // Get featured journals (SINTA 1-2, with cover images)
    $featuredJournals = \App\Models\Journal::with(['university', 'scientificField'])
        ->where('is_active', true)
        ->whereNotNull('sinta_rank')
        ->whereIn('sinta_rank', [1, 2])
        ->orderBy('sinta_rank')
        ->limit(4)
        ->get()
        ->map(fn ($journal) => [
            'id' => $journal->id,
            'title' => $journal->title,
            'sinta_rank' => $journal->sinta_rank,
            'sinta_rank_label' => $journal->sinta_rank_label,
            'issn' => $journal->issn,
            'e_issn' => $journal->e_issn,
            'university' => $journal->university->name ?? 'Unknown',
            'cover_image_url' => $journal->cover_image_url,
            'indexation_labels' => $journal->indexation_labels,
        ]);

    // Get SINTA statistics
    $sintaStats = [];
    for ($rank = 1; $rank <= 6; $rank++) {
        $sintaStats[$rank] = \App\Models\Journal::where('is_active', true)
            ->where('sinta_rank', $rank)
            ->count();
    }

    // Get total universities and journals
    $totalUniversities = \App\Models\University::where('is_active', true)->count();
    $totalJournals = \App\Models\Journal::where('is_active', true)->count();

    return Inertia::render('welcome', [
        'featuredJournals' => $featuredJournals,
        'sintaStats' => $sintaStats,
        'totalUniversities' => $totalUniversities,
        'totalJournals' => $totalJournals,
    ]);
})->name('home');

/*
|--------------------------------------------------------------------------
| Public Journals Routes
|--------------------------------------------------------------------------
*/

// Public access to view journals
Route::get('/journals', [\App\Http\Controllers\PublicJournalController::class, 'index'])
    ->name('journals.index');
Route::get('/journals/{journal}', [\App\Http\Controllers\PublicJournalController::class, 'show'])
    ->name('journals.show');

// Browse journals by university
Route::get('/browse/universities', [\App\Http\Controllers\PublicJournalController::class, 'browseUniversities'])
    ->name('browse.universities');

/*
|--------------------------------------------------------------------------
| Guest Routes (Redirect jika sudah login)
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    // Login
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    // Register
    Route::get('/register', [RegisteredUserController::class, 'create'])
        ->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);

    // Google OAuth
    Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle'])
        ->name('auth.google');
    Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback'])
        ->name('auth.google.callback');
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

// Protected routes (harus login)
Route::middleware(['auth'])->group(function () {
    // Logout
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Super Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::SUPER_ADMIN])->prefix('admin')->name('admin.')->group(function () {

        // Data Master (Placeholder)
        Route::get('data-master', [DataMasterController::class, 'index'])
            ->name('data-master.index');

        // Borang Indikator (Using Accreditation Templates System)
        Route::get('borang-indikator', [AccreditationTemplateController::class, 'index'])
            ->name('borang-indikator.index');

        /*
        |--------------------------------------------------------------------------
        | v1.1 Hierarchical Assessment System (NEW)
        |--------------------------------------------------------------------------
        */

        // Borang Indikator List View (Hierarchical)
        Route::get('borang-indikator/list', [AccreditationTemplateController::class, 'listView'])
            ->name('borang-indikator.list');

        // Accreditation Templates Management
        Route::resource('templates', AccreditationTemplateController::class);
        Route::post('templates/{template}/clone', [AccreditationTemplateController::class, 'clone'])
            ->name('templates.clone');
        Route::post('templates/{template}/toggle', [AccreditationTemplateController::class, 'toggleActive'])
            ->name('templates.toggle');
        Route::get('templates/{template}/structure', [AccreditationTemplateController::class, 'structure'])
            ->name('templates.structure');
        Route::get('templates/{template}/tree', [AccreditationTemplateController::class, 'tree'])
            ->name('templates.tree');

        // Evaluation Categories Management (Level 1 - Unsur Evaluasi)
        Route::resource('categories', EvaluationCategoryController::class);
        Route::post('categories/reorder', [EvaluationCategoryController::class, 'reorder'])
            ->name('categories.reorder');

        // Evaluation Sub-Categories Management (Level 2 - Sub-Unsur)
        Route::resource('sub-categories', EvaluationSubCategoryController::class);
        Route::post('sub-categories/{subCategory}/move', [EvaluationSubCategoryController::class, 'move'])
            ->name('sub-categories.move');
        Route::post('sub-categories/reorder', [EvaluationSubCategoryController::class, 'reorder'])
            ->name('sub-categories.reorder');

        // Essay Questions Management (linked to Categories)
        Route::resource('essays', EssayQuestionController::class);
        Route::post('essays/{essay}/toggle', [EssayQuestionController::class, 'toggleActive'])
            ->name('essays.toggle');
        Route::post('essays/reorder', [EssayQuestionController::class, 'reorder'])
            ->name('essays.reorder');

        // Evaluation Indicators Management (v1.1 hierarchical + v1.0 legacy)
        Route::resource('indicators', EvaluationIndicatorController::class);
        Route::post('indicators/{indicator}/migrate', [EvaluationIndicatorController::class, 'migrate'])
            ->name('indicators.migrate');
        Route::post('indicators/reorder', [EvaluationIndicatorController::class, 'reorder'])
            ->name('indicators.reorder');

        /*
        |--------------------------------------------------------------------------
        | v1.0 Legacy Routes
        |--------------------------------------------------------------------------
        */

        // Universities Management
        Route::resource('universities', UniversityController::class);
        Route::post('universities/{university}/toggle-active', [UniversityController::class, 'toggleActive'])
            ->name('universities.toggle-active');

        // Admin Kampus Management
        Route::resource('admin-kampus', AdminKampusController::class);
        Route::post('admin-kampus/{admin_kampus}/toggle-active', [AdminKampusController::class, 'toggleActive'])
            ->name('admin-kampus.toggle-active');

        // Users (Pengelola Jurnal) Management
        Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
        Route::post('users/{user}/toggle-active', [\App\Http\Controllers\Admin\UserController::class, 'toggleActive'])
            ->name('users.toggle-active');

        // LPPM Admin Approval Routes
        Route::post('users/{user}/approve-lppm', [\App\Http\Controllers\Admin\LppmApprovalController::class, 'approve'])
            ->name('users.approve-lppm');
        Route::post('users/{user}/reject-lppm', [\App\Http\Controllers\Admin\LppmApprovalController::class, 'reject'])
            ->name('users.reject-lppm');
        Route::post('users/{user}/revert-lppm', [\App\Http\Controllers\Admin\LppmApprovalController::class, 'revert'])
            ->name('users.revert-lppm');

        // Reviewer Management (v1.1 - Placeholder)
        Route::get('reviewers', [\App\Http\Controllers\Admin\ReviewerController::class, 'index'])
            ->name('reviewers.index');

        // View all journals (read-only for monitoring)
        Route::get('journals', [\App\Http\Controllers\Admin\JournalController::class, 'index'])
            ->name('journals.index');
        Route::get('journals/{journal}', [\App\Http\Controllers\Admin\JournalController::class, 'show'])
            ->name('journals.show');

        // View all assessments (read-only for monitoring)
        Route::get('assessments', [AdminAssessmentController::class, 'index'])
            ->name('assessments.index');

        // Pembinaan Management (v1.1)
        Route::prefix('pembinaan')->name('pembinaan.')->group(function () {
            Route::get('/', [AdminPembinaanController::class, 'index'])
                ->name('index');
            Route::get('create', [AdminPembinaanController::class, 'create'])
                ->name('create');
            Route::post('/', [AdminPembinaanController::class, 'store'])
                ->name('store');
            Route::get('{pembinaan}', [AdminPembinaanController::class, 'show'])
                ->name('show');
            Route::get('{pembinaan}/edit', [AdminPembinaanController::class, 'edit'])
                ->name('edit');
            Route::put('{pembinaan}', [AdminPembinaanController::class, 'update'])
                ->name('update');
            Route::delete('{pembinaan}', [AdminPembinaanController::class, 'destroy'])
                ->name('destroy');
            Route::post('{pembinaan}/toggle-status', [AdminPembinaanController::class, 'toggleStatus'])
                ->name('toggle-status');
        });

    });

    /*
    |--------------------------------------------------------------------------
    | Dikti Routes (Reviewer Assignment)
    |--------------------------------------------------------------------------
    */
    // Dikti - Reviewer Assignment for Assessments
    // NOTE: Routes are outside Super Admin middleware to be available in Ziggy for frontend
    // Authorization is enforced in the DiktiAssessmentController via policies
    Route::middleware(['auth'])->prefix('dikti')->name('dikti.')->group(function () {
        Route::prefix('assessments')->name('assessments.')->group(function () {
            Route::get('/', [DiktiAssessmentController::class, 'index'])
                ->name('index');
            Route::get('{assessment}', [DiktiAssessmentController::class, 'show'])
                ->name('show');
            Route::post('{assessment}/assign-reviewer', [DiktiAssessmentController::class, 'assignReviewer'])
                ->name('assign-reviewer');
            Route::post('{assessment}/remove-reviewer', [DiktiAssessmentController::class, 'removeReviewer'])
                ->name('remove-reviewer');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Kampus Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::ADMIN_KAMPUS])->prefix('admin-kampus')->name('admin-kampus.')->group(function () {

        // User Approval Workflow (Two-Step Approval Phase 1)
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('pending', [UserApprovalController::class, 'index'])
                ->name('pending');
            Route::post('{user}/approve', [UserApprovalController::class, 'approve'])
                ->name('approve');
            Route::post('{user}/reject', [UserApprovalController::class, 'reject'])
                ->name('reject');
            Route::post('{user}/revert', [UserApprovalController::class, 'revert'])
                ->name('revert');
        });

        // Users (Pengelola Jurnal) Management
        Route::resource('users', AdminKampusUserController::class);
        Route::post('users/{user}/toggle-active', [AdminKampusUserController::class, 'toggleActive'])
            ->name('users.toggle-active');

        // Journal Approval Workflow (Two-Step Approval Phase 2)
        Route::prefix('journals')->name('journals.')->group(function () {
            Route::get('pending', [JournalApprovalController::class, 'index'])
                ->name('pending');
            Route::post('{journal}/approve', [JournalApprovalController::class, 'approve'])
                ->name('approve');
            Route::post('{journal}/reject', [JournalApprovalController::class, 'reject'])
                ->name('reject');

            // Journal reassignment
            Route::post('{journal}/reassign', [\App\Http\Controllers\AdminKampus\JournalController::class, 'reassign'])
                ->name('reassign');

            // OAI-PMH Article Harvest (dispatches to queue)
            Route::post('{journal}/harvest', [\App\Http\Controllers\AdminKampus\JournalController::class, 'harvest'])
                ->name('harvest');
        });

        // View journals from their university
        Route::get('journals', [\App\Http\Controllers\AdminKampus\JournalController::class, 'index'])
            ->name('journals.index');
        Route::get('journals/create', [\App\Http\Controllers\AdminKampus\JournalController::class, 'create'])
            ->name('journals.create');
        Route::post('journals', [\App\Http\Controllers\AdminKampus\JournalController::class, 'store'])
            ->name('journals.store');
        Route::get('journals/{journal}', [\App\Http\Controllers\AdminKampus\JournalController::class, 'show'])
            ->name('journals.show');
        Route::get('journals/{journal}/edit', [\App\Http\Controllers\AdminKampus\JournalController::class, 'edit'])
            ->name('journals.edit');
        Route::put('journals/{journal}', [\App\Http\Controllers\AdminKampus\JournalController::class, 'update'])
            ->name('journals.update');
        Route::delete('journals/{journal}', [\App\Http\Controllers\AdminKampus\JournalController::class, 'destroy'])
            ->name('journals.destroy');

        // Cover image upload (dedicated endpoint)
        Route::patch('journals/{journal}/cover', [\App\Http\Controllers\AdminKampus\JournalController::class, 'uploadCover'])
            ->name('journals.upload-cover');

        // Import journals from CSV
        Route::get('journals/import/template', [\App\Http\Controllers\AdminKampus\JournalController::class, 'downloadTemplate'])
            ->name('journals.import.template');
        Route::get('journals/import/form', [\App\Http\Controllers\AdminKampus\JournalController::class, 'import'])
            ->name('journals.import');
        Route::post('journals/import/process', [\App\Http\Controllers\AdminKampus\JournalController::class, 'processImport'])
            ->name('journals.import.process');

        // Reviewer Management (Placeholder)
        Route::get('reviewer', [ReviewerController::class, 'index'])
            ->name('reviewer.index');

        // Pembinaan Registration Management (v1.1)
        Route::prefix('pembinaan')->name('pembinaan.')->group(function () {
            // Category-specific routes
            Route::get('akreditasi', [AdminKampusPembinaanController::class, 'indexAkreditasi'])
                ->name('akreditasi');
            Route::get('indeksasi', [AdminKampusPembinaanController::class, 'indexIndeksasi'])
                ->name('indeksasi');

            Route::get('registrations/{registration}', [AdminKampusPembinaanController::class, 'show'])
                ->name('registrations.show');
            Route::post('registrations/{registration}/approve', [AdminKampusPembinaanController::class, 'approve'])
                ->name('registrations.approve');
            Route::post('registrations/{registration}/reject', [AdminKampusPembinaanController::class, 'reject'])
                ->name('registrations.reject');
            Route::post('registrations/{registration}/assign-reviewer', [AdminKampusPembinaanController::class, 'assignReviewer'])
                ->name('registrations.assign-reviewer');
            Route::delete('assignments/{assignment}', [AdminKampusPembinaanController::class, 'removeAssignment'])
                ->name('assignments.remove');
            Route::get('reviewers', [AdminKampusPembinaanController::class, 'getReviewers'])
                ->name('reviewers');
        });

        // Review assessments from their university
        Route::prefix('assessments')->name('assessments.')->group(function () {
            Route::get('/', [AdminKampusAssessmentController::class, 'index'])
                ->name('index');
            Route::get('{assessment}', [AdminKampusAssessmentController::class, 'show'])
                ->name('show');
            Route::get('{assessment}/review', [AdminKampusAssessmentController::class, 'review'])
                ->name('review');
            Route::post('{assessment}/approve', [AdminKampusAssessmentController::class, 'approve'])
                ->name('approve');
            Route::post('{assessment}/request-revision', [AdminKampusAssessmentController::class, 'requestRevision'])
                ->name('request-revision');
        });

    });

    /*
    |--------------------------------------------------------------------------
    | User (Pengelola Jurnal) Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::USER])->prefix('user')->name('user.')->group(function () {

        // Profil (Dashboard)
        Route::get('profil', [ProfilController::class, 'index'])
            ->name('profil.index');
        Route::get('profil/edit', [ProfilController::class, 'edit'])
            ->name('profil.edit');
        Route::patch('profil/edit', [ProfilController::class, 'update'])
            ->name('profil.update');
        Route::post('profil/notifications/{id}/read', [ProfilController::class, 'markNotificationAsRead'])
            ->name('profil.notifications.read');
        Route::post('profil/notifications/read-all', [ProfilController::class, 'markAllNotificationsAsRead'])
            ->name('profil.notifications.read-all');

        // Journals Management
        Route::resource('journals', UserJournalController::class)
            ->names([
                'index' => 'journals.index',
                'create' => 'journals.create',
                'store' => 'journals.store',
                'show' => 'journals.show',
                'edit' => 'journals.edit',
                'update' => 'journals.update',
                'destroy' => 'journals.destroy',
            ]);

        // Cover image upload (dedicated endpoint)
        Route::patch('journals/{journal}/cover', [UserJournalController::class, 'uploadCover'])
            ->name('journals.upload-cover');

        // Assessments Management
        Route::prefix('assessments')->name('assessments.')->group(function () {
            Route::get('/', [AssessmentController::class, 'index'])
                ->name('index');
            Route::get('create', [AssessmentController::class, 'create'])
                ->name('create');
            Route::post('/', [AssessmentController::class, 'store'])
                ->name('store');
            Route::get('{assessment}', [AssessmentController::class, 'show'])
                ->name('show');
            Route::get('{assessment}/edit', [AssessmentController::class, 'edit'])
                ->name('edit');
            Route::put('{assessment}', [AssessmentController::class, 'update'])
                ->name('update');
            Route::delete('{assessment}', [AssessmentController::class, 'destroy'])
                ->name('destroy');
            Route::post('{assessment}/submit', [AssessmentController::class, 'submit'])
                ->name('submit');
            Route::post('{assessment}/save-draft', [AssessmentController::class, 'saveDraft'])
                ->name('save-draft');
            Route::get('attachments/{attachment}', [AssessmentController::class, 'downloadAttachment'])
                ->name('attachments.download');

            // Assessment Issues Management
            Route::prefix('{assessment}/issues')->name('issues.')->group(function () {
                Route::post('/', [\App\Http\Controllers\User\AssessmentIssueController::class, 'store'])
                    ->name('store');
                Route::put('{issue}', [\App\Http\Controllers\User\AssessmentIssueController::class, 'update'])
                    ->name('update');
                Route::delete('{issue}', [\App\Http\Controllers\User\AssessmentIssueController::class, 'destroy'])
                    ->name('destroy');
                Route::post('reorder', [\App\Http\Controllers\User\AssessmentIssueController::class, 'reorder'])
                    ->name('reorder');
            });
        });

        // Pembinaan Registration (v1.1)
        Route::prefix('pembinaan')->name('pembinaan.')->group(function () {
            // Category-specific routes
            Route::get('akreditasi', [UserPembinaanController::class, 'indexAkreditasi'])
                ->name('akreditasi');
            Route::get('indeksasi', [UserPembinaanController::class, 'indexIndeksasi'])
                ->name('indeksasi');

            Route::get('programs/{pembinaan}', [UserPembinaanController::class, 'show'])
                ->name('programs.show');
            Route::get('programs/{pembinaan}/register', [UserPembinaanController::class, 'registerForm'])
                ->name('programs.register-form');
            Route::post('programs/{pembinaan}/register', [UserPembinaanController::class, 'register'])
                ->name('programs.register');
            Route::get('registrations/{registration}', [UserPembinaanController::class, 'viewRegistration'])
                ->name('registration');
            Route::delete('registrations/{registration}', [UserPembinaanController::class, 'cancel'])
                ->name('registrations.cancel');
            Route::post('registrations/{registration}/upload', [UserPembinaanController::class, 'uploadAttachment'])
                ->name('registrations.upload');
            Route::get('attachments/{attachment}', [UserPembinaanController::class, 'downloadAttachment'])
                ->name('attachments.download');

            // Create assessment for pembinaan registration
            Route::post('registrations/{registration}/create-assessment', [UserPembinaanController::class, 'createAssessment'])
                ->name('registrations.create-assessment');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Reviewer Routes (v1.1)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::REVIEWER])->prefix('reviewer')->name('reviewer.')->group(function () {

        // Assignments Management
        Route::prefix('assignments')->name('assignments.')->group(function () {
            Route::get('/', [MainReviewerController::class, 'assignments'])
                ->name('index');
            Route::get('{assignment}', [MainReviewerController::class, 'show'])
                ->name('show');
            Route::get('{assignment}/review', [MainReviewerController::class, 'reviewForm'])
                ->name('review-form');
            Route::post('{assignment}/review', [MainReviewerController::class, 'submitReview'])
                ->name('submit-review');
            Route::get('{assignment}/attachments/{attachment}', [MainReviewerController::class, 'downloadAttachment'])
                ->name('attachments.download');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Shared Routes (All Roles)
    |--------------------------------------------------------------------------
    */

    // Support (Placeholder)
    Route::get('/support', [SupportController::class, 'index'])
        ->name('support');

    // Resources (Placeholder)
    Route::get('/resources', [ResourcesController::class, 'index'])
        ->name('resources');

    // Profile Management
    // Route::prefix('profile')->name('profile.')->group(function () {
    //     Route::get('/', [ProfileController::class, 'edit'])->name('edit');
    //     Route::patch('/', [ProfileController::class, 'update'])->name('update');
    //     Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    // });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
