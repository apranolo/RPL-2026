<?php

namespace App\Http\Controllers;

use App\Models\FundingTerm;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FundingController extends Controller
{
    /**
     * Upload bukti transfer (proof of disbursement) for a funding term.
     */
    public function uploadBukti(Request $request, FundingTerm $fundingTerm): RedirectResponse
    {
        $validated = $request->validate([
            'receipt_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'receipt_number' => 'nullable|string|max:100',
            'disbursement_date' => 'nullable|date',
        ], [
            'receipt_file.required' => 'File bukti transfer harus diunggah.',
            'receipt_file.mimes' => 'File hanya boleh berformat PDF, JPG, atau PNG.',
            'receipt_file.max' => 'Ukuran file tidak boleh lebih dari 5MB.',
        ]);

        $file = $validated['receipt_file'];
        $fileName = time().'_'.$file->getClientOriginalName();
        $filePath = $file->storeAs('funding_receipts', $fileName, 'public');

        $fundingTerm->update([
            'receipt_file' => $filePath,
            'receipt_number' => $validated['receipt_number'] ?? $fundingTerm->receipt_number,
            'disbursement_date' => $validated['disbursement_date'] ?? $fundingTerm->disbursement_date ?? now()->toDateString(),
            'status' => 'cair',
            'updated_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Bukti transfer dana berhasil diunggah.');
    }
}
