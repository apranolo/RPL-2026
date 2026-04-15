<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEssayRequest;
use App\Http\Requests\Admin\UpdateEssayRequest;
use App\Models\EssayQuestion;
use App\Models\EvaluationCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * EssayQuestionController - Super Admin Only
 *
 * Manages essay questions linked to categories.
 *
 * @route /admin/essays/*
 */
class EssayQuestionController extends Controller
{
    /**
     * Display a listing of essay questions.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EssayQuestion::class);

        $query = EssayQuestion::query()->with('category.template');

        // Filter by category
        if ($request->filled('category_id')) {
            $query->forCategory($request->category_id);
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

        $essays = $query
            ->ordered()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($essay) => [
                'id' => $essay->id,
                'code' => $essay->code,
                'question' => $essay->question,
                'max_words' => $essay->max_words,
                'is_required' => $essay->is_required,
                'is_active' => $essay->is_active,
                'display_order' => $essay->display_order,
                'category' => [
                    'id' => $essay->category->id,
                    'name' => $essay->category->name,
                    'template' => [
                        'id' => $essay->category->template->id,
                        'name' => $essay->category->template->name,
                    ],
                ],
            ]);

        $categories = EvaluationCategory::with('template:id,name')
            ->select('id', 'template_id', 'name')
            ->ordered()
            ->get();

        return Inertia::render('Admin/Essays/Index', [
            'essays' => $essays,
            'categories' => $categories,
            'filters' => $request->only(['category_id', 'is_active', 'search']),
        ]);
    }

    /**
     * Store a newly created essay question in storage.
     */
    public function store(StoreEssayRequest $request): RedirectResponse
    {
        $this->authorize('create', EssayQuestion::class);
        $essay = EssayQuestion::create($request->validated());

        return back()->with('success', "Essay question '{$essay->code}' berhasil dibuat.");
    }

    /**
     * Display the specified essay question.
     */
    public function show(EssayQuestion $essay): Response
    {
        $this->authorize('view', $essay);

        $essay->load('category.template');

        return Inertia::render('Admin/Essays/Show', [
            'essay' => [
                'id' => $essay->id,
                'code' => $essay->code,
                'question' => $essay->question,
                'guidance' => $essay->guidance,
                'max_words' => $essay->max_words,
                'is_required' => $essay->is_required,
                'is_active' => $essay->is_active,
                'display_order' => $essay->display_order,
                'category' => [
                    'id' => $essay->category->id,
                    'name' => $essay->category->name,
                    'template' => [
                        'id' => $essay->category->template->id,
                        'name' => $essay->category->template->name,
                    ],
                ],
                'created_at' => $essay->created_at?->format('Y-m-d H:i'),
                'updated_at' => $essay->updated_at?->format('Y-m-d H:i'),
            ],
        ]);
    }

    /**
     * Update the specified essay question in storage.
     */
    public function update(UpdateEssayRequest $request, EssayQuestion $essay): RedirectResponse
    {
        $essay->update($request->validated());

        return back()->with('success', "Essay question '{$essay->code}' berhasil diperbarui.");
    }

    /**
     * Remove the specified essay question from storage.
     */
    public function destroy(EssayQuestion $essay): RedirectResponse
    {
        $this->authorize('delete', $essay);

        $essayCode = $essay->code;
        $essay->delete();

        return redirect()
            ->route('admin.essays.index')
            ->with('success', "Essay question '{$essayCode}' berhasil dihapus.");
    }

    /**
     * Toggle the active status of essay question.
     *
     * @route POST /admin/essays/{essay}/toggle
     */
    public function toggleActive(EssayQuestion $essay): RedirectResponse
    {
        $this->authorize('toggleActive', $essay);

        $essay->is_active = ! $essay->is_active;
        $essay->save();

        $status = $essay->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Essay question '{$essay->code}' berhasil {$status}.");
    }

    /**
     * Reorder essay questions within a category.
     *
     * @route POST /admin/essays/reorder
     */
    public function reorder(Request $request): RedirectResponse
    {
        $this->authorize('reorder', EssayQuestion::class);

        $request->validate([
            'essays' => ['required', 'array'],
            'essays.*.id' => ['required', 'exists:essay_questions,id'],
            'essays.*.display_order' => ['required', 'integer', 'min:1'],
        ]);

        foreach ($request->essays as $item) {
            EssayQuestion::where('id', $item['id'])
                ->update(['display_order' => $item['display_order']]);
        }

        return back()->with('success', 'Urutan essay questions berhasil diperbarui.');
    }
}
