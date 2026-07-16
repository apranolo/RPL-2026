namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReviewAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'reviewer_id',
        'round',
        'status',
        'due_date',
        'decline_reason',
    ];

    // --- TAMBAHAN DARI REVIEWER (ACCESSORS & APPENDS) ---
    
    // HAPUS 'decline_reason' DARI SINI
    protected $appends = ['id_submission', 'id_reviewer', 'reviewer_name'];

    public function getIdSubmissionAttribute() 
    {
        return $this->submission_id;
    }

    public function getIdReviewerAttribute() 
    {
        return $this->reviewer_id;
    }

    public function getReviewerNameAttribute() 
    {
        return $this->reviewer ? $this->reviewer->name : '';
    }
    // FUNGSI getDeclineReasonAttribute SUDAH DIHAPUS TOTAL
    // ----------------------------------------------------

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function forms(): HasMany
    {
        return $this->hasMany(ReviewForm::class);
    }
}