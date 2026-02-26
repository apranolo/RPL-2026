<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJournalRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Basic Info
            'title' => 'required|string|max:255',
            'issn' => 'nullable|string|max:20|regex:/^\d{4}-\d{4}$/',
            'e_issn' => 'required|string|max:20|regex:/^\d{4}-\d{4}$/',
            'url' => 'required|url|max:500',

            // Publication Details
            'publisher' => 'nullable|string|max:255',
            'frequency' => 'required|string|max:50',
            'first_published_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),

            // Classification
            'scientific_field_id' => 'required|exists:scientific_fields,id',

            // SINTA / Accreditation (merged)
            'sinta_rank' => 'required|string|in:sinta_1,sinta_2,sinta_3,sinta_4,sinta_5,sinta_6,non_sinta',
            'accreditation_start_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 5),
            'accreditation_end_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 10) . '|gte:accreditation_start_year',
            'accreditation_sk_number' => 'nullable|string|max:100',
            'accreditation_sk_date' => 'nullable|date|before_or_equal:today',

            // Indexations
            'indexations' => 'nullable|array',
            'indexations.*.url' => 'nullable|url|max:500',

            // Contact
            'editor_in_chief' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',

            // Additional Info
            'oai_pmh_url' => 'required|url|max:500',
            'about' => 'nullable|string|max:1000',
            'scope' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul jurnal wajib diisi.',
            'url.required' => 'URL jurnal wajib diisi.',
            'url.url' => 'Format URL tidak valid.',
            'scientific_field_id.required' => 'Bidang ilmu wajib dipilih.',
            'scientific_field_id.exists' => 'Bidang ilmu tidak valid.',
            'issn.regex' => 'Format ISSN harus xxxx-xxxx.',
            'e_issn.required' => 'E-ISSN wajib diisi.',
            'e_issn.regex' => 'Format E-ISSN harus xxxx-xxxx.',
            'sinta_rank.required' => 'Peringkat akreditasi wajib dipilih.',
            'sinta_rank.in' => 'Peringkat akreditasi tidak valid.',
            'accreditation_end_year.gte' => 'Tahun akhir akreditasi harus setelah tahun mulai.',
            'oai_pmh_url.required' => 'URL OAI-PMH wajib diisi.',
            'oai_pmh_url.url' => 'Format URL OAI-PMH tidak valid.',
            'indexations.*.url.url' => 'Format URL indeksasi tidak valid.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Transform indexations from frontend format to database format
        if ($this->has('indexations') && is_array($this->indexations)) {
            $transformed = [];
            foreach ($this->indexations as $item) {
                if (isset($item['platform'])) {
                    $transformed[$item['platform']] = [
                        'url' => $item['url'] ?? null,
                    ];
                }
            }
            $this->merge(['indexations' => $transformed]);
        }
    }
}
