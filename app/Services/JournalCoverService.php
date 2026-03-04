<?php

namespace App\Services;

use App\Models\Journal;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Service for managing journal cover image uploads.
 *
 * Handles storing, replacing, and deleting journal cover images
 * on the public disk under the 'journal-covers/' directory.
 *
 * Constraints enforced at validation layer (StoreJournalRequest / UpdateJournalRequest):
 *  - Formats: JPEG, PNG, JPG, WebP
 *  - Max size: 2MB
 *  - Min resolution: 300×400 px
 */
class JournalCoverService
{
    private const STORAGE_DIR = 'journal-covers';

    private const DISK = 'public';

    /**
     * Upload a new cover image for a journal.
     *
     * Deletes the existing local cover (if any) before storing the new one.
     * Returns the public URL path (e.g. "/storage/journal-covers/cover_1_xxx.jpg").
     */
    public function upload(UploadedFile $file, Journal $journal): string
    {
        // Delete the old local cover file if it exists
        $this->deleteExisting($journal);

        $filename = 'cover_' . $journal->id . '_' . time() . '.' . $file->extension();
        $path = $file->storeAs(self::STORAGE_DIR, $filename, self::DISK);

        return '/storage/' . $path;
    }

    /**
     * Delete the existing local cover file for a journal (if stored locally).
     */
    public function deleteExisting(Journal $journal): void
    {
        if ($journal->cover_image && str_starts_with($journal->cover_image, '/storage/')) {
            $storagePath = str_replace('/storage/', '', $journal->cover_image);
            Storage::disk(self::DISK)->delete($storagePath);
        }
    }
}
