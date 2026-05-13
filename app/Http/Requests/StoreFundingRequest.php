<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFundingRequest extends FormRequest
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
            'contract_id' => 'required|integer',
            'termin_name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'disbursement_date' => 'required|date',
            'evidence' => 'nullable|file|mimes:pdf,jpg,png|max:5120', // 5MB max
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'amount.min' => 'Nominal dana tidak boleh negatif.',
            'evidence.mimes' => 'Bukti pencairan harus berupa file PDF, JPG, atau PNG.',
            'evidence.max' => 'Ukuran file bukti pencairan maksimal 5MB.',
        ];
    }
}
