<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJournalRequest extends FormRequest
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
            'first_published_year' => 'nullable|integer|min:1900|max:'.(date('Y') + 1),

            // Classification
            'scientific_field_id' => 'required|exists:scientific_fields,id',

            // SINTA / Accreditation (merged)
            'sinta_rank' => 'required|string|in:sinta_1,sinta_2,sinta_3,sinta_4,sinta_5,sinta_6,non_sinta',
            'accreditation_start_year' => 'nullable|integer|min:1900|max:'.(date('Y') + 5),
            'accreditation_end_year' => array_filter([
                'nullable',
                'integer',
                'min:1900',
                'max:'.(date('Y') + 10),
                $this->filled('accreditation_start_year') ? 'gte:accreditation_start_year' : null,
            ]),
            'accreditation_sk_number' => 'nullable|string|max:100',
            // Use app timezone to avoid UTC mismatch that rejects today's local date as "future"
            'accreditation_sk_date' => 'nullable|date_format:Y-m-d|before_or_equal:'.now()->timezone(config('app.timezone'))->format('Y-m-d'),

            // Indexations
            'indexations' => 'nullable|array',
            'indexations.*.url' => 'nullable|url|max:500',

            // Contact
            'editor_in_chief' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',

            // Additional Info
            'oai_urls' => 'reequired|array',
            'oai_urls.*' => 'url|max:500',
            'about' => 'nullable|string|max:1000',
            'scope' => 'nullable|string|max:2500',

            // Cover Image
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048|dimensions:min_width=300,min_height=400',
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
            'oai_urls.array' => 'Format OAI-PMH URLs wajib diisi dan harus berupa array.',
            'oai_urls.*.url' => 'Format URL OAI-PMH tidak valid.',
            'indexations.*.url.url' => 'Format URL indeksasi tidak valid.',
            'cover_image.image' => 'File cover harus berupa gambar.',
            'cover_image.mimes' => 'Format cover harus JPEG, PNG, JPG, atau WebP.',
            'cover_image.max' => 'Ukuran file cover maksimal 2MB.',
            'cover_image.dimensions' => 'Resolusi cover minimal 300×400 piksel.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $mergeData = [];

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
            $mergeData['indexations'] = $transformed;
        }

        // Normalize first_published_year to integer
        if ($this->has('first_published_year') && $this->input('first_published_year') !== null && $this->input('first_published_year') !== '') {
            $mergeData['first_published_year'] = (int) $this->input('first_published_year');
        }

        // Normalize SK Date to Y-m-d using app timezone if present
        if ($this->has('accreditation_sk_date') && $this->input('accreditation_sk_date') != '') {
            try {
                $date = \Carbon\Carbon::createFromFormat('Y-m-d', (string) $this->input('accreditation_sk_date'), config('app.timezone'));
                if ($date !== false) {
                    $mergeData['accreditation_sk_date'] = $date->format('Y-m-d');
                }
            } catch (\Exception $e) {
                // Ignore parse errors, let validation handle it
            }
        }

        if (! empty($mergeData)) {
            $this->merge($mergeData);
        }
    }
}
