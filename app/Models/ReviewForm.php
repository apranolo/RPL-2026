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

    // Relasi balik ke Assignment
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(ReviewAssignment::class, 'review_assignment_id');
    }
}