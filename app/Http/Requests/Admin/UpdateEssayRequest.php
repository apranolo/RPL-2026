<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEssayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isSuperAdmin();
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
            'question' => ['required', 'string'],
            'guidance' => ['nullable', 'string'],
            'max_words' => ['required', 'integer', 'min:1', 'max:10000'],
            'is_required' => ['boolean'],
            'is_active' => ['boolean'],
            'display_order' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function attributes(): array
    {
        return [
            'code' => 'kode essay',
            'question' => 'pertanyaan',
            'guidance' => 'panduan',
            'max_words' => 'maksimal kata',
            'is_required' => 'wajib diisi',
            'is_active' => 'status aktif',
            'display_order' => 'urutan tampilan',
        ];
    }

    public function messages(): array
    {
        return [
            'max_words.min' => 'Maksimal kata harus minimal 1.',
            'max_words.max' => 'Maksimal kata tidak boleh melebihi 10.000.',
        ];
    }
}
