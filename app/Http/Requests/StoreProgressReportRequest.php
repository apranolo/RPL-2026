<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProgressReportRequest extends FormRequest
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
            'judul' => 'required|string|max:255',
            'periode' => 'required|string|max:50',
            'tanggal_laporan' => 'required|date',
            'deskripsi' => 'required|string',
            'catatan' => 'nullable|string',
            'status' => 'nullable|in:draft,submitted',
            'dokumen_laporan' => 'nullable|file|mimes:pdf,doc,docx|max:10240', // 10 MB
            'logbook' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx|max:10240', // 10 MB
        ];
    }
}
