<?php

namespace App\Http\Requests;

use App\Models\Contract;
use App\Services\FundingService;
use Illuminate\Foundation\Http\FormRequest;

class StoreFundingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && $user->hasAnyRole(['Admin Keuangan', 'Super Admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id_contract' => ['required', 'integer', 'exists:contracts,id'],
            'percentage' => ['required', 'numeric', 'min:0.01', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'funding_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:funding_date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->any()) {
                return;
            }

            $contract = Contract::find($this->input('id_contract'));

            if (! $contract) {
                return;
            }

            $service = app(FundingService::class);
            $percentage = (float) $this->input('percentage');

            if (! $service->validateTerminPercentage($contract, $percentage)) {
                $sisa = $service->calculateSisa($contract);
                $validator->errors()->add(
                    'percentage',
                    'Akumulasi persentase seluruh termin tidak boleh melebihi 100%. Sisa persentase yang tersedia: ' . $sisa['sisa_persentase'] . '%'
                );
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'id_contract.required' => 'Kontrak wajib dipilih.',
            'id_contract.exists' => 'Kontrak yang dipilih tidak ditemukan.',
            'percentage.required' => 'Persentase pencairan wajib diisi.',
            'percentage.numeric' => 'Persentase harus berupa angka.',
            'percentage.min' => 'Persentase minimal 0.01%.',
            'percentage.max' => 'Persentase tidak boleh lebih dari 100%.',
            'description.max' => 'Deskripsi tidak boleh lebih dari 500 karakter.',
            'funding_date.date' => 'Tanggal pencairan harus berupa tanggal yang valid.',
            'due_date.date' => 'Tanggal jatuh tempo harus berupa tanggal yang valid.',
            'due_date.after_or_equal' => 'Tanggal jatuh tempo harus setelah atau sama dengan tanggal pencairan.',
            'notes.max' => 'Catatan tidak boleh lebih dari 1000 karakter.',
        ];
    }
}
