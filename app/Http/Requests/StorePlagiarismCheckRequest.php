<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePlagiarismCheckRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Otorisasi sebenarnya dicek via Policy di controller
     * ($this->authorize('create', PlagiarismCheck::class)).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
public function rules(): array
    {
        return [
            'submission_id' => 'required|integer|exists:submissions,id',
            'similarity_score' => 'required|numeric|min:0|max:100',
            'report_file' => 'required|file|mimes:pdf|max:5120',
            'source_breakdown' => 'nullable|array',
        ];
    }
}