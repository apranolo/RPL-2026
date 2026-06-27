namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReviewAssignment extends Model
{
    use HasFactory;

    // Mengizinkan penyimpanan data secara massal
    protected $fillable = [
        'submission_id',
        'reviewer_id',
        'round',
        'status',
        'due_date',
        'declined_reason',
    ];

    // Relasi ke User (Reviewer)
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    // Relasi ke Submission (Naskah)
    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    // Relasi ke Form Penilaian (Satu tugas review punya banyak kriteria penilaian)
    public function forms(): HasMany
    {
        return $this->hasMany(ReviewForm::class);
    }
}