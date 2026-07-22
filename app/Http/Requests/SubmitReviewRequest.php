<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Otorisasi lebih spesifik akan dicek di Controller menggunakan relasi penugasan
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'recommendation' => 'required|in:Accept,Revise,Reject',
            'comments' => 'required|string',
            'comments_private' => 'nullable|string',
            'score_originality' => 'required|integer|min:1|max:5',
            'score_methodology' => 'required|integer|min:1|max:5',
            'score_writing' => 'required|integer|min:1|max:5',
            'score_relevance' => 'required|integer|min:1|max:5',
            'score_conclusion' => 'required|integer|min:1|max:5',
        ];
    }
}
