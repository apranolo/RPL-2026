<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCriteriaRequest;
use App\Http\Requests\Admin\UpdateCriteriaRequest;
use App\Models\EvaluationIndicator;
use App\Models\EvaluationSubCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CriteriaController - Super Admin Only
 *
 * Manages Kriteria Penilaian (Assessment Criteria) using the
 * EvaluationIndicator model with a dedicated CRUD interface.
 *
 * @route /admin/criteria/*
 */
class CriteriaController extends Controller
{
    /**
     * Display a listing of criteria.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EvaluationIndicator::class);

        $query = EvaluationIndicator::query()
            ->with('subCategory.category.template');

        // Filter by sub-category
        if ($request->filled('sub_category_id')) {
            $query->bySubCategory($request->sub_category_id);
        }

        // Filter by category
        if ($request->filled('category_id')) {
            $query->byCategoryId($request->category_id);
        }

        // Filter by status
        if ($request->filled('is_active')) {
            if ($request->is_active === 'active') {
                $query->active();
            } elseif ($request->is_active === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Filter by answer type
        if ($request->filled('answer_type')) {
            $query->where('answer_type', $request->answer_type);
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $criteria = $query
            ->ordered()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($indicator) => [
                'id' => $indicator->id,
                'code' => $indicator->code,
                'question' => $indicator->question,
                'description' => $indicator->description,
                'weight' => $indicator->weight,
                'answer_type' => $indicator->answer_type,
                'answer_type_label' => $indicator->answer_type_label,
                'requires_attachment' => $indicator->requires_attachment,
                'sort_order' => $indicator->sort_order,
                'is_active' => $indicator->is_active,
                // Ditambahkan nullsafe operator (?->) pada nested relation mapping
                'sub_category' => $indicator->subCategory ? [
                    'id' => $indicator->subCategory->id,
                    'name' => $indicator->subCategory->name,
                    'category' => [
                        'id' => $indicator->subCategory->category?->id,
                        'name' => $indicator->subCategory->category?->name,
                        'template' => [
                            'id' => $indicator->subCategory->category?->template?->id,
                            'name' => $indicator->subCategory->category?->template?->name,
                        ],
                    ],
                ] : null,
            ]);

        $subCategories = EvaluationSubCategory::with('category.template')
            ->select('id', 'category_id', 'name')
            ->ordered()
            ->get()
            ->map(fn ($sub) => [
                'id' => $sub->id,
                'name' => $sub->name,
                'category_id' => $sub->category_id,
                'category_name' => $sub->category?->name,
                'template_name' => $sub->category?->template?->name,
            ]);

        return Inertia::render('Admin/Criteria/Index', [
            'criteria' => $criteria,
            'subCategories' => $subCategories,
            'filters' => $request->only(['sub_category_id', 'category_id', 'is_active', 'answer_type', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new criterion.
     */
    public function create(): Response
    {
        $this->authorize('create', EvaluationIndicator::class);

        $subCategories = EvaluationSubCategory::with('category.template')
            ->select('id', 'category_id', 'name')
            ->ordered()
            ->get()
            ->map(fn ($sub) => [
                'id' => $sub->id,
                'name' => $sub->name,
                'category_id' => $sub->category_id,
                'category_name' => $sub->category?->name,
                'template_name' => $sub->category?->template?->name,
            ]);

        return Inertia::render('Admin/Criteria/Create', [
            'subCategories' => $subCategories,
        ]);
    }

    /**
     * Store a newly created criterion in storage (BATCH/DYNAMIC PROCESS).
     */
    public function store(StoreCriteriaRequest $request): RedirectResponse
    {
        $this->authorize('create', EvaluationIndicator::class);

        $validated = $request->validated();
        $subCategoryId = $validated['sub_category_id'];
        $count = 0;

        // Memproses penyimpanan secara batch menggunakan Database Transaction
        DB::transaction(function () use ($validated, $subCategoryId, &$count) {
            foreach ($validated['criteria'] as $index => $item) {
                // Menghitung urutan tampil otomatis jika kosong
                $sortOrder = $item['sort_order'] ??
                    (EvaluationIndicator::where('sub_category_id', $subCategoryId)->max('sort_order') + 1 + $index);

                EvaluationIndicator::create([
                    'sub_category_id' => $subCategoryId,
                    'code' => $item['code'],
                    'question' => $item['question'],
                    'description' => $item['description'] ?? null,
                    'weight' => $item['weight'],
                    'answer_type' => $item['answer_type'],
                    'requires_attachment' => $item['requires_attachment'],
                    'sort_order' => $sortOrder,
                    'is_active' => $item['is_active'],
                ]);
                $count++;
            }
        });

        return redirect()
            ->route('admin.criteria.index')
            ->with('success', "Sebanyak {$count} Kriteria Penilaian berhasil ditambahkan.");
    }

    /**
     * Display the specified criterion.
     */
    public function show(EvaluationIndicator $criterion): Response
    {
        $this->authorize('view', $criterion);

        $criterion->load('subCategory.category.template');

        return Inertia::render('Admin/Criteria/Show', [
            'criterion' => [
                'id' => $criterion->id,
                'code' => $criterion->code,
                'question' => $criterion->question,
                'description' => $criterion->description,
                'weight' => $criterion->weight,
                'answer_type' => $criterion->answer_type,
                'answer_type_label' => $criterion->answer_type_label,
                'requires_attachment' => $criterion->requires_attachment,
                'sort_order' => $criterion->sort_order,
                'is_active' => $criterion->is_active,
                // Ditambahkan nullsafe operator (?->) pada nested relation mapping
                'sub_category' => $criterion->subCategory ? [
                    'id' => $criterion->subCategory->id,
                    'name' => $criterion->subCategory->name,
                    'category' => [
                        'id' => $criterion->subCategory->category?->id,
                        'name' => $criterion->subCategory->category?->name,
                        'template' => [
                            'id' => $criterion->subCategory->category?->template?->id,
                            'name' => $criterion->subCategory->category?->template?->name,
                        ],
                    ],
                ] : null,
                'created_at' => $criterion->created_at?->format('Y-m-d H:i'),
                'updated_at' => $criterion->updated_at?->format('Y-m-d H:i'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified criterion.
     */
    public function edit(EvaluationIndicator $criterion): Response
    {
        $this->authorize('update', $criterion);

        $criterion->load('subCategory.category.template');

        $subCategories = EvaluationSubCategory::with('category.template')
            ->select('id', 'category_id', 'name')
            ->ordered()
            ->get()
            ->map(fn ($sub) => [
                'id' => $sub->id,
                'name' => $sub->name,
                'category_id' => $sub->category_id,
                'category_name' => $sub->category?->name,
                'template_name' => $sub->category?->template?->name,
            ]);

        return Inertia::render('Admin/Criteria/Edit', [
            'criterion' => [
                'id' => $criterion->id,
                'code' => $criterion->code,
                'question' => $criterion->question,
                'description' => $criterion->description,
                'weight' => (float) $criterion->weight,
                'answer_type' => $criterion->answer_type,
                'requires_attachment' => $criterion->requires_attachment,
                'sort_order' => $criterion->sort_order,
                'is_active' => $criterion->is_active,
                'sub_category_id' => $criterion->sub_category_id,
            ],
            'subCategories' => $subCategories,
        ]);
    }

    /**
     * Update the specified criterion in storage.
     */
    public function update(
        UpdateCriteriaRequest $request,
        EvaluationIndicator $criterion
    ): RedirectResponse {
        // Ditambahkan baris instruksi otorisasi sesuai penugasan
        $this->authorize('update', $criterion);

        $criterion->update($request->validated());

        return redirect()
            ->route('admin.criteria.index')
            ->with('success', "Kriteria Penilaian '{$criterion->code}' berhasil diperbarui.");
    }

    /**
     * Remove the specified criterion from storage.
     */
    public function destroy(EvaluationIndicator $criterion): RedirectResponse
    {
        $this->authorize('delete', $criterion);

        $hasSubmittedAssessments = $criterion->responses()
            ->whereHas('journalAssessment', function ($query) {
                $query->where('status', 'submitted');
            })
            ->exists();

        if ($hasSubmittedAssessments) {
            return back()->with('error', 'Kriteria tidak dapat dihapus karena sudah digunakan dalam assessment yang sudah disubmit.');
        }

        $criterionCode = $criterion->code;
        $criterion->delete();

        return redirect()
            ->route('admin.criteria.index')
            ->with('success', "Kriteria Penilaian '{$criterionCode}' berhasil dihapus.");
    }
}
