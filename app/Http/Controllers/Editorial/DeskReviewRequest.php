<?php

namespace App\Http\Requests\Editorial;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request untuk validasi keputusan Desk Review.
 */
class DeskReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'decision'         => ['required', 'in:approved,rejected'],
            'rejection_reason' => [
                $this->decision === 'rejected' ? 'required' : 'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'decision.required'         => 'Keputusan desk review wajib dipilih.',
            'decision.in'               => 'Keputusan tidak valid.',
            'rejection_reason.required' => 'Catatan penolakan wajib diisi jika submission ditolak.',
            'rejection_reason.max'      => 'Catatan penolakan maksimal 1000 karakter.',
        ];
    }
}