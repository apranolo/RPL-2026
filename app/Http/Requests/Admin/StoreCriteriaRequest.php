<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCriteriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isSuperAdmin();
    }

    public function rules(): array
    {
        return [
            'sub_category_id' => ['required', 'exists:evaluation_sub_categories,id'],
            
            // Single creation rules
            'code' => ['required_without:criteria', 'nullable', 'string', 'max:50', 'unique:evaluation_indicators,code'],
            'question' => ['required_without:criteria', 'nullable', 'string'],
            'description' => ['nullable', 'string'],
            'weight' => ['required_without:criteria', 'nullable', 'numeric', 'min:0', 'max:100'],
            'answer_type' => ['required_without:criteria', 'nullable', 'string', Rule::in(['boolean', 'scale', 'text'])],
            'requires_attachment' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],

            // Batch creation rules
            'criteria' => ['nullable', 'array'],
            'criteria.*.code' => ['required_with:criteria', 'string', 'max:50', 'unique:evaluation_indicators,code'],
            'criteria.*.question' => ['required_with:criteria', 'string'],
            'criteria.*.description' => ['nullable', 'string'],
            'criteria.*.weight' => ['required_with:criteria', 'numeric', 'min:0', 'max:100'],
            'criteria.*.answer_type' => ['required_with:criteria', 'string', Rule::in(['boolean', 'scale', 'text'])],
            'criteria.*.requires_attachment' => ['boolean'],
            'criteria.*.sort_order' => ['nullable', 'integer', 'min:1'],
            'criteria.*.is_active' => ['boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'sub_category_id' => 'sub-kategori',
            'code' => 'kode kriteria',
            'question' => 'pertanyaan',
            'description' => 'deskripsi',
            'weight' => 'bobot',
            'answer_type' => 'tipe jawaban',
            'requires_attachment' => 'memerlukan lampiran',
            'sort_order' => 'urutan',
            'is_active' => 'status aktif',
            'criteria' => 'kriteria',
            'criteria.*.code' => 'kode kriteria',
            'criteria.*.question' => 'pertanyaan',
            'criteria.*.description' => 'deskripsi',
            'criteria.*.weight' => 'bobot',
            'criteria.*.answer_type' => 'tipe jawaban',
            'criteria.*.requires_attachment' => 'memerlukan lampiran',
            'criteria.*.sort_order' => 'urutan',
            'criteria.*.is_active' => 'status aktif',
        ];
    }

    public function messages(): array
    {
        return [
            'sub_category_id.required' => 'Sub-kategori wajib dipilih.',
            'sub_category_id.exists' => 'Sub-kategori yang dipilih tidak valid.',
            'code.unique' => 'Kode kriteria sudah digunakan.',
            'answer_type.in' => 'Tipe jawaban harus "boolean", "scale", atau "text".',
            'weight.max' => 'Bobot tidak boleh melebihi 100.',
            'criteria.*.code.unique' => 'Kode kriteria pada salah satu item sudah digunakan.',
            'criteria.*.answer_type.in' => 'Tipe jawaban harus "boolean", "scale", atau "text".',
            'criteria.*.weight.max' => 'Bobot tidak boleh melebihi 100.',
        ];
    }
}