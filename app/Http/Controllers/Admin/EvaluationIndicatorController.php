<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreIndicatorRequest;
use App\Http\Requests\Admin\UpdateIndicatorRequest;
use App\Models\EvaluationIndicator;
use App\Models\EvaluationSubCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * EvaluationIndicatorController - Super Admin Only
 *
 * Manages evaluation indicators (v1.1 hierarchical + v1.0 legacy).
 *
 * @route /admin/indicators/*
 */
class EvaluationIndicatorController extends Controller
{
    /**
     * Display a listing of indicators.
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

        // Filter by category (via sub_category relationship)
        if ($request->filled('category_id')) {
            $query->byCategoryId($request->category_id);
        }

        // Filter by mode (hierarchical vs legacy)
        if ($request->filled('mode')) {
            if ($request->mode === 'hierarchical') {
                $query->whereNotNull('sub_category_id');
            } elseif ($request->mode === 'legacy') {
                $query->whereNull('sub_category_id');
            }
        }

        // Filter by status
        if ($request->filled('is_active')) {
            if ($request->is_active === 'active') {
                $query->active();
            } elseif ($request->is_active === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $indicators = $query
            ->ordered()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($indicator) => [
                'id' => $indicator->id,
                'code' => $indicator->code,
                'question' => $indicator->question,
                'weight' => $indicator->weight,
                'answer_type' => $indicator->answer_type,
                'requires_attachment' => $indicator->requires_attachment,
                'sort_order' => $indicator->sort_order,
                'is_active' => $indicator->is_active,
                'is_hierarchical' => $indicator->isHierarchical(),
                'is_legacy' => $indicator->isLegacy(),
                'sub_category' => $indicator->subCategory ? [
                    'id' => $indicator->subCategory->id,
                    'name' => $indicator->subCategory->name,
                    'category' => [
                        'id' => $indicator->subCategory->category->id,
                        'name' => $indicator->subCategory->category->name,
                        'template' => [
                            'id' => $indicator->subCategory->category->template->id,
                            'name' => $indicator->subCategory->category->template->name,
                        ],
                    ],
                ] : null,
                // Legacy fields (for v1.0 indicators)
                'legacy_category' => $indicator->category,
                'legacy_sub_category' => $indicator->sub_category,
            ]);

        $subCategories = EvaluationSubCategory::with('category.template')
            ->select('id', 'category_id', 'name')
            ->ordered()
            ->get();

        return Inertia::render('Admin/Indicators/Index', [
            'indicators' => $indicators,
            'subCategories' => $subCategories,
            'filters' => $request->only(['sub_category_id', 'category_id', 'mode', 'is_active', 'search']),
        ]);
    }

    /**
     * Store a newly created indicator in storage.
     */
    public function store(StoreIndicatorRequest $request): RedirectResponse
    {
        $this->authorize('create', EvaluationIndicator::class);
        $indicator = EvaluationIndicator::create($request->validated());

        return back()->with('success', "Indikator '{$indicator->code}' berhasil dibuat.");
    }

    /**
     * Display the specified indicator.
     */
    public function show(EvaluationIndicator $indicator): Response
    {
        $this->authorize('view', $indicator);

        $indicator->load('subCategory.category.template');

        return Inertia::render('Admin/Indicators/Show', [
            'indicator' => [
                'id' => $indicator->id,
                'code' => $indicator->code,
                'question' => $indicator->question,
                'description' => $indicator->description,
                'weight' => $indicator->weight,
                'answer_type' => $indicator->answer_type,
                'requires_attachment' => $indicator->requires_attachment,
                'sort_order' => $indicator->sort_order,
                'is_active' => $indicator->is_active,
                'is_hierarchical' => $indicator->isHierarchical(),
                'is_legacy' => $indicator->isLegacy(),
                'sub_category' => $indicator->subCategory ? [
                    'id' => $indicator->subCategory->id,
                    'name' => $indicator->subCategory->name,
                    'category' => [
                        'id' => $indicator->subCategory->category->id,
                        'name' => $indicator->subCategory->category->name,
                        'template' => [
                            'id' => $indicator->subCategory->category->template->id,
                            'name' => $indicator->subCategory->category->template->name,
                        ],
                    ],
                ] : null,
                'legacy_category' => $indicator->category,
                'legacy_sub_category' => $indicator->sub_category,
                'created_at' => $indicator->created_at?->format('Y-m-d H:i'),
                'updated_at' => $indicator->updated_at?->format('Y-m-d H:i'),
            ],
        ]);
    }

    /**
     * Update the specified indicator in storage.
     */
    public function update(
        UpdateIndicatorRequest $request,
        EvaluationIndicator $indicator
    ): RedirectResponse {
        $indicator->update($request->validated());

        return back()->with('success', "Indikator '{$indicator->code}' berhasil diperbarui.");
    }

    /**
     * Remove the specified indicator from storage.
     */
    public function destroy(EvaluationIndicator $indicator): RedirectResponse
    {
        $this->authorize('delete', $indicator);

        // Check if indicator is used in submitted assessments
        $hasSubmittedAssessments = $indicator->responses()
            ->whereHas('assessment', function ($query) {
                $query->where('status', 'submitted');
            })
            ->exists();

        if ($hasSubmittedAssessments) {
            return back()->with('error', 'Indikator tidak dapat dihapus karena sudah digunakan dalam assessment yang sudah disubmit.');
        }

        $indicatorCode = $indicator->code;
        $indicator->delete();

        return redirect()
            ->route('admin.indicators.index')
            ->with('success', "Indikator '{$indicatorCode}' berhasil dihapus.");
    }

    /**
     * Migrate legacy indicator to v1.1 hierarchical structure.
     *
     * @route POST /admin/indicators/{indicator}/migrate
     *
     * @features Migrate v1.0 indicator to v1.1 by assigning sub_category_id
     */
    public function migrate(Request $request, EvaluationIndicator $indicator): RedirectResponse
    {
        $this->authorize('migrate', $indicator);

        if (! $indicator->isLegacy()) {
            return back()->with('error', 'Indikator sudah menggunakan struktur hierarchical v1.1.');
        }

        $request->validate([
            'sub_category_id' => ['required', 'exists:evaluation_sub_categories,id'],
        ]);

        $indicator->sub_category_id = $request->sub_category_id;
        $indicator->save();

        $subCategory = EvaluationSubCategory::find($request->sub_category_id);

        return back()->with('success', "Indikator '{$indicator->code}' berhasil dimigrasi ke sub-kategori '{$subCategory->name}'.");
    }

    /**
     * Reorder indicators within a sub-category.
     *
     * @route POST /admin/indicators/reorder
     */
    public function reorder(Request $request): RedirectResponse
    {
        $this->authorize('reorder', EvaluationIndicator::class);

        $request->validate([
            'indicators' => ['required', 'array'],
            'indicators.*.id' => ['required', 'exists:evaluation_indicators,id'],
            'indicators.*.sort_order' => ['required', 'integer', 'min:1'],
        ]);

        foreach ($request->indicators as $item) {
            EvaluationIndicator::where('id', $item['id'])
                ->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Urutan indikator berhasil diperbarui.');
    }
}
