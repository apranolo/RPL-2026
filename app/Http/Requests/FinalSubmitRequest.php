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
        $submission = $this->route('submission');

        return $submission && $submission->author_id === auth()->id();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'confirm_submission' => 'required|accepted',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $submission = $this->route('submission');

            if (! $submission) {
                $validator->errors()->add('submission', 'Naskah tidak ditemukan.');

                return;
            }

            if (empty($submission->title)) {
                $validator->errors()->add('title', 'Judul artikel wajib diisi.');
            }

            if (empty($submission->abstract)) {
                $validator->errors()->add('abstract', 'Abstrak artikel wajib diisi.');
            }

            if (empty($submission->keywords)) {
                $validator->errors()->add('keywords', 'Kata kunci wajib diisi.');
            }

            // Check if main manuscript file exists
            $hasMainFile = $submission->files()->where('file_type', 'ManuscriptMain')->exists();
            if (! $hasMainFile) {
                $validator->errors()->add('manuscript', 'File manuskrip utama wajib diunggah.');
            }

            // Check if co-author (contributors) exists
            $hasContributors = $submission->contributors()->exists();
            if (! $hasContributors) {
                $validator->errors()->add('contributors', 'Data co-author/penulis pendamping wajib diisi.');
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'confirm_submission.required' => 'Anda harus menyetujui pernyataan konfirmasi sebelum mengirim.',
            'confirm_submission.accepted' => 'Anda harus menyetujui pernyataan konfirmasi sebelum mengirim.',
        ];
    }
}
