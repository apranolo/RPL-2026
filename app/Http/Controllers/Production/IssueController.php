<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Support\Facades\DB;

class IssueController extends Controller
{
    public function publish($journalId, $volume, $issue)
    {
        DB::beginTransaction();

        try {
            Article::where('journal_id', $journalId)
                ->where('volume', $volume)
                ->where('issue', $issue)
                ->update([
                    'publication_date' => now()
                ]);

            DB::commit();

            return response()->json([
                'message' => "Issue Vol $volume No $issue berhasil dipublish"
            ]);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Gagal publish issue',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}