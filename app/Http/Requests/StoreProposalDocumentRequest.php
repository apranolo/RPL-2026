<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProposalDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Handled by policy authorization inside controller
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar,jpg,jpeg,png|max:10240', // Max 10MB per file
            'document_type' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'File wajib diunggah.',
            'file.file' => 'Dokumen yang diunggah harus berupa file.',
            'file.mimes' => 'Format file harus berupa pdf, doc, docx, xls, xlsx, ppt, pptx, zip, rar, jpg, jpeg, atau png.',
            'file.max' => 'Ukuran file maksimal 10 MB.',
            'document_type.required' => 'Tipe dokumen wajib diisi.',
            'document_type.string' => 'Tipe dokumen harus berupa teks.',
            'document_type.max' => 'Tipe dokumen maksimal 100 karakter.',
            'description.string' => 'Deskripsi harus berupa teks.',
            'description.max' => 'Deskripsi maksimal 1000 karakter.',
        ];
    }
}
