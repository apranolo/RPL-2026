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
     * Stores the new cover and, on success, deletes the existing local cover (if any).
     * Returns a fully-qualified public URL (e.g. "http://localhost/jurnal_mu/storage/journal-covers/cover_1_xxx.jpg").
     * Using Storage::url() respects APP_URL so the path is correct under any subdirectory deployment.
     */
    public function upload(UploadedFile $file, Journal $journal): string
    {
        $filename = 'cover_'.$journal->id.'_'.time().'.'.$file->extension();
        $path = $file->storeAs(self::STORAGE_DIR, $filename, self::DISK);

        // Delete the old local cover file if it exists, now that the new one is stored
        $this->deleteExisting($journal);

        return Storage::disk(self::DISK)->url($path);
    }

    /**
     * Delete the existing local cover file for a journal (if stored locally).
     *
     * Handles two stored formats:
     *  - Legacy relative path: /storage/journal-covers/cover_1_xxx.jpg
     *  - Full URL (new format): http://host/storage/journal-covers/cover_1_xxx.jpg
     */
    public function deleteExisting(Journal $journal): void
    {
        // Use getRawOriginal to bypass the accessor so we always get the raw DB value
        $raw = $journal->getRawOriginal('cover_image');

        if (! $raw) {
            return;
        }

        // Legacy relative path: /storage/journal-covers/...
        if (str_starts_with($raw, '/storage/')) {
            $storagePath = ltrim(str_replace('/storage/', '', $raw), '/');
            Storage::disk(self::DISK)->delete($storagePath);

            return;
        }

        // Full URL format: http://...APP_URL.../storage/journal-covers/...
        $storageBaseUrl = rtrim(Storage::disk(self::DISK)->url(''), '/');
        if (str_starts_with($raw, $storageBaseUrl.'/')) {
            $storagePath = ltrim(substr($raw, strlen($storageBaseUrl)), '/');
            Storage::disk(self::DISK)->delete($storagePath);
        }
    }
}
