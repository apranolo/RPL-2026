<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OutputController extends Controller
{
    /**
     * Handle the submission of the Produk/Prototipe output form.
     */
    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'tkt_level' => 'required|integer|min:1|max:9',
            'version' => 'nullable|string|max:50',
            'year' => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'url' => 'nullable|url',
            'status' => 'required|in:draft,published,patented',
            'category' => 'required|string',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'document' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        // Here we would typically save to the database using an Eloquent model.
        // Example: $product = Product::create($validated);
        
        // Handling file uploads if not handled by OutputDocController
        if ($request->hasFile('cover_image')) {
            $coverPath = $request->file('cover_image')->store('outputs/products/covers', 'public');
            // $product->update(['cover_image' => $coverPath]);
        }

        if ($request->hasFile('document')) {
            $docPath = $request->file('document')->store('outputs/products/documents', 'public');
            // $product->update(['document' => $docPath]);
        }

        return redirect()->back()->with('success', 'Data luaran Produk/Prototipe berhasil disimpan.');
    }
}
