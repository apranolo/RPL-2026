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
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Dikti\AssessmentController as DiktiAssessmentController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\OutputController;
use App\Http\Controllers\ProposalController;
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

/*
|--------------------------------------------------------------------------
| Public Storage File Serving
|--------------------------------------------------------------------------
*/
Route::get('/storage/{path}', function (string $path) {
    if (str_contains($path, '..') || str_contains($path, '\\') || str_starts_with($path, '/')) {
        abort(400);
    }

    try {
        if (! Storage::disk('public')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public')->response($path);
    } catch (\Throwable $e) {
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
Route::get('/journals', [\App\Http\Controllers\PublicJournalController::class, 'index'])
    ->name('journals.index');
Route::get('/journals/{journal}', [\App\Http\Controllers\PublicJournalController::class, 'show'])
    ->name('journals.show');

Route::get('/browse/universities', [\App\Http\Controllers\PublicJournalController::class, 'browseUniversities'])
    ->name('browse.universities');

Route::get('/events', [\App\Http\Controllers\PublicEventController::class, 'index'])
    ->name('events.index');
Route::get('/events/{event}', [\App\Http\Controllers\PublicEventController::class, 'show'])
    ->name('events.show');

/*
|--------------------------------------------------------------------------
| Guest Routes
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);

    Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle'])->name('auth.google');
    Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware(['role:Admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'adminDashboard'])->name('dashboard');
    });

    Route::middleware(['role:Dosen'])->prefix('dosen')->name('dosen.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'dosenDashboard'])->name('dashboard');
    });

    Route::middleware(['role:Keuangan'])->prefix('keuangan')->name('keuangan.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'keuanganDashboard'])->name('dashboard');
    });

    /*
    |--------------------------------------------------------------------------
    | Super Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::SUPER_ADMIN])->prefix('admin')->name('admin.')->group(function () {

        Route::get('settings/profile', [SettingsCtrl::class, 'index'])->name('settings.profile');
        Route::post('settings/profile', [SettingsCtrl::class, 'update'])->name('settings.profile.update');

        Route::get('data-master', [DataMasterController::class, 'index'])->name('data-master.index');

        Route::get('borang-indikator', [AccreditationTemplateController::class, 'index'])->name('borang-indikator.index');
        Route::get('borang-indikator/list', [AccreditationTemplateController::class, 'listView'])->name('borang-indikator.list');

        Route::resource('templates', AccreditationTemplateController::class);
        Route::post('templates/{template}/clone', [AccreditationTemplateController::class, 'clone'])->name('templates.clone');
        Route::post('templates/{template}/toggle', [AccreditationTemplateController::class, 'toggleActive'])->name('templates.toggle');
        Route::get('templates/{template}/structure', [AccreditationTemplateController::class, 'structure'])->name('templates.structure');
        Route::get('templates/{template}/tree', [AccreditationTemplateController::class, 'tree'])->name('templates.tree');

        Route::resource('categories', EvaluationCategoryController::class);
        Route::post('categories/reorder', [EvaluationCategoryController::class, 'reorder'])->name('categories.reorder');

        Route::resource('sub-categories', EvaluationSubCategoryController::class);
        Route::post('sub-categories/{subCategory}/move', [EvaluationSubCategoryController::class, 'move'])->name('sub-categories.move');
        Route::post('sub-categories/reorder', [EvaluationSubCategoryController::class, 'reorder'])->name('sub-categories.reorder');

        Route::resource('essays', EssayQuestionController::class);
        Route::post('essays/{essay}/toggle', [EssayQuestionController::class, 'toggleActive'])->name('essays.toggle');
        Route::post('essays/reorder', [EssayQuestionController::class, 'reorder'])->name('essays.reorder');

        Route::resource('indicators', EvaluationIndicatorController::class);
        Route::post('indicators/{indicator}/migrate', [EvaluationIndicatorController::class, 'migrate'])->name('indicators.migrate');
        Route::post('indicators/reorder', [EvaluationIndicatorController::class, 'reorder'])->name('indicators.reorder');

        Route::resource('universities', UniversityController::class);
        Route::post('universities/{university}/toggle-active', [UniversityController::class, 'toggleActive'])->name('universities.toggle-active');

        Route::resource('admin-kampus', AdminKampusController::class);
        Route::post('admin-kampus/{admin_kampus}/toggle-active', [AdminKampusController::class, 'toggleActive'])->name('admin-kampus.toggle-active');

        Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
        Route::post('users/{user}/toggle-active', [\App\Http\Controllers\Admin\UserController::class, 'toggleActive'])->name('users.toggle-active');

        Route::post('users/{user}/approve-lppm', [\App\Http\Controllers\Admin\LppmApprovalController::class, 'approve'])->name('users.approve-lppm');
        Route::post('users/{user}/reject-lppm', [\App\Http\Controllers\Admin\LppmApprovalController::class, 'reject'])->name('users.reject-lppm');
        Route::post('users/{user}/revert-lppm', [\App\Http\Controllers\Admin\LppmApprovalController::class, 'revert'])->name('users.revert-lppm');

        Route::get('reviewers', [\App\Http\Controllers\Admin\ReviewerController::class, 'index'])->name('reviewers.index');

        Route::get('journals', [\App\Http\Controllers\Admin\JournalController::class, 'index'])->name('journals.index');
        Route::get('journals/{journal}', [\App\Http\Controllers\Admin\JournalController::class, 'show'])->name('journals.show');
        Route::post('journals/{journal}/harvest', [\App\Http\Controllers\Admin\JournalController::class, 'harvest'])->name('journals.harvest');

        Route::get('assessments', [AdminAssessmentController::class, 'index'])->name('assessments.index');

        Route::prefix('pembinaan')->name('pembinaan.')->group(function () {
            Route::get('/', [AdminPembinaanController::class, 'index'])->name('index');
            Route::get('create', [AdminPembinaanController::class, 'create'])->name('create');
            Route::post('/', [AdminPembinaanController::class, 'store'])->name('store');
            Route::get('{pembinaan}', [AdminPembinaanController::class, 'show'])->name('show');
            Route::get('{pembinaan}/edit', [AdminPembinaanController::class, 'edit'])->name('edit');
            Route::put('{pembinaan}', [AdminPembinaanController::class, 'update'])->name('update');
            Route::delete('{pembinaan}', [AdminPembinaanController::class, 'destroy'])->name('destroy');
            Route::post('{pembinaan}/toggle-status', [AdminPembinaanController::class, 'toggleStatus'])->name('toggle-status');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Dikti Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth'])->prefix('dikti')->name('dikti.')->group(function () {
        Route::prefix('assessments')->name('assessments.')->group(function () {
            Route::get('/', [DiktiAssessmentController::class, 'index'])->name('index');
            Route::get('{assessment}', [DiktiAssessmentController::class, 'show'])->name('show');
            Route::post('{assessment}/assign-reviewer', [DiktiAssessmentController::class, 'assignReviewer'])->name('assign-reviewer');
            Route::post('{assessment}/remove-reviewer', [DiktiAssessmentController::class, 'removeReviewer'])->name('remove-reviewer');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Kampus Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::ADMIN_KAMPUS])->prefix('admin-kampus')->name('admin-kampus.')->group(function () {

        Route::prefix('users')->name('users.')->group(function () {
            Route::get('pending', [UserApprovalController::class, 'index'])->name('pending');
            Route::post('{user}/approve', [UserApprovalController::class, 'approve'])->name('approve');
            Route::post('{user}/reject', [UserApprovalController::class, 'reject'])->name('reject');
            Route::post('{user}/revert', [UserApprovalController::class, 'revert'])->name('revert');
        });

        Route::resource('users', AdminKampusUserController::class);
        Route::post('users/{user}/toggle-active', [AdminKampusUserController::class, 'toggleActive'])->name('users.toggle-active');

        Route::prefix('journals')->name('journals.')->group(function () {
            Route::get('pending', [JournalApprovalController::class, 'index'])->name('pending');
            Route::post('{journal}/approve', [JournalApprovalController::class, 'approve'])->name('approve');
            Route::post('{journal}/reject', [JournalApprovalController::class, 'reject'])->name('reject');
            Route::post('{journal}/reassign', [\App\Http\Controllers\AdminKampus\JournalController::class, 'reassign'])->name('reassign');
            Route::post('harvest/bulk', [\App\Http\Controllers\AdminKampus\JournalController::class, 'bulkHarvest'])->name('harvest.bulk');
            Route::post('{journal}/harvest', [\App\Http\Controllers\AdminKampus\JournalController::class, 'harvest'])->name('harvest');
        });

        Route::get('journals', [\App\Http\Controllers\AdminKampus\JournalController::class, 'index'])->name('journals.index');
        Route::get('journals/create', [\App\Http\Controllers\AdminKampus\JournalController::class, 'create'])->name('journals.create');
        Route::post('journals', [\App\Http\Controllers\AdminKampus\JournalController::class, 'store'])->name('journals.store');
        Route::get('journals/{journal}', [\App\Http\Controllers\AdminKampus\JournalController::class, 'show'])->name('journals.show');
        Route::get('journals/{journal}/edit', [\App\Http\Controllers\AdminKampus\JournalController::class, 'edit'])->name('journals.edit');
        Route::put('journals/{journal}', [\App\Http\Controllers\AdminKampus\JournalController::class, 'update'])->name('journals.update');
        Route::delete('journals/{journal}', [\App\Http\Controllers\AdminKampus\JournalController::class, 'destroy'])->name('journals.destroy');

        Route::patch('journals/{journal}/cover', [\App\Http\Controllers\AdminKampus\JournalController::class, 'uploadCover'])->name('journals.upload-cover');

        Route::get('journals/import/template', [\App\Http\Controllers\AdminKampus\JournalController::class, 'downloadTemplate'])->name('journals.import.template');
        Route::get('journals/import/form', [\App\Http\Controllers\AdminKampus\JournalController::class, 'import'])->name('journals.import');
        Route::post('journals/import/process', [\App\Http\Controllers\AdminKampus\JournalController::class, 'processImport'])->name('journals.import.process');

        Route::get('reviewer', [ReviewerController::class, 'index'])->name('reviewer.index');

        Route::prefix('pembinaan')->name('pembinaan.')->group(function () {
            Route::get('akreditasi', [AdminKampusPembinaanController::class, 'indexAkreditasi'])->name('akreditasi');
            Route::get('indeksasi', [AdminKampusPembinaanController::class, 'indexIndeksasi'])->name('indeksasi');
            Route::get('registrations/{registration}', [AdminKampusPembinaanController::class, 'show'])->name('registrations.show');
            Route::post('registrations/{registration}/approve', [AdminKampusPembinaanController::class, 'approve'])->name('registrations.approve');
            Route::post('registrations/{registration}/reject', [AdminKampusPembinaanController::class, 'reject'])->name('registrations.reject');
            Route::post('registrations/{registration}/assign-reviewer', [AdminKampusPembinaanController::class, 'assignReviewer'])->name('registrations.assign-reviewer');
            Route::delete('assignments/{assignment}', [AdminKampusPembinaanController::class, 'removeAssignment'])->name('assignments.remove');
            Route::get('reviewers', [AdminKampusPembinaanController::class, 'getReviewers'])->name('reviewers');
        });

        Route::prefix('assessments')->name('assessments.')->group(function () {
            Route::get('/', [AdminKampusAssessmentController::class, 'index'])->name('index');
            Route::get('{assessment}', [AdminKampusAssessmentController::class, 'show'])->name('show');
            Route::get('{assessment}/review', [AdminKampusAssessmentController::class, 'review'])->name('review');
            Route::post('{assessment}/approve', [AdminKampusAssessmentController::class, 'approve'])->name('approve');
            Route::post('{assessment}/request-revision', [AdminKampusAssessmentController::class, 'requestRevision'])->name('request-revision');
        });

        Route::resource('events', \App\Http\Controllers\AdminKampus\AgendaController::class)
            ->except(['show'])
            ->names([
                'index'   => 'events.index',
                'create'  => 'events.create',
                'store'   => 'events.store',
                'edit'    => 'events.edit',
                'update'  => 'events.update',
                'destroy' => 'events.destroy',
            ]);
    });

    /*
    |--------------------------------------------------------------------------
    | User (Pengelola Jurnal) Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::USER])->prefix('user')->name('user.')->group(function () {

        Route::get('profil', [ProfilController::class, 'index'])->name('profil.index');
        Route::get('profil/edit', [ProfilController::class, 'edit'])->name('profil.edit');
        Route::patch('profil/edit', [ProfilController::class, 'update'])->name('profil.update');
        Route::post('profil/notifications/{id}/read', [ProfilController::class, 'markNotificationAsRead'])->name('profil.notifications.read');
        Route::post('profil/notifications/read-all', [ProfilController::class, 'markAllNotificationsAsRead'])->name('profil.notifications.read-all');

        Route::resource('journals', UserJournalController::class)
            ->names([
                'index'   => 'journals.index',
                'create'  => 'journals.create',
                'store'   => 'journals.store',
                'show'    => 'journals.show',
                'edit'    => 'journals.edit',
                'update'  => 'journals.update',
                'destroy' => 'journals.destroy',
            ]);

        Route::patch('journals/{journal}/cover', [UserJournalController::class, 'uploadCover'])->name('journals.upload-cover');
        Route::post('journals/{journal}/harvest', [UserJournalController::class, 'harvest'])->name('journals.harvest');

        Route::prefix('assessments')->name('assessments.')->group(function () {
            Route::get('/', [AssessmentController::class, 'index'])->name('index');
            Route::get('create', [AssessmentController::class, 'create'])->name('create');
            Route::post('/', [AssessmentController::class, 'store'])->name('store');
            Route::get('{assessment}', [AssessmentController::class, 'show'])->name('show');
            Route::get('{assessment}/edit', [AssessmentController::class, 'edit'])->name('edit');
            Route::put('{assessment}', [AssessmentController::class, 'update'])->name('update');
            Route::delete('{assessment}', [AssessmentController::class, 'destroy'])->name('destroy');
            Route::post('{assessment}/submit', [AssessmentController::class, 'submit'])->name('submit');
            Route::post('{assessment}/save-draft', [AssessmentController::class, 'saveDraft'])->name('save-draft');
            Route::get('attachments/{attachment}', [AssessmentController::class, 'downloadAttachment'])->name('attachments.download');

            Route::prefix('{assessment}/issues')->name('issues.')->group(function () {
                Route::post('/', [\App\Http\Controllers\User\AssessmentIssueController::class, 'store'])->name('store');
                Route::put('{issue}', [\App\Http\Controllers\User\AssessmentIssueController::class, 'update'])->name('update');
                Route::delete('{issue}', [\App\Http\Controllers\User\AssessmentIssueController::class, 'destroy'])->name('destroy');
                Route::post('reorder', [\App\Http\Controllers\User\AssessmentIssueController::class, 'reorder'])->name('reorder');
            });
        });

        Route::prefix('pembinaan')->name('pembinaan.')->group(function () {
            Route::get('akreditasi', [UserPembinaanController::class, 'indexAkreditasi'])->name('akreditasi');
            Route::get('indeksasi', [UserPembinaanController::class, 'indexIndeksasi'])->name('indeksasi');
            Route::get('programs/{pembinaan}', [UserPembinaanController::class, 'show'])->name('programs.show');
            Route::get('programs/{pembinaan}/register', [UserPembinaanController::class, 'registerForm'])->name('programs.register-form');
            Route::post('programs/{pembinaan}/register', [UserPembinaanController::class, 'register'])->name('programs.register');
            Route::get('registrations/{registration}', [UserPembinaanController::class, 'viewRegistration'])->name('registration');
            Route::delete('registrations/{registration}', [UserPembinaanController::class, 'cancel'])->name('registrations.cancel');
            Route::post('registrations/{registration}/upload', [UserPembinaanController::class, 'uploadAttachment'])->name('registrations.upload');
            Route::get('attachments/{attachment}', [UserPembinaanController::class, 'downloadAttachment'])->name('attachments.download');
            Route::post('registrations/{registration}/create-assessment', [UserPembinaanController::class, 'createAssessment'])->name('registrations.create-assessment');
        });

        Route::get('outputs', [OutputController::class, 'index'])->name('outputs.index');
        Route::delete('/outputs/{output}', [\App\Http\Controllers\OutputController::class, 'destroy'])->name('outputs.destroy');
        Route::get('/outputs/{output}/edit', [\App\Http\Controllers\OutputController::class, 'edit'])->name('outputs.edit');
        Route::put('/outputs/{output}', [\App\Http\Controllers\OutputController::class, 'update'])->name('outputs.update');

        Route::prefix('proposal')->name('proposal.')->group(function () {
            //
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Reviewer Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:'.Role::REVIEWER])->prefix('reviewer')->name('reviewer.')->group(function () {

        Route::prefix('assignments')->name('assignments.')->group(function () {
            Route::get('/', [MainReviewerController::class, 'assignments'])->name('index');
            Route::get('{assignment}', [MainReviewerController::class, 'show'])->name('show');
            Route::get('{assignment}/review', [MainReviewerController::class, 'reviewForm'])->name('review-form');
            Route::post('{assignment}/review', [MainReviewerController::class, 'submitReview'])->name('submit-review');
            Route::get('{assignment}/attachments/{attachment}', [MainReviewerController::class, 'downloadAttachment'])->name('attachments.download');
        });

        Route::prefix('evaluations')->name('evaluations.')->group(function () {
            Route::get('/', [\App\Http\Controllers\EvaluationController::class, 'index'])->name('index');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Finance Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('finance')->name('finance.')->group(function () {
        Route::get('contracts', [ContractController::class, 'index'])->name('contracts.index');
        Route::post('contracts/generate', [ContractController::class, 'generate'])->name('contracts.generate');
        Route::get('contracts/{contract}', [ContractController::class, 'show'])->name('contracts.show');
        Route::patch('contracts/{contract}/status', [ContractController::class, 'updateStatus'])->name('contracts.update-status');
    });

    /*
    |--------------------------------------------------------------------------
    | Shared Routes (All Roles)
    |--------------------------------------------------------------------------
    */
    Route::get('/support', [SupportController::class, 'index'])->name('support');
    Route::get('/resources', [ResourcesController::class, 'index'])->name('resources');

    Route::resource('proposal', ProposalController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';