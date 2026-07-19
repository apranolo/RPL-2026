<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadProgressDocRequest;
use App\Models\ProgressReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProgressDocController extends Controller
{
    /**
     * Upload dokumen logbook untuk laporan kemajuan tertentu.
     *
     * Menangani:
     * - Validasi file (PDF / DOC / DOCX / XLS / XLSX, max 10 MB)
     * - Penghapusan file logbook lama (jika ada)
     * - Penyimpanan file baru ke disk "public"
     * - Update kolom `logbook` pada record ProgressReport
     *
     * @route POST /dosen/progress/{progress}/upload-logbook
     */
    public function upload(UploadProgressDocRequest $request, ProgressReport $progress): RedirectResponse
    {
        // Pastikan user yang login adalah pemilik laporan
        $this->authorize('update', $progress);

        $validated = $request->validated();

        $file = $validated['logbook'];

        try {
            // Hapus file logbook lama jika ada
            if ($progress->logbook && Storage::disk('public')->exists($progress->logbook)) {
                Storage::disk('public')->delete($progress->logbook);
            }

            // Buat nama file unik agar tidak bentrok
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $fileName = time().'_logbook_'.Str::slug($originalName).'.'.$extension;

            // Simpan ke storage/app/public/progress_reports/logbook/
            $path = $file->storeAs(
                'progress_reports/logbook',
                $fileName,
                'public'
            );

            // Update kolom logbook pada progress report
            $progress->update(['logbook' => $path]);

            return back()->with('success', 'Dokumen logbook berhasil diunggah.');

        } catch (\Exception $e) {
            Log::error('Gagal upload logbook', [
                'progress_id' => $progress->id,
                'user_id' => $request->user()?->id,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'logbook' => 'Gagal mengunggah file logbook. Silakan coba lagi atau hubungi administrator.',
            ]);
        }
    }

    /**
     * Hapus dokumen logbook yang sudah diunggah.
     *
     * @route DELETE /dosen/progress/{progress}/logbook
     */
    public function destroy(Request $request, ProgressReport $progress): RedirectResponse
    {
        $this->authorize('update', $progress);

        if (! $progress->logbook) {
            return back()->withErrors(['logbook' => 'Tidak ada file logbook untuk dihapus.']);
        }

        try {
            if (Storage::disk('public')->exists($progress->logbook)) {
                Storage::disk('public')->delete($progress->logbook);
            }

            $progress->update(['logbook' => null]);

            return back()->with('success', 'Dokumen logbook berhasil dihapus.');

        } catch (\Exception $e) {
            Log::error('Gagal hapus logbook', [
                'progress_id' => $progress->id,
                'user_id' => $request->user()?->id,
                'exception' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'logbook' => 'Gagal menghapus file logbook. Silakan coba lagi.',
            ]);
        }
    }

    /**
     * Download dokumen logbook.
     *
     * @route GET /dosen/progress/{progress}/logbook/download
     */
    public function download(ProgressReport $progress): StreamedResponse
    {
        $this->authorize('view', $progress);

        if (! $progress->logbook || ! Storage::disk('public')->exists($progress->logbook)) {
            abort(404, 'File logbook tidak ditemukan.');
        }

        return Storage::disk('public')->download(
            $progress->logbook,
            basename($progress->logbook)
        );
    }
}
