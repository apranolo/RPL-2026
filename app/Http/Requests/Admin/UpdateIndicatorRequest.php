<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateIndicatorRequest extends FormRequest
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
            'description' => ['nullable', 'string'],
            'weight' => ['required', 'numeric', 'min:0', 'max:100'],
            'answer_type' => ['required', 'string', Rule::in(['boolean', 'scale', 'text'])],
            'requires_attachment' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'code' => 'kode indikator',
            'question' => 'pertanyaan',
            'description' => 'deskripsi',
            'weight' => 'bobot',
            'answer_type' => 'tipe jawaban',
            'requires_attachment' => 'memerlukan lampiran',
            'sort_order' => 'urutan',
            'is_active' => 'status aktif',
        ];
    }

    public function messages(): array
    {
        return [
            'answer_type.in' => 'Tipe jawaban harus "boolean", "scale", atau "text".',
            'weight.max' => 'Bobot tidak boleh melebihi 100.',
        ];
    }
}
