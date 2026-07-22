<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'proposal_id' => 'required|exists:journal_assessments,id',
            'reviewer_id' => 'required|exists:users,id',
            'scheduled_at' => 'required|date',
            'ended_at' => 'nullable|date|after:scheduled_at',
            'location' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|url|max:500',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
