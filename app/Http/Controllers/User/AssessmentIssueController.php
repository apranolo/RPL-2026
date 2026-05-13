<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AssessmentIssue;
use App\Models\JournalAssessment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssessmentIssueController extends Controller
{
    /**
     * Store a newly created issue.
     */
    public function store(Request $request, JournalAssessment $assessment)
    {
        // Authorize - user can only add issues to their own draft assessments
        $this->authorize('update', $assessment);

        if ($assessment->status !== 'draft') {
            return back()->with('error', 'Tidak dapat menambah issue pada assessment yang sudah disubmit');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'required|string|max:1000',
            'category' => 'required|in:editorial,technical,content_quality,management',
            'priority' => 'required|in:high,medium,low',
        ]);

        try {
            // Get max display order
            $maxOrder = $assessment->issues()->max('display_order') ?? 0;

            $issue = $assessment->issues()->create([
                ...$validated,
                'display_order' => $maxOrder + 1,
            ]);

            return back()->with('success', 'Issue berhasil ditambahkan');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menambahkan issue: '.$e->getMessage());
        }
    }

    /**
     * Update the specified issue.
     */
    public function update(Request $request, JournalAssessment $assessment, AssessmentIssue $issue)
    {
        // Authorize
        $this->authorize('update', $assessment);

        if ($assessment->status !== 'draft') {
            return back()->with('error', 'Tidak dapat mengubah issue pada assessment yang sudah disubmit');
        }

        // Verify issue belongs to this assessment
        if ($issue->journal_assessment_id !== $assessment->id) {
            return back()->with('error', 'Issue tidak ditemukan');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'required|string|max:1000',
            'category' => 'required|in:editorial,technical,content_quality,management',
            'priority' => 'required|in:high,medium,low',
        ]);

        try {
            $issue->update($validated);

            return back()->with('success', 'Issue berhasil diupdate');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengupdate issue: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified issue.
     */
    public function destroy(JournalAssessment $assessment, AssessmentIssue $issue)
    {
        // Authorize
        $this->authorize('update', $assessment);

        if ($assessment->status !== 'draft') {
            return back()->with('error', 'Tidak dapat menghapus issue pada assessment yang sudah disubmit');
        }

        // Verify issue belongs to this assessment
        if ($issue->journal_assessment_id !== $assessment->id) {
            return back()->with('error', 'Issue tidak ditemukan');
        }

        try {
            $issue->delete();

            return back()->with('success', 'Issue berhasil dihapus');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus issue: '.$e->getMessage());
        }
    }

    /**
     * Reorder issues.
     */
    public function reorder(Request $request, JournalAssessment $assessment)
    {
        // Authorize
        $this->authorize('update', $assessment);

        if ($assessment->status !== 'draft') {
            return back()->with('error', 'Tidak dapat mengurutkan issue pada assessment yang sudah disubmit');
        }

        $validated = $request->validate([
            'issues' => 'required|array',
            'issues.*' => 'required|exists:assessment_issues,id',
        ]);

        DB::beginTransaction();
        try {
            foreach ($validated['issues'] as $index => $issueId) {
                $issue = AssessmentIssue::find($issueId);

                // Verify issue belongs to this assessment
                if ($issue && $issue->journal_assessment_id === $assessment->id) {
                    $issue->update(['display_order' => $index]);
                }
            }

            DB::commit();

            return back()->with('success', 'Urutan issue berhasil diupdate');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Gagal mengupdate urutan: '.$e->getMessage());
        }
    }
}
