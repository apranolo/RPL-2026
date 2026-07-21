<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDiscussionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Rules for creating a new discussion message (reply or new thread).
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:5000'],
            'parent_id' => ['nullable', 'integer', 'exists:discussion_messages,id'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:10240'], // 10MB max
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'body' => 'isi pesan',
            'parent_id' => 'pesan induk',
            'attachment' => 'lampiran',
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'body.required' => 'Isi pesan tidak boleh kosong.',
            'body.max' => 'Isi pesan maksimal :max karakter.',
            'parent_id.exists' => 'Pesan induk yang dituju tidak ditemukan.',
            'attachment.mimes' => 'Format file harus: PDF, JPG, JPEG, PNG, DOC, atau DOCX.',
            'attachment.max' => 'Ukuran file maksimal 10MB.',
        ];
    }
}
