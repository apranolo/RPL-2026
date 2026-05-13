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
     * Returns the relative storage path (e.g. "journal-covers/cover_1_xxx.jpg").
     * The path is resolved to a full URL by the getCoverImageAttribute() accessor on the
     * Journal model, keeping the stored value domain-agnostic and deployment-safe.
     */
    public function upload(UploadedFile $file, Journal $journal): string
    {
        $filename = 'cover_'.$journal->id.'_'.time().'.'.$file->extension();
        $path = $file->storeAs(self::STORAGE_DIR, $filename, self::DISK);

        // Delete the old local cover file if it exists, now that the new one is stored
        $this->deleteExisting($journal);

        // Return the relative path so the stored value is domain-agnostic.
        // The Journal accessor (getCoverImageAttribute) resolves it to a full URL at read time.
        return $path;
    }

    /**
     * Delete the existing local cover file for a journal (if stored locally).
     *
     * Handles three stored formats:
     *  - Relative path (current format): journal-covers/cover_1_xxx.jpg
     *  - Legacy absolute path: /storage/journal-covers/cover_1_xxx.jpg
     *  - Full URL (deprecated format): http://host/storage/journal-covers/cover_1_xxx.jpg
     */
    public function deleteExisting(Journal $journal): void
    {
        // Use getRawOriginal to bypass the accessor so we always get the raw DB value
        $raw = $journal->getRawOriginal('cover_image');

        if (! $raw) {
            return;
        }

        // Current format — relative path: journal-covers/cover_1_xxx.jpg
        if (! str_starts_with($raw, '/') && ! str_starts_with($raw, 'http://') && ! str_starts_with($raw, 'https://')) {
            Storage::disk(self::DISK)->delete($raw);

            return;
        }

        // Legacy absolute path: /storage/journal-covers/...
        if (str_starts_with($raw, '/storage/')) {
            $storagePath = ltrim(str_replace('/storage/', '', $raw), '/');
            Storage::disk(self::DISK)->delete($storagePath);

            return;
        }

        // Deprecated full URL format — best-effort extraction of the storage path.
        // Parse the path component and strip the /storage/ prefix.
        $urlPath = parse_url($raw, PHP_URL_PATH) ?? '';
        if (str_contains($urlPath, '/storage/')) {
            $storagePath = ltrim(substr($urlPath, strpos($urlPath, '/storage/') + strlen('/storage/')), '/');
            if ($storagePath) {
                Storage::disk(self::DISK)->delete($storagePath);
            }
        }
    }
}
