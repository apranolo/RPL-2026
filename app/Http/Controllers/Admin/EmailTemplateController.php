<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailTemplateController extends Controller
{
    public function index(): Response
    {
        $emailTemplates = EmailTemplate::latest()->get();

        return Inertia::render('Admin/EmailTemplate/Index', [
            'emailTemplates' => $emailTemplates,
        ]);
    }

    public function update(Request $request, EmailTemplate $emailTemplate)
    {
        $validated = $request->validate([
            'journal_id' => 'nullable|exists:journals,id',
            'name' => 'required|string|max:255',
            'event_trigger' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'variables' => 'nullable|array',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $emailTemplate->update($validated);

        return back()->with('success', 'Email template berhasil diperbarui.');
    }
}
