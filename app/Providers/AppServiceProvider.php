<?php

namespace App\Providers;

use App\Models\AccreditationTemplate;
use App\Models\ContractDocument;
use App\Models\EssayQuestion;
use App\Models\EvaluationCategory;
use App\Models\EvaluationIndicator;
use App\Models\EvaluationSubCategory;
use App\Models\Journal;
use App\Models\JournalAssessment;
use App\Models\PlagiarismCheck;
use App\Models\Proposal;
use App\Models\University;
use App\Models\User;
use App\Policies\AccreditationTemplatePolicy;
use App\Policies\ContractDocumentPolicy;
use App\Policies\EssayQuestionPolicy;
use App\Policies\EvaluationCategoryPolicy;
use App\Policies\EvaluationIndicatorPolicy;
use App\Policies\EvaluationSubCategoryPolicy;
use App\Policies\JournalAssessmentPolicy;
use App\Policies\JournalPolicy;
use App\Policies\PlagiarismCheckPolicy;
use App\Policies\ProposalPolicy;
use App\Policies\UniversityPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Journal::class, JournalPolicy::class);
        Gate::policy(JournalAssessment::class, JournalAssessmentPolicy::class);
        Gate::policy(University::class, UniversityPolicy::class);
        Gate::policy(ContractDocument::class, ContractDocumentPolicy::class);
        Gate::policy(PlagiarismCheck::class, PlagiarismCheckPolicy::class);

        // MOCK LOKAL - hapus setelah policy resmi Proposal multi-reviewer di-merge
        Gate::policy(Proposal::class, ProposalPolicy::class);

        // NEW v1.1: Hierarchical Borang Policies (Super Admin only)
        Gate::policy(AccreditationTemplate::class, AccreditationTemplatePolicy::class);
        Gate::policy(EvaluationCategory::class, EvaluationCategoryPolicy::class);
        Gate::policy(EvaluationSubCategory::class, EvaluationSubCategoryPolicy::class);
        Gate::policy(EvaluationIndicator::class, EvaluationIndicatorPolicy::class);
        Gate::policy(EssayQuestion::class, EssayQuestionPolicy::class);
        // Proposal Verification Policy (Super Admin)
        Gate::policy(Proposal::class, ProposalPolicy::class);

        // Define additional gates if needed
        Gate::define('manage-universities', function ($user) {
            return $user->isSuperAdmin();
        });

        Gate::define('manage-admin-kampus', function ($user) {
            return $user->isSuperAdmin();
        });

        Gate::define('manage-users', function ($user) {
            return $user->isSuperAdmin() || $user->isAdminKampus();
        });

        Gate::define('view-all-journals', function ($user) {
            return $user->isSuperAdmin();
        });

        Gate::define('view-university-journals', function ($user) {
            return $user->isAdminKampus();
        });

        // Custom gates for role and university assignment
        Gate::define('assign-role', function ($user, $roleName) {
            if ($user->isSuperAdmin()) {
                return in_array($roleName, ['Admin Kampus', 'User']);
            }
            if ($user->isAdminKampus()) {
                return $roleName === 'User';
            }

            return false;
        });

        Gate::define('assign-university', function ($user, $universityId) {
            if ($user->isSuperAdmin()) {
                return true;
            }
            if ($user->isAdminKampus()) {
                return $user->university_id === $universityId;
            }

            return false;
        });
    }
}
