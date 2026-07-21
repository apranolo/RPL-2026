<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJournalOutputRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'proposal_id' => [
                'required',
                'integer',
                Rule::exists('proposals', 'id')->where('user_id', $userId),
            ],
            'title' => ['required', 'string', 'max:500'],
            'authors' => ['required', 'string', 'max:1000'],
            'year' => ['required', 'integer', 'min:1900', 'max:'.(date('Y') + 1)],
            'doi' => ['nullable', 'string', 'max:255'],
            'url' => ['nullable', 'url', 'max:500'],
            'journal_name' => ['required', 'string', 'max:255'],
            'volume' => ['nullable', 'string', 'max:50'],
            'issue' => ['nullable', 'string', 'max:50'],
            'pages' => ['nullable', 'string', 'max:50'],
            'issn' => ['nullable', 'string', 'max:20'],
            'e_issn' => ['nullable', 'string', 'max:20'],
            'publisher' => ['nullable', 'string', 'max:255'],
            'journal_id' => [
                'nullable',
                'integer',
                Rule::exists('journals', 'id')->where('user_id', $userId),
            ],
            'file' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'keterangan' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'proposal_id.required' => 'Proposal wajib dipilih.',
            'proposal_id.exists' => 'Proposal tidak valid.',
            'title.required' => 'Judul publikasi wajib diisi.',
            'authors.required' => 'Nama penulis wajib diisi.',
            'year.required' => 'Tahun publikasi wajib diisi.',
            'year.integer' => 'Tahun publikasi harus berupa angka.',
            'journal_name.required' => 'Nama jurnal wajib diisi.',
            'url.url' => 'URL artikel harus berupa alamat web yang valid.',
            'journal_id.exists' => 'Jurnal yang dipilih tidak valid.',
            'file.mimes' => 'File harus berformat PDF.',
            'file.max' => 'Ukuran file maksimal 10MB.',
        ];
    }
}
