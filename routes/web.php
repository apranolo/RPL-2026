<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Admin\AccreditationTemplateController;
use App\Http\Controllers\Admin\AdminKampusController;
use App\Http\Controllers\Admin\AssessmentController as AdminAssessmentController;
use App\Http\Controllers\Admin\CriteriaController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DataMasterController;
use App\Http\Controllers\Admin\EmailTemplateController;
use App\Http\Controllers\Admin\EssayQuestionController;
use App\Http\Controllers\Admin\EvaluationCategoryController;
use App\Http\Controllers\Admin\EvaluationIndicatorController;
use App\Http\Controllers\Admin\EvaluationSubCategoryController;
use App\Http\Controllers\Admin\MonevScheduleCtrl;
use App\Http\Controllers\Admin\OutputReportController;
use App\Http\Controllers\Admin\OutputVerifyCtrl;
use App\Http\Controllers\Admin\PembinaanController as AdminPembinaanController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\SettingsCtrl;
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
use App\Http\Controllers\CitationController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\ContractDocController;
use App\Http\Controllers\Copyediting\CopyeditingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Dikti\AssessmentController as DiktiAssessmentController;
use App\Http\Controllers\DiscussionController;
use App\Http\Controllers\Editorial\DecisionController;
use App\Http\Controllers\Editorial\DeskController;
use App\Http\Controllers\Editorial\PlagiarismController;
use App\Http\Controllers\FundingController;
use App\Http\Controllers\OutputController;
use App\Http\Controllers\OutputDocController;
use App\Http\Controllers\Production\GalleyController;
use App\Http\Controllers\Production\IssueController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\ProposalController;
use App\Http\Controllers\ResourcesController;
use App\Http\Controllers\Review\ReviewAssignmentController;
use App\Http\Controllers\ReviewerController as MainReviewerController;
use App\Http\Controllers\SchemaController;
use App\Http\Controllers\SubmissionWizardController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\User\AssessmentController;
use App\Http\Controllers\User\JournalController as UserJournalController;
use App\Http\Controllers\User\PembinaanController as UserPembinaanController;
use App\Http\Controllers\User\ProfilController;
use App\Http\Controllers\User\UserFundingController;
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

        return response()->file(Storage::disk('public')->path($path));
    } catch (\Throwable $e) {
        // Avoid leaking storage layer errors
        abort(404);
    }
})->where('path', '.+')->name('storage.serve');

//  Laman Page
Route::get('/', [\App\Http\Controllers\HomeController::class, 'index'])->name('home');

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

// Public access to view events
Route::get('/events', [\App\Http\Controllers\PublicEventController::class, 'index'])
    ->name('events.index');
Route::get('/events/{event}', [\App\Http\Controllers\PublicEventController::class, 'show'])
    ->name('events.show');

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

    // Dashboard Umum
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // Dashboard Author (Submissions)
    Route::get('/submission', function () {
        return Inertia::render('Submission/Index');
    })->name('submissions.index');

    // Dashboard Admin
    Route::middleware(['role:Admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'adminDashboard'])->name('dashboard');
    });

    // Dashboard Dosen
    Route::middleware(['role:Dosen'])->prefix('dosen')->name('dosen.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'dosenDashboard'])->name('dashboard');
    });

    // Dashboard Keuangan
    Route::middleware(['role:Keuangan'])->prefix('keuangan')->name('keuangan.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'keuanganDashboard'])->name('dashboard');

        // Finance Reports
        Route::prefix('finance')->name('finance.')->group(function () {
            Route::get('reports', [\App\Http\Controllers\FinanceReportController::class, 'index'])
                ->name('reports.index');
            Route::get('reports/summary', [\App\Http\Controllers\FinanceReportController::class, 'summary'])
                ->name('reports.summary');
            Route::post('reports/filter', [\App\Http\Controllers\FinanceReportController::class, 'filter'])
                ->name('reports.filter');
        });

        Route::prefix('contracts')->name('contracts.')->group(function () {
            Route::get('{contract}/upload', [ContractDocController::class, 'create'])->name('upload');
            Route::post('documents', [ContractDocController::class, 'store'])->name('documents.store');
            Route::get('documents/{document}/download', [ContractDocController::class, 'download'])->name('documents.download');
        });
    });
    /*
    |--------------------------------------------------------------------------
    | Super Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::SUPER_ADMIN])->prefix('admin')->name('admin.')->group(function () {

        // Announcement Management
        Route::match(['post', 'patch'], 'announcements/{announcement}/toggle-featured', [\App\Http\Controllers\Admin\AnnouncementController::class, 'toggleFeatured'])
            ->name('announcements.toggle-featured');
        Route::match(['post', 'patch'], 'announcements/{announcement}/toggle-active', [\App\Http\Controllers\Admin\AnnouncementController::class, 'toggleActive'])
            ->name('announcements.toggle-active');
        Route::post('announcements/{id}/restore', [\App\Http\Controllers\Admin\AnnouncementController::class, 'restore'])
            ->name('announcements.restore');
        Route::resource('announcements', \App\Http\Controllers\Admin\AnnouncementController::class);

        // Sistem Profil (Ubah Logo/Nama App)
        Route::get('settings/profile', [SettingsCtrl::class, 'index'])->name('settings.profile');
        Route::post('settings/profile', [SettingsCtrl::class, 'update'])->name('settings.profile.update');

        // Data Master (Placeholder)
        Route::get('data-master', [DataMasterController::class, 'index'])
            ->name('data-master.index');

        // Email Template Management
        Route::get('email-template', [EmailTemplateController::class, 'index'])
            ->name('email-template.index');

        Route::put('email-template/{emailTemplate}', [EmailTemplateController::class, 'update'])
            ->name('email-template.update');
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

        // Kriteria Penilaian Management (CRUD for Assessment Criteria)
        Route::resource('criteria', \App\Http\Controllers\Admin\CriteriaController::class)
            ->parameters(['criteria' => 'criterion']);

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
        Route::get('users', [\App\Http\Controllers\Admin\UserRoleController::class, 'index'])->name('users.index');
        Route::delete('users/revoke/{id}', [\App\Http\Controllers\Admin\UserRoleController::class, 'revoke'])->name('users.revoke');
        Route::resource('users', \App\Http\Controllers\Admin\UserController::class)->except(['index']);
        Route::post('users/{user}/toggle-active', [\App\Http\Controllers\Admin\UserController::class, 'toggleActive'])
            ->name('users.toggle-active');
        Route::post('users/{user}/revoke-role', [\App\Http\Controllers\Admin\UserRoleController::class, 'revoke'])
            ->name('users.revoke-role');

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

        // Reviewer Assignment
        Route::post('assign', [\App\Http\Controllers\Admin\AssignController::class, 'assign'])
            ->name('assign.store');

        Route::delete('assign/{id}', [\App\Http\Controllers\Admin\AssignController::class, 'unassign'])
            ->name('assign.unassign');

        // Schemas Management (v1.1)
        Route::resource('schema', \App\Http\Controllers\SchemaController::class);

        // Proposals Management (Admin)
        Route::prefix('proposals')->name('proposals.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\ProposalController::class, 'index'])->name('index');
            Route::post('{proposal}/approve', [\App\Http\Controllers\Admin\ProposalController::class, 'approve'])->name('approve');
            Route::post('{proposal}/reject', [\App\Http\Controllers\Admin\ProposalController::class, 'reject'])->name('reject');
        });

        // View all journals (read-only for monitoring)
        Route::get('journals', [\App\Http\Controllers\Admin\JournalController::class, 'index'])
            ->name('journals.index');
        Route::get('journals/{journal}', [\App\Http\Controllers\Admin\JournalController::class, 'show'])
            ->name('journals.show');
        Route::post('journals/{journal}/harvest', [\App\Http\Controllers\Admin\JournalController::class, 'harvest'])
            ->name('journals.harvest');

        // View all assessments (read-only for monitoring)
        Route::get('assessments', [AdminAssessmentController::class, 'index'])
            ->name('assessments.index');

        // Review Schedule Management
        Route::resource('schedules', ScheduleController::class);

        // Monev Report
        Route::get('monev/rekap-keseluruhan', [\App\Http\Controllers\Admin\MonevReportController::class, 'index'])
            ->name('monev.rekap-keseluruhan');
        Route::post('monev/decide-action', [\App\Http\Controllers\Admin\MonevReportController::class, 'decideAction'])
            ->name('monev.decide-action');

        // Rekap Hasil Penilaian (Summary)
        Route::get('reviews/summary', [AdminReviewController::class, 'summary'])
            ->name('reviews.summary');

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

        // Output Verification (Admin)
        Route::prefix('output-verify')->name('output-verify.')->group(function () {
            Route::get('/', [OutputVerifyCtrl::class, 'index'])
                ->name('index');
            Route::post('{output}', [OutputVerifyCtrl::class, 'verify'])
                ->name('verify');
        });

        // Monev Schedule Management
        Route::prefix('monev-schedules')->name('monev-schedules.')->group(function () {
            Route::get('/', [MonevScheduleCtrl::class, 'index'])
                ->name('index');
            Route::post('/', [MonevScheduleCtrl::class, 'store'])
                ->name('store');
            Route::get('pending', [MonevScheduleCtrl::class, 'pending'])
                ->name('pending');
        });

        // Contract Management
        Route::prefix('contracts')->name('contracts.')->group(function () {
            Route::post('generate', [ContractController::class, 'generate'])
                ->name('generate');
            Route::get('{contract}', [ContractController::class, 'show'])
                ->name('show');
            Route::post('{contract}/update-status', [ContractController::class, 'updateStatus'])
                ->name('update-status');
        });

        // Output Report (Rekap Luaran)
        Route::get('output/report', [OutputReportController::class, 'index'])
            ->name('output.report');
        Route::get('output/export', [OutputReportController::class, 'export'])
            ->name('output.export');
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Decision Routes (Super Admin & Admin Kampus)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::SUPER_ADMIN.','.Role::ADMIN_KAMPUS])
        ->prefix('admin')
        ->name('admin.')
        ->group(function () {
            // Skema Penelitian Management (Super Admin & Admin Kampus)
            Route::resource('schema', SchemaController::class);

            // Proposals Management (Admin Kampus & Super Admin)
            Route::prefix('proposals')->name('proposals.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\ProposalController::class, 'index'])->name('index');
                Route::post('{proposal}/approve', [\App\Http\Controllers\Admin\ProposalController::class, 'approve'])->name('approve');
                Route::post('{proposal}/reject', [\App\Http\Controllers\Admin\ProposalController::class, 'reject'])->name('reject');
            });

            // Reviewer Assignment (Admin Kampus & Super Admin)
            Route::get('reviewer/assign', [\App\Http\Controllers\Admin\AssignController::class, 'index'])->name('reviewer.assign');
            Route::post('assign', [\App\Http\Controllers\Admin\AssignController::class, 'assign'])->name('assign.store');
            Route::delete('assign/{id}', [\App\Http\Controllers\Admin\AssignController::class, 'unassign'])->name('assign.unassign');

            // Penentuan Keputusan Diterima/Ditolak (Decision)
            Route::post('decision/decide', [\App\Http\Controllers\Admin\DecisionController::class, 'decide'])
                ->name('decision.decide');

            // Admin Dashboard (LPPM)
            Route::get('dashboard', [AdminDashboardController::class, 'index'])
                ->name('dashboard');
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
            Route::post('harvest/bulk', [\App\Http\Controllers\AdminKampus\JournalController::class, 'bulkHarvest'])
                ->name('harvest.bulk');
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

        // Agenda Management
        Route::resource('events', \App\Http\Controllers\AdminKampus\AgendaController::class)
            ->except(['show'])
            ->names([
                'index' => 'events.index',
                'create' => 'events.create',
                'store' => 'events.store',
                'edit' => 'events.edit',
                'update' => 'events.update',
                'destroy' => 'events.destroy',
            ]);

        // Monev Report
        Route::get('monev/rekap-keseluruhan', [\App\Http\Controllers\Admin\MonevReportController::class, 'index'])
            ->name('monev.rekap-keseluruhan');
        Route::post('monev/decide-action', [\App\Http\Controllers\Admin\MonevReportController::class, 'decideAction'])
            ->name('monev.decide-action');

    });

    /*
    |--------------------------------------------------------------------------
    | Admin Keuangan Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::ADMIN_KEUANGAN])->prefix('finance')->name('finance.')->group(function () {
        Route::get('contracts', [ContractController::class, 'index'])
            ->name('contracts.index');

        Route::get('contracts', [ContractController::class, 'index'])
            ->name('contracts.index');

        // Funding Termin Routes
        Route::post('funding/store-termin', [\App\Http\Controllers\FundingController::class, 'storeTermin'])
            ->name('funding.store-termin');
    });

    Route::get('finance/contracts/{contract}/funding/create', [\App\Http\Controllers\FundingController::class, 'create'])
        ->middleware(['role:'.Role::ADMIN_KEUANGAN.','.Role::SUPER_ADMIN.','.Role::ADMIN_KAMPUS])
        ->name('finance.funding.create');

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

        // Editorial Desk
        Route::prefix('editorial/desk')->name('editorial.desk.')->group(function () {
            Route::get('inbox', [DeskController::class, 'inbox'])->name('inbox');
        });
        // Editorial Revision Decision
        Route::prefix('editorial/revision')->name('editorial.revision.')->group(function () {
            Route::post('editor-decision/{id}', [\App\Http\Controllers\Revision\EditorRevisionController::class, 'decide'])->name('decide');
        });
        // Copyediting Assignment
        Route::prefix('editorial/copyediting')->name('editorial.copyediting.')->group(function () {
            Route::get('assign', [CopyeditingController::class, 'index'])->name('assign.index');
            Route::post('assign', [CopyeditingController::class, 'assign'])->name('assign.store');
        });

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

        // OAI-PMH Article Harvest
        Route::post('journals/{journal}/harvest', [UserJournalController::class, 'harvest'])
            ->name('journals.harvest');

        // =====================================================
        // Issue Preview & Publish
        // =====================================================

        // Daftar Issues
        Route::get(
            'journals/{journal}/issues',
            [IssueController::class, 'index']
        )->name('production.issue.index');

        // Preview Table of Contents sebelum publish
        Route::get(
            'journals/{journal}/issues/{volume}/{issue}/preview',
            [IssueController::class, 'preview']
        )->name('production.issue.preview');

        // Publish Issue
        Route::post(
            'journals/{journal}/issues/publish/{volume}/{issue}',
            [IssueController::class, 'publish']
        )->name('production.issue.publish');

        // Back Issues
        Route::get(
            '/production/{journalId}/back-issues',
            [IssueController::class, 'backIssues']
        )->name('production.issue.back-issues');

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

        // Submission Wizard (Step 5: Confirm & Submit)
        Route::prefix('submission-wizard')->name('submission-wizard.')->group(function () {
            Route::get('{submission}/confirm', [SubmissionWizardController::class, 'confirm'])
                ->name('confirm');
            Route::post('{submission}/final-submit', [SubmissionWizardController::class, 'finalSubmit'])
                ->name('final-submit');
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

        // Funding/Pendanaan Management
        Route::prefix('funding')->name('funding.')->group(function () {
            Route::get('/', [UserFundingController::class, 'index'])
                ->name('index');
        });

        // Progress Reports (Monitoring & Evaluasi)
        Route::get('progress', [ProgressController::class, 'index'])
            ->name('progress.index');

        // ── Luaran Penelitian: CRUD ──────────────────────────────────────────
        Route::get('outputs', [OutputController::class, 'index'])->name('outputs.index');
        Route::get('outputs/create', [OutputController::class, 'create'])->name('outputs.create');
        Route::post('outputs/journal', [OutputController::class, 'storeJournal'])->name('outputs.store-journal');
        Route::get('outputs/{output}/edit', [OutputController::class, 'edit'])->name('outputs.edit');
        Route::put('outputs/{output}', [OutputController::class, 'update'])->name('outputs.update');
        Route::delete('outputs/{output}', [OutputController::class, 'destroy'])->name('outputs.destroy');
        Route::post('outputs/hki', [OutputController::class, 'storeHKI'])->name('outputs.storeHKI');
        Route::post('outputs/book', [OutputController::class, 'storeBook'])->name('outputs.storeBook');

        // ── Luaran Penelitian: Produk / Prototipe ────────────────────────────
        Route::prefix('outputs/products')->name('outputs.products.')->group(function () {
            // Submit new product output
            Route::post('/', [OutputController::class, 'storeProduct'])
                ->name('store');

            // Dedicated file upload endpoint (cover image or proof document)
            Route::post('{product}/upload', [OutputDocController::class, 'upload'])
                ->name('upload-doc');

            // Delete a specific file (cover or document)
            Route::delete('{product}/upload', [OutputDocController::class, 'destroy'])
                ->name('delete-doc');
        });
    });
});

/*
   |--------------------------------------------------------------------------
   | Production Routes (Journal Issue Management)
   |--------------------------------------------------------------------------
   */
Route::middleware(['role:'.Role::PENGELOLA_JURNAL])->prefix('production')->name('production.')->group(function () {

    // Issue Management
    Route::prefix('issues')->name('issue.')->group(function () {
        Route::get('create', [\App\Http\Controllers\Production\IssueController::class, 'create'])
            ->name('create');
        Route::post('/', [\App\Http\Controllers\Production\IssueController::class, 'store'])
            ->name('store');
        Route::get('{issue}/edit', [\App\Http\Controllers\Production\IssueController::class, 'edit'])
            ->name('edit');
        Route::put('{issue}', [\App\Http\Controllers\Production\IssueController::class, 'update'])
            ->name('update');
    });
});

/*
|--------------------------------------------------------------------------
| Review Summary & Assignment Routes (v1.1 - Multi Reviewer)
| MOCK LOKAL - hapus setelah model resmi di-merge ke development.
|--------------------------------------------------------------------------
*/
// NOTE: Authorization enforced via ProposalPolicy in the controllers.
Route::middleware(['auth'])->name('review.')->group(function () {
    // Rekap summary review multi-reviewer per proposal
    Route::get(
        'proposals/{proposal}/summary',
        [\App\Http\Controllers\Review\ReviewSummaryController::class, 'index']
    )->name('summary.index');

    // Perpanjang due date reviewer assignment
    Route::post(
        'reviewer-assignments/{reviewerAssignment}/extend-due',
        [\App\Http\Controllers\Review\ReviewAssignmentController::class, 'extendDue']
    )->name('assignment.extend-due');
});

/*
|--------------------------------------------------------------------------
| Editor Routes (v1.1 - Submission Editorial)
|--------------------------------------------------------------------------
*/
Route::middleware(['role:Editor'])->prefix('editorial')->name('editorial.')->group(function () {
    // Activity Log per submission
    Route::get('submissions/{submission}/activity-logs', [ActivityLogController::class, 'index'])
        ->name('activity-logs.index');
    Route::post('assessments/{assessment}/final-decision', [DecisionController::class, 'finalDecision'])
        ->name('final-decision');
});

Route::middleware(['auth', 'role:Editor,Super Admin'])->group(function () {
    Route::get('/editorial/desk/{id}', [DeskController::class, 'show'])->name('editorial.desk.show');

    Route::get('/editorial/decision/history/{submissionId}', [DecisionController::class, 'history'])->name('editorial.decision.history');
    Route::post('/editorial/desk/{id}/plagiarism', [PlagiarismController::class, 'store'])->name('editorial.desk.plagiarism');
    Route::post('/editorial/desk/{id}/assign-editor', [DeskController::class, 'assignEditor'])->name('editorial.desk.assign-editor');
    Route::post('/editorial/desk/{id}/desk-review', [DeskController::class, 'deskReview'])->name('editorial.desk.review');
    Route::post('/editorial/desk/{id}/final-decision', [DecisionController::class, 'finalDecision'])->name('editorial.desk.final-decision');
});

/*
|--------------------------------------------------------------------------
| Editorial - Plagiarism Check Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['role:'.Role::SUPER_ADMIN.','.Role::ADMIN_KAMPUS.','.Role::PENGELOLA_JURNAL])
    ->prefix('editorial')
    ->name('editorial.')
    ->group(function () {
        Route::get('plagiarism-check', function () {
            return Inertia::render('Editorial/Desk/Plagiarism');
        })->name('plagiarism-check.index');
        Route::post('plagiarism-check', [PlagiarismController::class, 'store'])
            ->name('plagiarism-check.store');
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

    // Review History (Modul 2)
    Route::get('/proposal/history', [\App\Http\Controllers\ReviewHistoryController::class, 'index'])
        ->name('proposal.history');
    Route::get('/proposal/review-history/{dosen?}', [\App\Http\Controllers\ReviewHistoryController::class, 'index'])
        ->name('proposal.review-history');

    Route::get('/proposal/documents/{id}/download', [ProposalController::class, 'downloadDocument'])
        ->name('proposal.documents.download');
    Route::get('/proposal/{proposal}/download', [ProposalController::class, 'downloadDocument'])
        ->name('proposal.download');

    Route::resource('proposal', ProposalController::class);

    /*
    |--------------------------------------------------------------------------
    | Author Profile Routes
    |--------------------------------------------------------------------------
    */

    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'show'])
            ->name('show');
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

    // Evaluation Routes
    Route::prefix('evaluations')->name('evaluations.')->group(function () {
        Route::get('/', [\App\Http\Controllers\EvaluationController::class, 'index'])
            ->name('index');
        Route::get('/assignments', [\App\Http\Controllers\EvaluationController::class, 'assignmentIndex'])
            ->name('assignments.index');
        Route::get('{assignment}/note', [\App\Http\Controllers\EvaluationController::class, 'note'])
            ->name('note');
        Route::post('{assignment}/submit', [\App\Http\Controllers\EvaluationController::class, 'storeNote'])
            ->name('storeNote');
        Route::post('{assignment}/status', [\App\Http\Controllers\EvaluationController::class, 'updateStatus'])
            ->name('update-status');
        Route::get('{report}', [\App\Http\Controllers\EvaluationController::class, 'showProgress'])
            ->name('show');
    });

    // Profile Management
    Route::get('profile', [\App\Http\Controllers\ReviewerProfileController::class, 'show'])
        ->name('profile.show');
    Route::post('profile', [\App\Http\Controllers\ReviewerProfileController::class, 'update'])
        ->name('profile.update');

});

/*
|--------------------------------------------------------------------------
| Production - Galley
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {

    Route::post('/production/articles/{articleId}/galleys', [GalleyController::class, 'store'])
        ->name('production.galleys.store');

    Route::post('/production/articles/{articleId}/assign-issue', [GalleyController::class, 'assignToIssue'])
        ->name('production.galleys.assignIssue');
});
/*
|--------------------------------------------------------------------------
| Funding Terms (Super Admin & Admin Kampus)
|--------------------------------------------------------------------------
*/
Route::middleware(['role:'.Role::SUPER_ADMIN.','.Role::ADMIN_KAMPUS])->group(function () {
    Route::post('funding/{funding}/upload-bukti', [FundingController::class, 'uploadBukti'])
        ->name('funding.upload-bukti');
});

/*
|--------------------------------------------------------------------------
| Finance & Funding Routes
|--------------------------------------------------------------------------
| Akses untuk Keuangan dan Admin Kampus
*/
Route::middleware(['role:Keuangan|'.Role::ADMIN_KAMPUS])->group(function () {

    // Rute untuk menampilkan halaman log perubahan termin
    Route::get('/finance/funding/logs', [\App\Http\Controllers\FundingLogController::class, 'index'])
        ->name('finance.funding.logs.index');

    // Rute BARU untuk mencetak kwitansi PDF
    Route::get('/finance/funding/{id}/print', [\App\Http\Controllers\FundingController::class, 'printKwitansi'])
        ->name('finance.funding.print-kwitansi');

});

/*
|--------------------------------------------------------------------------
| Submission Discussion Routes (v1.1)
|--------------------------------------------------------------------------
*/

Route::prefix('discussion')->name('discussion.')->group(function () {

    Route::get('/', [DiscussionController::class, 'index'])
        ->name('index');

    Route::post('/', [DiscussionController::class, 'store'])
        ->name('store');

    Route::post('/discussions/{parentMessage}/reply', [DiscussionController::class, 'reply'])
        ->name('reply');

    Route::post('/discussions/{message}/upload-attachment', [DiscussionController::class, 'uploadAttachment'])
        ->name('message.upload-attachment');
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

// Print Berita Acara Review
Route::get('/review/print/{type}/{id}', [\App\Http\Controllers\ReviewDocumentController::class, 'print'])
    ->name('review.print');

// Review History
Route::get('/proposal/review-history/{dosen?}', [\App\Http\Controllers\ReviewHistoryController::class, 'index'])
    ->name('proposal.review-history');

// Notifications (Modul 7)
// Route::prefix('notifications')->name('notifications.')->group(function () {
//     Route::get('/', [\App\Http\Controllers\NotificationController::class, 'index'])->name('index');
//     Route::post('/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllRead'])->name('read-all');
//     Route::post('/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markRead'])->name('read');
// });

Route::resource('proposal', ProposalController::class);
Route::prefix('proposal')->name('proposal.')->group(function () {
    Route::post('{proposal}/documents', [\App\Http\Controllers\DocumentController::class, 'upload'])->name('documents.store');
    Route::get('documents/{document}/download', [\App\Http\Controllers\DocumentController::class, 'download'])->name('documents.download');
});

// Citation Profile (Dosen, role User) — view & sync own Google Scholar stats
Route::middleware(['role:'.Role::USER])->prefix('profile')->name('profile.')->group(function () {
    Route::get('citation', [CitationController::class, 'show'])
        ->name('citation');
    Route::post('citation/sync', [CitationController::class, 'sync'])
        ->name('citation.sync');
});

/*
|--------------------------------------------------------------------------
| Author Profile Routes
|--------------------------------------------------------------------------
*/

Route::prefix('profile')->name('profile.')->group(function () {

    Route::get('/', [ProfileController::class, 'show'])
        ->name('show');

    Route::post('/', [ProfileController::class, 'update'])
        ->name('update');
});

// Profile Management
// Route::prefix('profile')->name('profile.')->group(function () {
//     Route::get('/', [ProfileController::class, 'edit'])->name('edit');
//     Route::patch('/', [ProfileController::class, 'update'])->name('update');
//     Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
// });
Route::middleware(['auth', 'role:PENGELOLA_JURNAL'])
    ->prefix('editorial')
    ->name('editorial.')
    ->group(function () {

        Route::post(
            '/submissions/{id_submission}/notify-author',
            [\App\Http\Controllers\Revision\RevisionController::class, 'notifyAuthor']
        )->name('revision.notify-author');

    });
Route::get('/editorial/desk/{submission}/review', [DeskController::class, 'show'])
    ->name('editorial.desk.review');

Route::post('/editorial/desk/{submission}/assign-editor', [DeskController::class, 'assignEditor'])
    ->name('editorial.desk.assign-editor');

Route::post('/editorial/desk/{submission}/desk-review', [DecisionController::class, 'deskReview'])
    ->name('editorial.desk.desk-review');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
