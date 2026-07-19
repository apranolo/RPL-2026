<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGalleyRequest extends FormRequest
{
    public function authorize(): bool
    {
        // authorization dipindah ke controller/policy
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => 'required|string|max:255',
            'file'  => 'required|file|mimes:pdf,html,xml|max:10240',
        ];
    }
}