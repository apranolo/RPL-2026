<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProposalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Prepare input before validation.
     */
    protected function prepareForValidation(): void
    {
        // Map alias 'judul' to 'title' and 'deskripsi' to 'description' if provided
        if (! $this->has('title') && $this->has('judul')) {
            $this->merge(['title' => $this->input('judul')]);
        }

        if (! $this->has('description') && $this->has('deskripsi')) {
            $this->merge(['description' => $this->input('deskripsi')]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isSubmit = $this->input('action') === 'submit';

        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'research_schema_id' => 'required|exists:research_schemas,id',
            'action' => 'nullable|string|in:draft,submit',
            'file_dokumen_proposal' => [
                $isSubmit ? 'required' : 'nullable',
                'file',
                'mimes:pdf,doc,docx',
                'max:10240',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul proposal wajib diisi.',
            'title.string' => 'Judul proposal harus berupa teks.',
            'title.max' => 'Judul proposal maksimal 255 karakter.',
            'description.required' => 'Deskripsi proposal wajib diisi.',
            'description.string' => 'Deskripsi proposal harus berupa teks.',
            'research_schema_id.required' => 'Skema penelitian wajib dipilih.',
            'research_schema_id.exists' => 'Skema penelitian yang dipilih tidak valid.',
            'action.in' => 'Aksi proposal tidak valid.',
            'file_dokumen_proposal.required' => 'Dokumen proposal wajib diunggah saat mengajukan proposal.',
            'file_dokumen_proposal.file' => 'Dokumen proposal harus berupa file.',
            'file_dokumen_proposal.mimes' => 'Format dokumen proposal harus PDF, DOC, atau DOCX.',
            'file_dokumen_proposal.max' => 'Ukuran berkas dokumen proposal maksimal 10 MB.',
        ];
    }
}
