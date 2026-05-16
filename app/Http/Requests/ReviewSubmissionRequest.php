<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class ReviewSubmissionRequest extends FormRequest
{
    /**
     * Authorize request
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Validation rules
     */
    public function rules(): array
    {
        return [
            'recommendation' => [
                'required',
                'in:accept,minor_revision,major_revision,reject',
            ],

            'overall_comment' => [
                'required',
                'string',
                'min:10',
            ],

            'scores' => [
                'required',
                'array',
                'min:1',
            ],

            'scores.*' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'recommendation.required' => 'Recommendation wajib dipilih.',
            'recommendation.in' => 'Recommendation tidak valid.',

            'overall_comment.required' => 'Komentar reviewer wajib diisi.',
            'overall_comment.min' => 'Komentar minimal 10 karakter.',

            'scores.required' => 'Semua rubric score wajib diisi.',
            'scores.array' => 'Format scores tidak valid.',

            'scores.*.required' => 'Nilai rubric wajib diisi.',
            'scores.*.integer' => 'Nilai rubric harus angka.',
            'scores.*.min' => 'Nilai minimal adalah 1.',
            'scores.*.max' => 'Nilai maksimal adalah 5.',
        ];
    }
}