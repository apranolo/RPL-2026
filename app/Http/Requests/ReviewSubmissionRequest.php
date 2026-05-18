<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewSubmissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized
     */
    public function authorize(): bool
    {
        return true;
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
                'min:5',
            ],

            'scores' => [
                'required',
                'array',
            ],

            'scores.originality' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],

            'scores.methodology' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],

            'scores.novelty' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],

            'scores.clarity' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],
        ];
    }
}