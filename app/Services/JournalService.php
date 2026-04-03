<?php

namespace App\Services;

use App\Models\Journal;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class JournalService
{
    public function __construct(
        private readonly JournalCoverService $coverService,
    ) {}

    /**
     * Create a new journal with transaction and logging.
     *
     * @param array $data Validated journal data
     * @param UploadedFile|null $coverFile Optional cover image file
     * @param User $creator The user creating the journal (Admin Kampus or User)
     * @param int|null $targetUserId Optional specific user ID to own the journal (for Admin Kampus)
     * @return Journal
     * @throws \Exception
     */
    public function createJournal(array $data, ?UploadedFile $coverFile, User $creator, ?int $targetUserId = null): Journal
    {
        return DB::transaction(function () use ($data, $coverFile, $creator, $targetUserId) {
            try {
                $data['university_id'] = $creator->university_id;

                if ($targetUserId) {
                    $data['user_id'] = $targetUserId;
                } else {
                    $data['user_id'] = $creator->id;
                }

                if ($creator->isAdminKampus()) {
                    $data['approval_status'] = 'approved';
                    $data['approved_by'] = $creator->id;
                    $data['approved_at'] = now();
                }

                // Unset cover_image to prevent passing UploadedFile to create()
                unset($data['cover_image']);

                $journal = Journal::create($data);
                Log::info("Journal created successfully", ['journal_id' => $journal->id, 'creator_id' => $creator->id]);

                if ($coverFile) {
                    try {
                        $coverPath = $this->coverService->upload($coverFile, $journal);
                        $journal->update(['cover_image' => $coverPath]);
                    } catch (\Exception $e) {
                        Log::warning("Failed to upload cover image for journal", [
                            'journal_id' => $journal->id,
                            'error' => $e->getMessage()
                        ]);
                        // We intentionally do not throw here to allow journal creation to succeed even if cover fails.
                    }
                }

                return $journal;
            } catch (\Exception $e) {
                Log::error("Failed to create journal", [
                    'creator_id' => $creator->id,
                    'data' => $data,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                throw $e;
            }
        });
    }
}