<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EditorialDecisionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization akan dihandle melalui middleware / policy.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'decision' => [
                'required',
                Rule::in([
                    'accept',
                    'reject',
                ]),
            ],

            'notes' => [
                'required',
                'string',
                'min:50',
                'max:5000',
            ],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'decision.required' => 'Please choose a final editorial decision.',
            'decision.in' => 'Editorial decision must be either Accept or Reject.',

            'notes.required' => 'Editorial notes are required.',
            'notes.min' => 'Editorial notes must contain at least 50 characters.',
            'notes.max' => 'Editorial notes may not exceed 5000 characters.',
        ];
    }

    /**
     * Customize validated attribute names.
     */
    public function attributes(): array
    {
        return [
            'decision' => 'editorial decision',
            'notes' => 'editorial notes',
        ];
    }
}