<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProposalDocumentRequest;
use App\Models\Proposal;
use App\Models\ProposalDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * Upload and attach a document to the proposal.
     */
    public function upload(StoreProposalDocumentRequest $request, Proposal $proposal): JsonResponse
    {
        $this->authorize('upload', $proposal);

        $file = $request->file('file');

        // Generate unique filename to prevent collisions
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $fileName = time().'_'.Str::slug($originalName).'.'.$extension;

        // Store file in proposal_documents folder on public disk
        $filePath = $file->storeAs('proposal_documents', $fileName, 'public');

        try {
            $document = DB::transaction(function () use ($proposal, $file, $filePath, $request) {
                return ProposalDocument::create([
                    'proposal_id' => $proposal->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $filePath,
                    'file_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                    'document_type' => $request->input('document_type'),
                    'description' => $request->input('description'),
                ]);
            });

            Log::info('Document uploaded successfully.', [
                'document_id' => $document->id,
                'proposal_id' => $proposal->id,
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'message' => 'Dokumen berhasil diunggah.',
                'document' => [
                    'id' => $document->id,
                    'proposal_id' => $document->proposal_id,
                    'file_name' => $document->file_name,
                    'file_path' => $document->file_path,
                    'file_type' => $document->file_type,
                    'file_size' => $document->file_size,
                    'document_type' => $document->document_type,
                    'description' => $document->description,
                    'created_at' => $document->created_at->toIso8601String(),
                    'updated_at' => $document->updated_at->toIso8601String(),
                ],
            ], 201);
        } catch (\Exception $e) {
            // Delete the physical file from storage if DB insert fails
            Storage::disk('public')->delete($filePath);

            Log::error('Failed to upload proposal document: '.$e->getMessage(), [
                'proposal_id' => $proposal->id,
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'message' => 'Gagal menyimpan dokumen ke database.',
            ], 500);
        }
    }
}
