<?php

namespace App\Http\Requests\Editorial;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request untuk validasi penugasan Section Editor.
 */
class AssignEditorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'editor_id' => ['required', 'integer', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'editor_id.required' => 'Section Editor wajib dipilih.',
            'editor_id.exists'   => 'Section Editor yang dipilih tidak ditemukan.',
        ];
    }
}