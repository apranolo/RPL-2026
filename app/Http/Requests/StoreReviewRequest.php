<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isReviewer() && $this->user()->is_active;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'komponen_penilaian' => [
                'required',
                'array',
                'min:1',
            ],
            'komponen_penilaian.*.kriteria' => [
                'required',
                'string',
                'max:255',
            ],
            'komponen_penilaian.*.skor' => [
                'required',
                'numeric',
                'min:0',
                'max:100',
            ],
            'keputusan_rekomendasi' => [
                'required',
                'string',
                'in:Diterima,Ditolak,Revisi',
            ],
            'catatan_evaluasi' => [
                'nullable',
                'string',
                'required_if:keputusan_rekomendasi,Revisi,Ditolak',
                'max:2000',
            ],
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
            'komponen_penilaian.required' => 'Komponen penilaian wajib diisi.',
            'komponen_penilaian.array' => 'Komponen penilaian harus berupa array.',
            'komponen_penilaian.min' => 'Minimal harus ada satu komponen penilaian.',
            'komponen_penilaian.*.kriteria.required' => 'Nama kriteria wajib diisi.',
            'komponen_penilaian.*.kriteria.string' => 'Nama kriteria harus berupa teks.',
            'komponen_penilaian.*.kriteria.max' => 'Nama kriteria maksimal 255 karakter.',
            'komponen_penilaian.*.skor.required' => 'Skor komponen wajib diisi.',
            'komponen_penilaian.*.skor.numeric' => 'Skor komponen harus berupa angka.',
            'komponen_penilaian.*.skor.min' => 'Skor komponen minimal 0.',
            'komponen_penilaian.*.skor.max' => 'Skor komponen maksimal 100.',
            'keputusan_rekomendasi.required' => 'Rekomendasi keputusan wajib dipilih.',
            'keputusan_rekomendasi.in' => 'Rekomendasi keputusan harus berupa salah satu dari: Diterima, Ditolak, atau Revisi.',
            'catatan_evaluasi.required_if' => 'Catatan evaluasi wajib diisi jika rekomendasi keputusan adalah Revisi atau Ditolak.',
            'catatan_evaluasi.string' => 'Catatan evaluasi harus berupa teks.',
            'catatan_evaluasi.max' => 'Catatan evaluasi maksimal 2000 karakter.',
        ];
    }
}
