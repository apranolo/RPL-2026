<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use Illuminate\Support\Facades\DB;

class IssueController extends Controller
{
    public function publish($journalId, $volume, $issue)
    {
        DB::beginTransaction();

        try {
            $issueModel = Issue::where('journal_id', $journalId)
                ->where('volume', $volume)
                ->where('number', $issue)
                ->firstOrFail();

            $issueModel->update([
                'status' => 'Published',
                'publication_date' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => "Issue Vol {$volume} No {$issue} berhasil dipublish",
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Gagal publish issue',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}