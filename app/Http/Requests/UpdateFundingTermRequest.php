<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFundingTermRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('super_admin') || $this->user()->hasRole('admin_kampus');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $fundingTerm = $this->route('funding_term');

        return [
            'term_name' => 'required|string|max:255',
            'percentage' => 'required|numeric|min:0|max:100',
            'nominal' => 'required|numeric|min:0',
            'status' => 'required|in:cair,menunggu,ditangguhkan,batal',
            'disbursement_date' => 'nullable|date',
            'receipt_number' => 'nullable|string|max:100',
            'receipt_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'notes' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'term_name.required' => 'Nama termin harus diisi.',
            'percentage.required' => 'Persentase harus diisi.',
            'percentage.numeric' => 'Persentase harus berupa angka.',
            'percentage.min' => 'Persentase tidak boleh kurang dari 0.',
            'percentage.max' => 'Persentase tidak boleh lebih dari 100.',
            'nominal.required' => 'Nominal dana harus diisi.',
            'nominal.numeric' => 'Nominal dana harus berupa angka.',
            'nominal.min' => 'Nominal dana tidak boleh kurang dari 0.',
            'status.required' => 'Status termin harus dipilih.',
            'status.in' => 'Status termin tidak valid.',
            'disbursement_date.date' => 'Format tanggal tidak valid.',
            'receipt_file.file' => 'File harus berupa dokumen.',
            'receipt_file.mimes' => 'File hanya boleh berformat PDF, JPG, atau PNG.',
            'receipt_file.max' => 'Ukuran file tidak boleh lebih dari 5MB.',
        ];
    }
}
