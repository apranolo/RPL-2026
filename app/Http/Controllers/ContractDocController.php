<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContractDocumentRequest;
use App\Models\ContractDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ContractDocController extends Controller
{
    public function create(int $contractId): InertiaResponse
    {
        $this->authorize('create', ContractDocument::class);

        return Inertia::render('Finance/Contract/Upload', [
            'contractId' => $contractId,
        ]);
    }

    public function store(StoreContractDocumentRequest $request): RedirectResponse
    {
        $this->authorize('create', ContractDocument::class);

        $validated = $request->validated();
        $file = $request->file('document');

        if (! $file) {
            return redirect()->back()->withErrors(['document' => 'Dokumen kontrak tidak ditemukan.']);
        }

        $path = $file->storeAs(
            'contract_documents',
            sprintf('%s_%s.pdf', now()->format('YmdHis'), uniqid()),
            'public'
        );

        ContractDocument::create([
            'contract_id' => $validated['contract_id'],
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType() ?? 'application/pdf',
            'size' => $file->getSize() ?? 0,
            'uploaded_by' => $request->user()?->id,
            'uploaded_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Arsip dokumen kontrak berhasil diunggah.');
    }

    public function download(ContractDocument $document): Response
    {
        $this->authorize('download', $document);

        if (! Storage::disk('public')->exists($document->file_path)) {
            abort(404);
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }
}
