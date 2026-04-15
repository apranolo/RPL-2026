<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAccreditationTemplateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isSuperAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:accreditation_templates,name'],
            'description' => ['nullable', 'string', 'max:1000'],
            'version' => ['required', 'string', 'max:50'],
            'type' => ['required', 'string', Rule::in(['akreditasi', 'indeksasi'])],
            'is_active' => ['boolean'],
            'effective_date' => ['required', 'date'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama template',
            'description' => 'deskripsi',
            'version' => 'versi',
            'type' => 'tipe template',
            'is_active' => 'status aktif',
            'effective_date' => 'tanggal efektif',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'Nama template sudah digunakan. Silakan gunakan nama lain.',
            'type.in' => 'Tipe template harus "akreditasi" atau "indeksasi".',
            'effective_date.date' => 'Tanggal efektif harus berupa tanggal yang valid.',
        ];
    }
}
