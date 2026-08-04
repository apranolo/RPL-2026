<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCriteriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isSuperAdmin();
    }

    public function rules(): array
    {
        return [
            'sub_category_id' => 'required|exists:evaluation_sub_categories,id',

            // Batch creation: criteria is required if the single fields are missing
            'criteria' => 'required_without:code|array|min:1',
            'criteria.*.code' => 'required_with:criteria|string|max:50|distinct|unique:evaluation_indicators,code',
            'criteria.*.question' => 'required_with:criteria|string',
            'criteria.*.description' => 'nullable|string',
            'criteria.*.weight' => 'required_with:criteria|numeric|min:0|max:100',
            'criteria.*.answer_type' => 'required_with:criteria|in:boolean,scale,text',
            'criteria.*.requires_attachment' => 'required_with:criteria|boolean',
            'criteria.*.sort_order' => 'nullable|integer|min:1',
            'criteria.*.is_active' => 'required_with:criteria|boolean',

            // Single creation fallback: root level fields are required if criteria is missing
            'code' => 'required_without:criteria|string|max:50|unique:evaluation_indicators,code',
            'question' => 'required_without:criteria|string',
            'description' => 'nullable|string',
            'weight' => 'required_without:criteria|numeric|min:0|max:100',
            'answer_type' => 'required_without:criteria|in:boolean,scale,text',
            'requires_attachment' => 'boolean',
            'sort_order' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ];
    }

    public function attributes(): array
    {
        return [
            'sub_category_id' => 'sub-kategori',

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

            'criteria.required' => 'Minimal harus ada satu kriteria.',
            'criteria.array' => 'Format data kriteria tidak valid.',
            'criteria.min' => 'Minimal harus ada satu kriteria.',

            'criteria.*.code.required' => 'Kode kriteria wajib diisi.',
            'criteria.*.code.unique' => 'Kode kriteria sudah digunakan.',
            'criteria.*.code.distinct' => 'Kode kriteria tidak boleh duplikat dalam satu form.',

            'criteria.*.question.required' => 'Pertanyaan wajib diisi.',

            'criteria.*.answer_type.required' => 'Tipe jawaban wajib dipilih.',
            'criteria.*.answer_type.in' => 'Tipe jawaban harus "boolean", "scale", atau "text".',

            'criteria.*.weight.required' => 'Bobot wajib diisi.',
            'criteria.*.weight.max' => 'Bobot tidak boleh melebihi 100.',
        ];
    }
}
