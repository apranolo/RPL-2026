<?php

namespace App\Http\Requests\Revision;

use App\Models\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class EditorDecisionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole([Role::USER, Role::SUPER_ADMIN]) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'decision' => 'required|in:Approved,Rejected,Awaiting_Revision',
            'notes' => 'required_if:decision,Rejected,Awaiting_Revision|string|nullable',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'decision.required' => 'Keputusan harus dipilih.',
            'decision.in' => 'Pilihan keputusan tidak valid.',
            'notes.required_if' => 'Catatan wajib diisi jika revisi ditolak atau diminta revisi lagi.',
        ];
    }
}
