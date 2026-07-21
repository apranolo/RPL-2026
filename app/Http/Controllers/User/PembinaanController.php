<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\Pembinaan;
use App\Models\PembinaanRegistration;
use App\Models\PembinaanRegistrationAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PembinaanController extends Controller
{
    /**
     * Display available Akreditasi pembinaan programs and user's registrations.
     */
    public function indexAkreditasi(Request $request): Response
    {
        return $this->indexByCategory($request, 'akreditasi');
    }

    /**
     * Display available Indeksasi pembinaan programs and user's registrations.
     */
    public function indexIndeksasi(Request $request): Response
    {
        return $this->indexByCategory($request, 'indeksasi');
    }

    /**
     * Common method to display programs by category.
     */
    private function indexByCategory(Request $request, string $category): Response
    {
        $user = $request->user();

        // Available programs (active, registration open, filtered by category)
        $availablePrograms = Pembinaan::active()
            ->open()
            ->byCategory($category)
            ->with(['accreditationTemplate'])
            ->withCount(['registrations', 'approvedRegistrations'])
            ->orderBy('registration_start', 'desc')
            ->get();

        // User's registrations (filtered by category)
        $myRegistrations = PembinaanRegistration::forUser($user->id)
            ->whereHas('pembinaan', function ($query) use ($category) {
                $query->where('category', $category);
            })
            ->with([
                'pembinaan',
                'journal',
                'reviewer',
            ])
            ->withCount(['attachments', 'reviews'])
            ->orderBy('registered_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('User/Pembinaan/Index', [
            'availablePrograms' => $availablePrograms,
            'myRegistrations' => $myRegistrations,
            'category' => $category,
        ]);
    }

    /**
     * Show details of a specific pembinaan program.
     */
    public function show(Pembinaan $pembinaan): Response
    {
        $this->authorize('view', $pembinaan);

        $pembinaan->load(['accreditationTemplate', 'creator'])
            ->loadCount([
                'registrations',
                'approvedRegistrations',
                'pendingRegistrations',
            ]);

        $user = auth()->user();
        $isRegistered = $pembinaan->registrations()
            ->where('user_id', $user->id)
            ->exists();

        return Inertia::render('User/Pembinaan/Show', [
            'program' => $pembinaan,
            'isRegistered' => $isRegistered,
            'category' => $pembinaan->category,
        ]);
    }

    /**
     * Show registration form for a pembinaan program.
     */
    public function registerForm(Request $request, Pembinaan $pembinaan): Response
    {
        $user = $request->user();

        // Get user's journals that can be registered
        $journals = Journal::where('user_id', $user->id)
            ->where('is_active', true)
            ->with(['scientificField', 'university'])
            ->orderBy('title')
            ->get();

        return Inertia::render('User/Pembinaan/Register', [
            'program' => $pembinaan,
            'journals' => $journals,
            'category' => $pembinaan->category,
        ]);
    }

    /**
     * Store a new registration with file attachments.
     */
    public function register(Request $request, Pembinaan $pembinaan): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'journal_id' => 'required|exists:journals,id',
            'attachments' => 'required|array|min:1',
            'attachments.*.file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
            'attachments.*.document_type' => 'required|string|max:100',
            'supporting_document' => 'nullable|file|mimes:pdf,doc,docx|max:5120', // Optional 5MB max
        ]);

        // Authorize via policy (pass journal and pembinaan IDs; User is injected automatically)
        $this->authorize('register', [
            PembinaanRegistration::class,
            $validated['journal_id'],
            $pembinaan->id,
        ]);

        // Handle optional supporting document upload
        $supportingDocumentPath = null;
        if ($request->hasFile('supporting_document')) {
            $file = $request->file('supporting_document');
            $fileName = time().'_supporting_'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$file->getClientOriginalExtension();
            $supportingDocumentPath = $file->storeAs('pembinaan_documents', $fileName, 'public');
        }

        // Create registration
        $registration = PembinaanRegistration::create([
            'pembinaan_id' => $pembinaan->id,
            'journal_id' => $validated['journal_id'],
            'user_id' => $user->id,
            'status' => 'pending',
            'registered_at' => now(),
            'supporting_document' => $supportingDocumentPath,
        ]);

        // Upload attachments
        foreach ($validated['attachments'] as $attachmentData) {
            $file = $attachmentData['file'];
            $fileName = time().'_'.$file->getClientOriginalName();
            $filePath = $file->storeAs('pembinaan_attachments', $fileName, 'public');

            PembinaanRegistrationAttachment::create([
                'registration_id' => $registration->id,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'document_type' => $attachmentData['document_type'],
                'uploaded_by' => $user->id,
            ]);
        }

        // TODO: Send email notification to Admin Kampus

        return redirect()
            ->route('user.pembinaan.registration', $registration)
            ->with('success', 'Registration submitted successfully.');
    }

    /**
     * View a specific registration detail.
     */
    public function viewRegistration(PembinaanRegistration $registration): Response
    {
        $this->authorize('view', $registration);

        $registration->load([
            'pembinaan.accreditationTemplate',
            'journal.scientificField',
            'journal.university',
            'reviewer.university',
            'attachments.uploader',
            'reviews.reviewer',
            'assessment',
        ]);

        // Append supporting document attributes
        $registration->append(['supporting_document_url', 'supporting_document_filename']);

        return Inertia::render('User/Pembinaan/Registration', [
            'registration' => $registration,
            'category' => $registration->pembinaan->category,
        ]);
    }

    /**
     * Cancel a pending registration.
     */
    public function cancel(PembinaanRegistration $registration): RedirectResponse
    {
        $this->authorize('delete', $registration);

        if (! $registration->canBeCancelled()) {
            return back()->with('error', 'Cannot cancel registration that is not pending.');
        }

        // Delete attachments from storage
        foreach ($registration->attachments as $attachment) {
            if ($attachment->fileExists()) {
                $attachment->deleteFile();
            }
        }

        $registration->delete();

        return redirect()
            ->route('user.pembinaan.'.$registration->pembinaan->category)
            ->with('success', 'Registration cancelled successfully.');
    }

    /**
     * Upload additional attachment to existing registration.
     */
    public function uploadAttachment(Request $request, PembinaanRegistration $registration): RedirectResponse
    {
        $this->authorize('uploadAttachment', $registration);

        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'document_type' => 'required|string|max:100',
        ]);

        $file = $validated['file'];
        $fileName = time().'_'.$file->getClientOriginalName();
        $filePath = $file->storeAs('pembinaan_attachments', $fileName, 'public');

        PembinaanRegistrationAttachment::create([
            'registration_id' => $registration->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'document_type' => $validated['document_type'],
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Attachment uploaded successfully.');
    }

    /**
     * Download an attachment file.
     */
    public function downloadAttachment(PembinaanRegistrationAttachment $attachment): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('downloadAttachments', $attachment->registration);

        if (! $attachment->fileExists()) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($attachment->file_path, $attachment->file_name);
    }

    /**
     * Create assessment for a pembinaan registration.
     */
    public function createAssessment(Request $request, PembinaanRegistration $registration): RedirectResponse
    {
        $this->authorize('createAssessment', $registration);

        // Validate registration is approved
        if ($registration->status !== 'approved') {
            return back()->with('error', 'Pembinaan belum disetujui. Hanya pembinaan yang disetujui dapat mengisi assessment.');
        }

        // Validate user owns this registration
        if ($registration->user_id !== $request->user()->id) {
            return back()->with('error', 'Anda tidak memiliki akses ke pembinaan ini.');
        }

        // Check if assessment already exists
        if ($registration->assessment) {
            return redirect()->route('user.assessments.edit', $registration->assessment->id)
                ->with('info', 'Anda sudah memiliki assessment untuk pembinaan ini.');
        }

        // Create new assessment
        $assessment = \App\Models\JournalAssessment::create([
            'journal_id' => $registration->journal_id,
            'user_id' => $request->user()->id,
            'pembinaan_registration_id' => $registration->id,
            'status' => 'draft',
        ]);

        return redirect()->route('user.assessments.edit', $assessment->id)
            ->with('success', 'Assessment berhasil dibuat. Silakan isi form assessment.');
    }
}
