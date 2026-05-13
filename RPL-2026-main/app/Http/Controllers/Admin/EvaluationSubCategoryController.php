<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubCategoryRequest;
use App\Http\Requests\Admin\UpdateSubCategoryRequest;
use App\Models\EvaluationCategory;
use App\Models\EvaluationSubCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * EvaluationSubCategoryController - Super Admin Only
 *
 * Manages evaluation sub-categories (Level 2 - Sub-Unsur).
 *
 * @route /admin/sub-categories/*
 */
class EvaluationSubCategoryController extends Controller
{
    /**
     * Display a listing of sub-categories.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EvaluationSubCategory::class);

        $query = EvaluationSubCategory::query()
            ->with('category.template')
            ->withCount('indicators');

        // Filter by category
        if ($request->filled('category_id')) {
            $query->forCategory($request->category_id);
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $subCategories = $query
            ->ordered()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($sub) => [
                'id' => $sub->id,
                'code' => $sub->code,
                'name' => $sub->name,
                'display_order' => $sub->display_order,
                'category' => [
                    'id' => $sub->category->id,
                    'name' => $sub->category->name,
                    'template' => [
                        'id' => $sub->category->template->id,
                        'name' => $sub->category->template->name,
                    ],
                ],
                'indicators_count' => $sub->indicators_count,
            ]);

        $categories = EvaluationCategory::with('template:id,name')
            ->select('id', 'template_id', 'name')
            ->ordered()
            ->get();

        return Inertia::render('Admin/SubCategories/Index', [
            'subCategories' => $subCategories,
            'categories' => $categories,
            'filters' => $request->only(['category_id', 'search']),
        ]);
    }

    /**
     * Store a newly created sub-category in storage.
     */
    public function store(StoreSubCategoryRequest $request): RedirectResponse
    {
        $this->authorize('create', EvaluationSubCategory::class);
        $subCategory = EvaluationSubCategory::create($request->validated());

        return back()->with('success', "Sub-kategori '{$subCategory->name}' berhasil dibuat.");
    }

    /**
     * Display the specified sub-category.
     */
    public function show(EvaluationSubCategory $subCategory): Response
    {
        $this->authorize('view', $subCategory);

        $subCategory->load([
            'category.template',
            'indicators' => fn ($q) => $q->ordered(),
        ]);

        return Inertia::render('Admin/SubCategories/Show', [
            'subCategory' => [
                'id' => $subCategory->id,
                'code' => $subCategory->code,
                'name' => $subCategory->name,
                'description' => $subCategory->description,
                'display_order' => $subCategory->display_order,
                'category' => [
                    'id' => $subCategory->category->id,
                    'name' => $subCategory->category->name,
                    'template' => [
                        'id' => $subCategory->category->template->id,
                        'name' => $subCategory->category->template->name,
                    ],
                ],
                'can_be_deleted' => $subCategory->canBeDeleted(),
                'indicators' => $subCategory->indicators->map(fn ($indicator) => [
                    'id' => $indicator->id,
                    'code' => $indicator->code,
                    'question' => $indicator->question,
                    'weight' => $indicator->weight,
                    'sort_order' => $indicator->sort_order,
                    'is_active' => $indicator->is_active,
                ]),
            ],
        ]);
    }

    /**
     * Update the specified sub-category in storage.
     */
    public function update(
        UpdateSubCategoryRequest $request,
        EvaluationSubCategory $subCategory
    ): RedirectResponse {
        $subCategory->update($request->validated());

        return back()->with('success', "Sub-kategori '{$subCategory->name}' berhasil diperbarui.");
    }

    /**
     * Remove the specified sub-category from storage.
     */
    public function destroy(EvaluationSubCategory $subCategory): RedirectResponse
    {
        $this->authorize('delete', $subCategory);

        if (! $subCategory->canBeDeleted()) {
            return back()->with('error', 'Sub-kategori tidak dapat dihapus karena memiliki indikator yang digunakan dalam assessment yang sudah disubmit.');
        }

        $subCategoryName = $subCategory->name;
        $subCategory->delete();

        return redirect()
            ->route('admin.sub-categories.index')
            ->with('success', "Sub-kategori '{$subCategoryName}' berhasil dihapus.");
    }

    /**
     * Move sub-category to another category.
     *
     * @route POST /admin/sub-categories/{subCategory}/move
     */
    public function move(Request $request, EvaluationSubCategory $subCategory): RedirectResponse
    {
        $this->authorize('move', $subCategory);

        $request->validate([
            'new_category_id' => ['required', 'exists:evaluation_categories,id'],
        ]);

        try {
            $subCategory->moveToCategory($request->new_category_id);

            $newCategory = EvaluationCategory::find($request->new_category_id);

            return back()->with('success', "Sub-kategori '{$subCategory->name}' berhasil dipindahkan ke kategori '{$newCategory->name}'.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reorder sub-categories within a category.
     *
     * @route POST /admin/sub-categories/reorder
     */
    public function reorder(Request $request): RedirectResponse
    {
        $this->authorize('reorder', EvaluationSubCategory::class);

        $request->validate([
            'sub_categories' => ['required', 'array'],
            'sub_categories.*.id' => ['required', 'exists:evaluation_sub_categories,id'],
            'sub_categories.*.display_order' => ['required', 'integer', 'min:1'],
        ]);

        foreach ($request->sub_categories as $item) {
            EvaluationSubCategory::where('id', $item['id'])
                ->update(['display_order' => $item['display_order']]);
        }

        return back()->with('success', 'Urutan sub-kategori berhasil diperbarui.');
    }
}
