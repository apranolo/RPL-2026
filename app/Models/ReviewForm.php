namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'review_assignment_id',
        'criteria_name',
        'score',
        'comment',
    ];

    // --- TAMBAHAN DARI REVIEWER (ACCESSORS & APPENDS) ---

    protected $appends = ['id_review_assignment', 'criterion_name'];

    // Menyelaraskan penamaan ID
    public function getIdReviewAssignmentAttribute() 
    {
        return $this->review_assignment_id;
    }

    // Menyelaraskan kosa kata (criteria vs criterion)
    public function getCriterionNameAttribute() 
    {
        return $this->criteria_name;
    }

    // ----------------------------------------------------

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(ReviewAssignment::class, 'review_assignment_id');
    }
}