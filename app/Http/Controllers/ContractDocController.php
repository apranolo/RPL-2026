<?php

namespace App\Http\Controllers;

use App\Models\ContractDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ContractDocController extends Controller
{
    /**
     * Store a newly created contract document in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'document_name' => 'required|string|max:255',
                'file' => 'required|file|mimes:pdf|max:10240', // max 10MB
                'contract_number' => 'nullable|string|max:255',
                'contract_date' => 'nullable|date',
                'signed_date' => 'nullable|date',
                'description' => 'nullable|string',
            ]);

            $file = $request->file('file');
            $fileName = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
            
            $filePath = $file->storeAs(
                'contract_documents',
                $fileName,
                'public'
            );

            $contractDocument = ContractDocument::create([
                'user_id' => auth()->id(),
                'document_name' => $validated['document_name'],
                'file_path' => $filePath,
                'file_type' => $file->extension(),
                'file_size' => $file->getSize(),
                'contract_number' => $validated['contract_number'] ?? null,
                'contract_date' => $validated['contract_date'] ?? null,
                'signed_date' => $validated['signed_date'] ?? null,
                'status' => 'draft',
                'description' => $validated['description'] ?? null,
                'uploaded_by' => auth()->user()->name ?? 'System',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Contract document uploaded successfully',
                'data' => $contractDocument,
            ], Response::HTTP_CREATED);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload contract document',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
