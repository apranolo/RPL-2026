<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateContractRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $this->authorize('update', $this->route('contract'));
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $contract = $this->route('contract');

        return [
            'contract_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('contracts', 'contract_number')
                    ->ignore($contract->id)
                    ->whereNull('deleted_at'),
            ],
            'contract_date' => 'required|date',
            'party_1' => 'required|string|max:255',
            'party_2' => 'required|string|max:255',
            'total_approved_funding' => 'required|numeric|min:0',
            'contract_status' => 'required|in:aktif,selesai,ditangguhkan',
            'financial_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'contract_number.required' => 'Nomor kontrak harus diisi.',
            'contract_number.unique' => 'Nomor kontrak sudah terdaftar sebelumnya.',
            'contract_date.required' => 'Tanggal kontrak harus diisi.',
            'contract_date.date' => 'Format tanggal tidak valid.',
            'party_1.required' => 'Pihak LPPM harus diisi.',
            'party_2.required' => 'Pihak Peneliti harus diisi.',
            'total_approved_funding.required' => 'Total dana yang disetujui harus diisi.',
            'total_approved_funding.numeric' => 'Total dana harus berupa angka.',
            'total_approved_funding.min' => 'Total dana tidak boleh kurang dari 0.',
            'contract_status.required' => 'Status kontrak harus dipilih.',
            'contract_status.in' => 'Status kontrak tidak valid.',
            'financial_document.file' => 'File harus berupa dokumen.',
            'financial_document.mimes' => 'File hanya boleh berformat PDF, JPG, atau PNG.',
            'financial_document.max' => 'Ukuran file tidak boleh lebih dari 5MB.',
        ];
    }
}
