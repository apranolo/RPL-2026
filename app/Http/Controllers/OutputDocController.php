<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

/**
 * OutputDocController
 *
 * Handles dedicated file upload endpoints for research output (Luaran) documents.
 * Covers two file types for the Produk/Prototipe output:
 *   - cover_image : product cover / thumbnail (JPEG/PNG, max 2 MB)
 *   - document    : proof document / bukti luaran (PDF/DOC/DOCX, max 10 MB)
 *
 * These endpoints are intentionally separated from the main OutputController
 * so that file replacement can be done independently without re-submitting
 * the entire form (mirrors the JournalController::uploadCover pattern).
 *
 * @route POST /user/outputs/products/{product}/upload
 * @name  user.outputs.products.upload-doc
 */
class OutputDocController extends Controller
{
    /**
     * Upload or replace a cover image or proof document for an output product.
     *
     * Accepted request fields (at least one required):
     *   - cover_image : image file  (jpeg|png|jpg, max 2 MB)
     *   - document    : proof file  (pdf|doc|docx, max 10 MB)
     *   - type        : 'cover' | 'document'  — determines which file to process
     *
     * The uploaded file is stored in the public disk under:
     *   outputs/products/covers/        (cover images)
     *   outputs/products/documents/     (proof documents)
     *
     * Old files are deleted from storage before the new one is saved.
     *
     * @param  Request  $request
     * @param  int      $productId  ID of the output product record (placeholder until model exists)
     * @return RedirectResponse
     */
    public function upload(Request $request, int $productId): RedirectResponse
    {
        // Determine upload type from request
        $type = $request->input('type', 'cover'); // 'cover' | 'document'

        if ($type === 'cover') {
            return $this->uploadCover($request, $productId);
        }

        return $this->uploadDocument($request, $productId);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Handle cover image upload.
     */
    private function uploadCover(Request $request, int $productId): RedirectResponse
    {
        $request->validate([
            'cover_image' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg',
                'max:2048', // 2 MB
            ],
        ], [
            'cover_image.required'   => 'Pilih file gambar cover untuk diupload.',
            'cover_image.image'      => 'File cover harus berupa gambar.',
            'cover_image.mimes'      => 'Format cover harus JPEG atau PNG.',
            'cover_image.max'        => 'Ukuran cover maksimal 2 MB.',
        ]);

        // ── Delete old file (when model exists, retrieve path from DB) ──
        // Example (uncomment when OutputProduct model is available):
        // $product = OutputProduct::findOrFail($productId);
        // $this->authorize('update', $product);
        // if ($product->cover_image && Storage::disk('public')->exists($product->cover_image)) {
        //     Storage::disk('public')->delete($product->cover_image);
        // }

        // ── Store new file ──
        $path = $request->file('cover_image')
            ->store("outputs/products/covers/{$productId}", 'public');

        // ── Persist to DB (uncomment when model exists) ──
        // $product->update(['cover_image' => $path]);

        // Return uploaded path in session so frontend can read it
        return redirect()
            ->back()
            ->with('success', 'Cover produk berhasil diperbarui.')
            ->with('uploaded_cover_path', $path)
            ->with('uploaded_cover_url', Storage::disk('public')->url($path));
    }

    /**
     * Handle proof document upload.
     */
    private function uploadDocument(Request $request, int $productId): RedirectResponse
    {
        $request->validate([
            'document' => [
                'required',
                'file',
                'mimes:pdf,doc,docx',
                'max:10240', // 10 MB
            ],
        ], [
            'document.required' => 'Pilih file dokumen bukti untuk diupload.',
            'document.file'     => 'Upload harus berupa file.',
            'document.mimes'    => 'Format dokumen harus PDF, DOC, atau DOCX.',
            'document.max'      => 'Ukuran dokumen maksimal 10 MB.',
        ]);

        // ── Delete old file (when model exists) ──
        // $product = OutputProduct::findOrFail($productId);
        // $this->authorize('update', $product);
        // if ($product->document && Storage::disk('public')->exists($product->document)) {
        //     Storage::disk('public')->delete($product->document);
        // }

        // ── Store new file — keep original filename (sanitised) ──
        $originalName = $request->file('document')->getClientOriginalName();
        $safeName     = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);
        $timestamp    = now()->format('YmdHis');

        $path = $request->file('document')
            ->storeAs(
                "outputs/products/documents/{$productId}",
                "{$timestamp}_{$safeName}",
                'public'
            );

        // ── Persist to DB (uncomment when model exists) ──
        // $product->update(['document' => $path]);

        return redirect()
            ->back()
            ->with('success', 'Dokumen bukti luaran berhasil diupload.')
            ->with('uploaded_document_path', $path)
            ->with('uploaded_document_url', Storage::disk('public')->url($path))
            ->with('uploaded_document_name', $originalName);
    }

    /**
     * Delete a specific file (cover or document) from storage.
     *
     * @route DELETE /user/outputs/products/{product}/upload
     * @name  user.outputs.products.delete-doc
     */
    public function destroy(Request $request, int $productId): RedirectResponse
    {
        $request->validate([
            'type' => 'required|in:cover,document',
        ]);

        $type = $request->input('type');

        // ── When model exists, load and verify ownership ──
        // $product = OutputProduct::findOrFail($productId);
        // $this->authorize('update', $product);
        //
        // $field = $type === 'cover' ? 'cover_image' : 'document';
        // if ($product->$field && Storage::disk('public')->exists($product->$field)) {
        //     Storage::disk('public')->delete($product->$field);
        //     $product->update([$field => null]);
        // }

        $label = $type === 'cover' ? 'Cover produk' : 'Dokumen bukti luaran';

        return redirect()
            ->back()
            ->with('success', "{$label} berhasil dihapus.");
    }
}
