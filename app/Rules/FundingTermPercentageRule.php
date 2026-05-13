<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Models\FundingTerm;

class FundingTermPercentageRule implements ValidationRule
{
    private int $contractId;
    private ?int $excludeTermId;

    public function __construct(int $contractId, ?int $excludeTermId = null)
    {
        $this->contractId = $contractId;
        $this->excludeTermId = $excludeTermId;
    }

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $query = FundingTerm::where('contract_id', $this->contractId)
            ->whereNull('deleted_at');

        if ($this->excludeTermId) {
            $query->where('id', '!=', $this->excludeTermId);
        }

        $totalPercentage = $query->sum('percentage') + $value;

        // Allow 100% with floating point tolerance
        if (abs($totalPercentage - 100) > 0.01) {
            $fail('Total persentase semua termin untuk kontrak ini harus sama dengan 100%. Saat ini: ' . round($totalPercentage, 2) . '%');
        }
    }
}
