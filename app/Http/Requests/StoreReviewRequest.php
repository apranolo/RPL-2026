<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Menggunakan hasRole(Role::REVIEWER) yang menangani fallback legacy
     * secara aman, sesuai aturan proyek.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole(Role::REVIEWER);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'proposal_id' => 'required|integer|exists:proposals,id',
            'komponen_penilaian' => 'required|array|min:1',
            'komponen_penilaian.*.kriteria' => 'required|string',
            'komponen_penilaian.*.bobot' => 'required|numeric|min:0|max:100',
            'komponen_penilaian.*.skor' => 'required|integer|min:1|max:5',
            'score' => 'required|numeric|min:0|max:100',
            'comments' => 'required_if:recommendation,revision,rejected|nullable|string',
            'recommendation' => 'required|in:accepted,rejected,revision',
        ];
    }
}
