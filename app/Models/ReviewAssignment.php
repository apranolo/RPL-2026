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
        'declined_reason',
    ];

    // --- TAMBAHAN DARI REVIEWER (ACCESSORS & APPENDS) ---
    
    // Memberitahu Laravel untuk menyertakan properti virtual ini saat mereturn JSON ke React
    protected $appends = ['id_submission', 'id_reviewer', 'reviewer_name', 'decline_reason'];

    // Membuat virtual properti 'id_submission'
    public function getIdSubmissionAttribute() 
    {
        return $this->submission_id;
    }

    // Membuat virtual properti 'id_reviewer'
    public function getIdReviewerAttribute() 
    {
        return $this->reviewer_id;
    }

    // Mengambil nama reviewer dari relasi, mereturn string kosong jika belum ada
    public function getReviewerNameAttribute() 
    {
        return $this->reviewer ? $this->reviewer->name : '';
    }

    // Membuat virtual properti 'decline_reason' (menyesuaikan typo ekspektasi frontend)
    public function getDeclineReasonAttribute() 
    {
        return $this->declined_reason;
    }

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