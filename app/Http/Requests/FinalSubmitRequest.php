<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FinalSubmitRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization is handled in the controller via policies
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Validates that all wizard steps have been completed before final submission.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Step 1: Basic Info
            'journal_id' => 'required|exists:journals,id',
            'assessment_date' => 'required|date',
            'period' => 'nullable|string|max:20',
            'notes' => 'nullable|string',

            // Step 2: Kategori & Kontributor
            'kategori_diusulkan' => 'required|string|max:50',
            'jumlah_editor' => 'required|integer|min:0',
            'jumlah_reviewer' => 'required|integer|min:0',
            'jumlah_author' => 'required|integer|min:0',
            'jumlah_institusi_editor' => 'required|integer|min:0',
            'jumlah_institusi_reviewer' => 'required|integer|min:0',
            'jumlah_institusi_author' => 'required|integer|min:0',

            // Step 3: Journal Metadata (terbitan)
            'journal_metadata' => 'required|array|min:1',
            'journal_metadata.*.volume' => 'required|string|max:20',
            'journal_metadata.*.number' => 'required|string|max:20',
            'journal_metadata.*.year' => 'required|integer|min:1900|max:'.date('Y'),
            'journal_metadata.*.month' => 'required|integer|min:1|max:12',
            'journal_metadata.*.url_issue' => 'nullable|url|max:500',
            'journal_metadata.*.jumlah_negara_editor' => 'required|integer|min:0',
            'journal_metadata.*.jumlah_institusi_editor' => 'required|integer|min:0',
            'journal_metadata.*.jumlah_negara_reviewer' => 'required|integer|min:0',
            'journal_metadata.*.jumlah_institusi_reviewer' => 'required|integer|min:0',
            'journal_metadata.*.jumlah_negara_author' => 'nullable|integer|min:0',
            'journal_metadata.*.jumlah_institusi_author' => 'nullable|integer|min:0',

            // Step 4: Evaluation Responses
            'responses' => 'required|array|min:1',
            'responses.*.evaluation_indicator_id' => 'required|exists:evaluation_indicators,id',
            'responses.*.answer_boolean' => 'nullable|boolean',
            'responses.*.answer_scale' => 'nullable|integer|min:1|max:5',
            'responses.*.answer_text' => 'nullable|string',
            'responses.*.notes' => 'nullable|string',

            // Step 4: Assessment Issues (optional)
            'issues' => 'nullable|array',
            'issues.*.title' => 'required|string|max:200',
            'issues.*.description' => 'required|string|max:1000',
            'issues.*.category' => 'required|in:editorial,technical,content_quality,management',
            'issues.*.priority' => 'required|in:high,medium,low',

            // Step 5: Confirmation
            'confirm_submission' => 'required|accepted',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'journal_id.required' => 'Jurnal wajib dipilih.',
            'journal_id.exists' => 'Jurnal yang dipilih tidak valid.',
            'assessment_date.required' => 'Tanggal assessment wajib diisi.',
            'assessment_date.date' => 'Format tanggal assessment tidak valid.',
            'kategori_diusulkan.required' => 'Kategori yang diusulkan wajib dipilih.',
            'jumlah_editor.required' => 'Jumlah editor wajib diisi.',
            'jumlah_editor.min' => 'Jumlah editor tidak boleh negatif.',
            'jumlah_reviewer.required' => 'Jumlah reviewer wajib diisi.',
            'jumlah_reviewer.min' => 'Jumlah reviewer tidak boleh negatif.',
            'jumlah_author.required' => 'Jumlah author wajib diisi.',
            'jumlah_author.min' => 'Jumlah author tidak boleh negatif.',
            'jumlah_institusi_editor.required' => 'Jumlah institusi editor wajib diisi.',
            'jumlah_institusi_reviewer.required' => 'Jumlah institusi reviewer wajib diisi.',
            'jumlah_institusi_author.required' => 'Jumlah institusi author wajib diisi.',
            'journal_metadata.required' => 'Minimal satu data terbitan jurnal wajib diisi.',
            'journal_metadata.min' => 'Minimal satu data terbitan jurnal wajib diisi.',
            'journal_metadata.*.volume.required' => 'Volume terbitan wajib diisi.',
            'journal_metadata.*.number.required' => 'Nomor terbitan wajib diisi.',
            'journal_metadata.*.year.required' => 'Tahun terbitan wajib diisi.',
            'journal_metadata.*.month.required' => 'Bulan terbitan wajib diisi.',
            'responses.required' => 'Jawaban evaluasi wajib diisi.',
            'responses.min' => 'Minimal satu jawaban evaluasi wajib diisi.',
            'responses.*.evaluation_indicator_id.required' => 'ID indikator evaluasi wajib ada.',
            'responses.*.evaluation_indicator_id.exists' => 'Indikator evaluasi tidak valid.',
            'issues.*.title.required' => 'Judul temuan wajib diisi.',
            'issues.*.description.required' => 'Deskripsi temuan wajib diisi.',
            'issues.*.category.required' => 'Kategori temuan wajib dipilih.',
            'issues.*.category.in' => 'Kategori temuan tidak valid.',
            'issues.*.priority.required' => 'Prioritas temuan wajib dipilih.',
            'issues.*.priority.in' => 'Prioritas temuan tidak valid.',
            'confirm_submission.required' => 'Anda harus mengkonfirmasi pengajuan sebelum submit.',
            'confirm_submission.accepted' => 'Anda harus mengkonfirmasi pengajuan sebelum submit.',
        ];
    }
}
