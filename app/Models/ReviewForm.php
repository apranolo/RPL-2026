namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'review_assignment_id',
        'criterion_name',
        'score',
        'comment',
    ];

    // --- TAMBAHAN DARI REVIEWER (ACCESSORS & APPENDS) ---

    // HAPUS 'criterion_name' DARI SINI
    protected $appends = ['id_review_assignment'];

    // Menyelaraskan penamaan ID
    public function getIdReviewAssignmentAttribute() 
    {
        return $this->review_assignment_id;
    }

    // FUNGSI getCriterionNameAttribute SUDAH DIHAPUS TOTAL KARENA BIKIN ERROR
    // ----------------------------------------------------

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(ReviewAssignment::class, 'review_assignment_id');
    }
}