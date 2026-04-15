<?php

namespace App\Http\Requests\Admin;

use App\Models\EvaluationCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isSuperAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'weight' => ['required', 'numeric', 'min:0', 'max:100'],
            'display_order' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isEmpty() && $this->filled('weight')) {
                // Get the category being updated
                $category = EvaluationCategory::find($this->route('category'));

                if ($category && $category->template) {
                    $template = $category->template;
                    $currentTotalWeight = $template->getTotalWeight();
                    $oldWeight = $category->weight;
                    $newWeight = (float) $this->weight;

                    // Calculate what the total would be after update
                    $projectedTotal = $currentTotalWeight - $oldWeight + $newWeight;

                    if ($projectedTotal > 100) {
                        $validator->errors()->add(
                            'weight',
                            "Total bobot kategori akan melebihi 100% (proyeksi: {$projectedTotal}%). Maksimal bobot yang dapat diset: ".(100 - ($currentTotalWeight - $oldWeight)).'%'
                        );
                    }
                }
            }
        });
    }

    public function attributes(): array
    {
        return [
            'code' => 'kode kategori',
            'name' => 'nama kategori',
            'description' => 'deskripsi',
            'weight' => 'bobot',
            'display_order' => 'urutan tampilan',
        ];
    }

    public function messages(): array
    {
        return [
            'weight.max' => 'Bobot kategori tidak boleh melebihi 100.',
            'weight.min' => 'Bobot kategori tidak boleh negatif.',
        ];
    }
}
