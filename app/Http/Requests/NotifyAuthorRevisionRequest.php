<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NotifyAuthorRevisionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Hanya Pengelola Jurnal yang berhak mengirim notifikasi revisi ke Author
        return auth()->check() && auth()->user()->hasRole('Pengelola Jurnal');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => 'required|string|in:Awaiting_Revision,Submitted,Approved,Rejected',
            'editor_decision_note' => 'required|string',
            'due_date' => 'required|date',
        ];
    }
}
