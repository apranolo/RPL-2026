<?php

/**
 * MOCK LOKAL - hapus setelah model resmi ReviewDecision dari tim lain di-merge.
 *
 * Model untuk menyimpan keputusan review multi-reviewer.
 * Table: review_decisions
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReviewDecision extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'reviewer_assignment_id',
        'score',
        'recommendation',
        'comment',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'score' => 'integer',
    ];

    /**
     * Get the reviewer assignment this decision belongs to.
     */
    public function reviewerAssignment(): BelongsTo
    {
        return $this->belongsTo(ReviewerAssignment::class);
    }
}
