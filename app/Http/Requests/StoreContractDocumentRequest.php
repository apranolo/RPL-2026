<?php

namespace App\Http\Requests;

use App\Models\ContractDocument;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class StoreContractDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('create', ContractDocument::class);
    }

    public function rules(): array
    {
        return [
            'contract_id' => ['required', 'integer', 'exists:contracts,id'],
            'document' => ['required', 'file', 'mimes:pdf', 'max:5120'],
        ];
    }
}
