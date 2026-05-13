<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssessmentResponse extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'journal_assessment_id',
        'evaluation_indicator_id',
        'answer_boolean',
        'answer_scale',
        'answer_text',
        'score',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'answer_boolean' => 'boolean',
        'answer_scale' => 'integer',
        'score' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get the journal assessment this response belongs to
     */
    public function journalAssessment()
    {
        return $this->belongsTo(JournalAssessment::class);
    }

    /**
     * Get the evaluation indicator being answered
     */
    public function evaluationIndicator()
    {
        return $this->belongsTo(EvaluationIndicator::class);
    }

    /**
     * Get all attachments for this response
     */
    public function attachments()
    {
        return $this->hasMany(AssessmentAttachment::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    /**
     * Get the actual answer value based on answer type
     */
    public function getAnswerAttribute()
    {
        return match ($this->evaluationIndicator->answer_type) {
            'boolean' => $this->answer_boolean,
            'scale' => $this->answer_scale,
            'text' => $this->answer_text,
            default => null,
        };
    }

    /**
     * Get formatted answer for display
     */
    public function getFormattedAnswerAttribute(): string
    {
        return match ($this->evaluationIndicator->answer_type) {
            'boolean' => $this->answer_boolean ? 'Ya' : 'Tidak',
            'scale' => "{$this->answer_scale}/5",
            'text' => $this->answer_text ?? '-',
            default => '-',
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Set answer and auto-calculate score
     */
    public function setAnswer($value): void
    {
        $indicator = $this->evaluationIndicator;

        match ($indicator->answer_type) {
            'boolean' => $this->answer_boolean = (bool) $value,
            'scale' => $this->answer_scale = (int) $value,
            'text' => $this->answer_text = (string) $value,
        };

        $this->score = $indicator->calculateScore($value);
        $this->save();
    }

    /**
     * Check if this response has attachments
     */
    public function hasAttachments(): bool
    {
        return $this->attachments()->exists();
    }
}
