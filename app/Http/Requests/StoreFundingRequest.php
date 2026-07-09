<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFundingRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Verify that the contract belongs to the currently authenticated user's university
        if (! auth()->check()) {
            return false;
        }

        $contractId = $this->input('contract_id');

        if (! $contractId) {
            return false;
        }

        if (! class_exists(\App\Models\Contract::class)) {
            // If Contract model doesn't exist in this branch, deny to be safe.
            return false;
        }

        $contract = \App\Models\Contract::where('id', $contractId)
            ->where('university_id', auth()->user()->university_id)
            ->first();

        return (bool) $contract;
    }

    public function rules(): array
    {
        return [
            'contract_id' => ['required', 'integer'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'termin_number' => ['nullable', 'integer', 'min:1'],
            'termin_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
