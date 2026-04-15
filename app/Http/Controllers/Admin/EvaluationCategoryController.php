<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\AccreditationTemplate;
use App\Models\EvaluationCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * EvaluationCategoryController - Super Admin Only
 *
 * Manages evaluation categories (Level 1 - Unsur Evaluasi).
 *
 * @route /admin/categories/*
 */
class EvaluationCategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EvaluationCategory::class);

        $query = EvaluationCategory::query()
            ->with('template')
            ->withCount(['subCategories', 'indicators', 'essayQuestions']);

        // Filter by template
        if ($request->filled('template_id')) {
            $query->forTemplate($request->template_id);
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $categories = $query
            ->ordered()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($category) => [
                'id' => $category->id,
                'code' => $category->code,
                'name' => $category->name,
                'weight' => $category->weight,
                'display_order' => $category->display_order,
                'template' => [
                    'id' => $category->template->id,
                    'name' => $category->template->name,
                    'type' => $category->template->type,
                ],
                'sub_categories_count' => $category->sub_categories_count,
                'indicators_count' => $category->indicators_count,
                'essay_questions_count' => $category->essay_questions_count,
            ]);

        $templates = AccreditationTemplate::select('id', 'name', 'type')->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'templates' => $templates,
            'filters' => $request->only(['template_id', 'search']),
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $this->authorize('create', EvaluationCategory::class);
        $category = EvaluationCategory::create($request->validated());

        return back()->with('success', "Kategori '{$category->name}' berhasil dibuat.");
    }

    /**
     * Display the specified category.
     */
    public function show(EvaluationCategory $category): Response
    {
        $this->authorize('view', $category);

        $category->load([
            'template',
            'subCategories' => fn ($q) => $q->withCount('indicators')->ordered(),
            'essayQuestions' => fn ($q) => $q->ordered(),
        ]);

        $statistics = $category->getStatistics();

        return Inertia::render('Admin/Categories/Show', [
            'category' => [
                'id' => $category->id,
                'code' => $category->code,
                'name' => $category->name,
                'description' => $category->description,
                'weight' => $category->weight,
                'display_order' => $category->display_order,
                'template' => [
                    'id' => $category->template->id,
                    'name' => $category->template->name,
                    'type' => $category->template->type,
                ],
                'statistics' => $statistics,
                'can_be_deleted' => $category->canBeDeleted(),
                'sub_categories' => $category->subCategories->map(fn ($sub) => [
                    'id' => $sub->id,
                    'code' => $sub->code,
                    'name' => $sub->name,
                    'display_order' => $sub->display_order,
                    'indicators_count' => $sub->indicators_count,
                ]),
                'essays' => $category->essayQuestions->map(fn ($essay) => [
                    'id' => $essay->id,
                    'code' => $essay->code,
                    'question' => $essay->question,
                    'is_required' => $essay->is_required,
                    'is_active' => $essay->is_active,
                    'display_order' => $essay->display_order,
                ]),
            ],
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(
        UpdateCategoryRequest $request,
        EvaluationCategory $category
    ): RedirectResponse {
        $category->update($request->validated());

        return back()->with('success', "Kategori '{$category->name}' berhasil diperbarui.");
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(EvaluationCategory $category): RedirectResponse
    {
        $this->authorize('delete', $category);

        if (! $category->canBeDeleted()) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena memiliki indikator yang digunakan dalam assessment yang sudah disubmit.');
        }

        $categoryName = $category->name;
        $category->delete();

        return redirect()
            ->route('admin.categories.index')
            ->with('success', "Kategori '{$categoryName}' berhasil dihapus.");
    }

    /**
     * Reorder categories within a template.
     *
     * @route POST /admin/categories/reorder
     */
    public function reorder(Request $request): RedirectResponse
    {
        $this->authorize('reorder', EvaluationCategory::class);

        $request->validate([
            'categories' => ['required', 'array'],
            'categories.*.id' => ['required', 'exists:evaluation_categories,id'],
            'categories.*.display_order' => ['required', 'integer', 'min:1'],
        ]);

        foreach ($request->categories as $item) {
            EvaluationCategory::where('id', $item['id'])
                ->update(['display_order' => $item['display_order']]);
        }

        return back()->with('success', 'Urutan kategori berhasil diperbarui.');
    }
}
