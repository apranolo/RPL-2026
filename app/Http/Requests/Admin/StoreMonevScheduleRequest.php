<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreMonevScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isSuperAdmin();
    }

    public function rules(): array
    {
        return [
            'contract_id' => ['required', 'integer', 'exists:contracts,id'],
            'evaluator_id' => ['required', 'integer', 'exists:users,id'],
            'date' => ['required', 'date'],
            'time' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:scheduled,done,cancelled'],
        ];
    }

    public function attributes(): array
    {
        return [
            'contract_id' => 'kontrak',
            'evaluator_id' => 'evaluator',
            'date' => 'tanggal',
            'time' => 'waktu',
            'location' => 'lokasi',
            'status' => 'status',
        ];
    }

    public function messages(): array
    {
        return [
            'contract_id.required' => 'Kontrak wajib dipilih.',
            'contract_id.exists' => 'Kontrak yang dipilih tidak valid.',
            'evaluator_id.required' => 'Evaluator wajib dipilih.',
            'evaluator_id.exists' => 'Evaluator yang dipilih tidak valid.',
            'date.required' => 'Tanggal wajib diisi.',
            'date.date' => 'Format tanggal tidak valid.',
        ];
    }
}
