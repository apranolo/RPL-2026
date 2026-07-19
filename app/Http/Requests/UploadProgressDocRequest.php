<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadProgressDocRequest extends FormRequest
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
            'logbook' => [
                'required',
                'file',
                'mimes:pdf,doc,docx,xls,xlsx',
                'max:10240', // 10 MB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'logbook.required' => 'File logbook wajib diunggah.',
            'logbook.file' => 'Unggahan harus berupa file.',
            'logbook.mimes' => 'Format file tidak didukung. Gunakan PDF, DOC, DOCX, XLS, atau XLSX.',
            'logbook.max' => 'Ukuran file tidak boleh melebihi 10 MB.',
        ];
    }
}
