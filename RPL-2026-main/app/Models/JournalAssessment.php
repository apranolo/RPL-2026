<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JournalAssessment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'journal_id',
        'user_id',
        'pembinaan_registration_id',
        'reviewer_id',
        'assessment_date',
        'period',
        'status',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'admin_kampus_approved_by',
        'admin_kampus_approved_at',
        'admin_kampus_approval_notes',
        'assigned_by',
        'assigned_at',
        'total_score',
        'max_score',
        'percentage',
        'notes',
        'admin_notes',
        // New journal metadata fields
        'kategori_diusulkan',
        'jumlah_editor',
        'jumlah_reviewer',
        'jumlah_author',
        'jumlah_institusi_editor',
        'jumlah_institusi_reviewer',
        'jumlah_institusi_author',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'assessment_date' => 'date',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'admin_kampus_approved_at' => 'datetime',
        'assigned_at' => 'datetime',
        'total_score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'percentage' => 'decimal:2',
        'jumlah_editor' => 'integer',
        'jumlah_reviewer' => 'integer',
        'jumlah_author' => 'integer',
        'jumlah_institusi_editor' => 'integer',
        'jumlah_institusi_reviewer' => 'integer',
        'jumlah_institusi_author' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'status_label',
        'grade',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the journal being assessed
     */
    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    /**
     * Get the user who created this assessment
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reviewer (admin) who reviewed this assessment
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the pembinaan registration this assessment belongs to
     */
    public function pembinaanRegistration()
    {
        return $this->belongsTo(PembinaanRegistration::class);
    }

    /**
     * Get all responses for this assessment
     */
    public function responses()
    {
        return $this->hasMany(AssessmentResponse::class);
    }

    /**
     * Get all issues for this assessment
     */
    public function issues()
    {
        return $this->hasMany(AssessmentIssue::class, 'journal_assessment_id')
            ->orderBy('display_order')
            ->orderBy('created_at');
    }

    /**
     * Get all journal metadata entries for this assessment
     */
    public function journalMetadata()
    {
        return $this->hasMany(AssessmentJournalMetadata::class, 'journal_assessment_id')
            ->orderBy('display_order')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc');
    }

    /**
     * Get the Admin Kampus who approved/rejected this assessment
     */
    public function adminKampusApprover()
    {
        return $this->belongsTo(User::class, 'admin_kampus_approved_by');
    }

    /**
     * Get all notes for this assessment (timeline)
     *
     * Note: Named 'assessmentNotes' to avoid conflict with 'notes' column
     */
    public function assessmentNotes()
    {
        return $this->hasMany(AssessmentNote::class, 'journal_assessment_id')
            ->with('user')
            ->orderBy('created_at', 'asc');
    }

    /**
     * Get the Dikti user who assigned the reviewer
     */
    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get only draft assessments
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope to get only submitted assessments
     */
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    /**
     * Scope to get only reviewed assessments
     */
    public function scopeReviewed($query)
    {
        return $query->where('status', 'reviewed');
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, ?string $status)
    {
        if (! $status) {
            return $query;
        }

        return $query->where('status', $status);
    }

    /**
     * Scope to filter by journal
     */
    public function scopeForJournal($query, int $journalId)
    {
        return $query->where('journal_id', $journalId);
    }

    /**
     * Scope to filter by user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'Draft',
            'submitted' => 'Submitted',
            'reviewed' => 'Reviewed',
            default => $this->status,
        };
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'gray',
            'submitted' => 'yellow',
            'reviewed' => 'green',
            default => 'gray',
        };
    }

    /**
     * Get grade based on percentage
     */
    public function getGradeAttribute(): string
    {
        return match (true) {
            $this->percentage >= 90 => 'A (Excellent)',
            $this->percentage >= 80 => 'B (Very Good)',
            $this->percentage >= 70 => 'C (Good)',
            $this->percentage >= 60 => 'D (Fair)',
            default => 'E (Need Improvement)',
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Check if assessment is editable
     */
    public function isEditable(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if assessment has been submitted
     */
    public function isSubmitted(): bool
    {
        return in_array($this->status, ['submitted', 'reviewed']);
    }

    /**
     * Calculate total score from responses
     */
    public function calculateTotalScore(): void
    {
        $this->total_score = $this->responses()->sum('score');
        $this->max_score = $this->responses()
            ->with('evaluationIndicator')
            ->get()
            ->sum(fn ($response) => $response->evaluationIndicator->weight);

        $this->percentage = $this->max_score > 0
            ? ($this->total_score / $this->max_score) * 100
            : 0;

        $this->save();
    }

    /**
     * Submit assessment
     */
    public function submit(): void
    {
        $this->calculateTotalScore();
        $this->status = 'submitted';
        $this->submitted_at = now();
        $this->save();
    }

    /**
     * Mark as reviewed
     */
    public function markAsReviewed(int $reviewerId, ?string $adminNotes = null): void
    {
        $this->status = 'reviewed';
        $this->reviewed_by = $reviewerId;
        $this->reviewed_at = now();
        $this->admin_notes = $adminNotes;
        $this->save();
    }

    /**
     * Get completion percentage (how many indicators answered)
     */
    public function getCompletionPercentageAttribute(): float
    {
        $totalIndicators = EvaluationIndicator::active()->count();
        $answeredIndicators = $this->responses()->count();

        return $totalIndicators > 0
            ? ($answeredIndicators / $totalIndicators) * 100
            : 0;
    }
}
