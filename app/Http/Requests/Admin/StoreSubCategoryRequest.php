<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isSuperAdmin();
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:evaluation_categories,id'],
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'display_order' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function attributes(): array
    {
        return [
            'category_id' => 'kategori',
            'code' => 'kode sub-kategori',
            'name' => 'nama sub-kategori',
            'description' => 'deskripsi',
            'display_order' => 'urutan tampilan',
        ];
    }
}
