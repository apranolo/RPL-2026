<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJournalOutputRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:500',
            'authors' => 'required|string|max:1000',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'doi' => 'nullable|string|max:255',
            'url' => 'nullable|url|max:500',
            'journal_name' => 'required|string|max:255',
            'volume' => 'nullable|string|max:50',
            'issue' => 'nullable|string|max:50',
            'pages' => 'nullable|string|max:50',
            'issn' => 'nullable|string|max:20',
            'e_issn' => 'nullable|string|max:20',
            'publisher' => 'nullable|string|max:255',
            'journal_id' => 'nullable|exists:journals,id',
            'file' => 'nullable|file|mimes:pdf|max:10240', // max 10MB PDF
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul publikasi wajib diisi.',
            'title.max' => 'Judul publikasi maksimal 500 karakter.',
            'authors.required' => 'Nama penulis wajib diisi.',
            'year.required' => 'Tahun publikasi wajib diisi.',
            'year.integer' => 'Tahun publikasi harus berupa angka.',
            'year.min' => 'Tahun publikasi tidak valid.',
            'year.max' => 'Tahun publikasi tidak valid.',
            'journal_name.required' => 'Nama jurnal wajib diisi.',
            'doi.max' => 'DOI maksimal 255 karakter.',
            'url.url' => 'URL harus berupa alamat web yang valid.',
            'file.mimes' => 'File harus berformat PDF.',
            'file.max' => 'Ukuran file maksimal 10MB.',
        ];
    }
}
