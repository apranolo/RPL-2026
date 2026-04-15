# Meeting Notes - Bimbingan Jurnal MU
**Tanggal**: 02 Februari 2026  
**Status**: Assessment Flow & Role Refinement

---

## 📋 Ringkasan Prioritas

Berikut adalah daftar perbaikan dan enhancement yang harus diimplementasikan berdasarkan hasil bimbingan hari ini:

---

## 🔄 Perubahan yang Perlu Diimplementasikan

### 1. **Definisi Jurnal Terindeks**

#### Clarification on Indexed Journals
- [x] **Jurnal terindeks = Scopus ONLY** ✅ **COMPLETED (Phase 3)**
  - Definisi "terindeks" dalam sistem ini hanya merujuk pada **Scopus**
  - Indexation platforms lain (WoS, DOAJ, dll) tetap dicatat tapi tidak dikategorikan sebagai "terindeks"
  - Update label/terminology di UI untuk konsistensi
  - Impact: Statistics dashboard dan filter perlu adjustment
  - **Implementation**: 
    - `Journal::isIndexedInScopus()` method added
    - `Journal::scopeIndexedInScopus()` query scope
    - StatisticsDashboard label updated to "Jurnal Terindeks Scopus"
    - Controller statistics calculation updated

---

### 2. **Admin Kampus (LPPM) - Approval & Monitoring**

#### Admin Kampus Role in Assessment
- [x] **Admin Kampus tidak melakukan assign reviewer** ✅ **COMPLETED (Phase 3)**
  - Admin Kampus berperan sebagai **LPPM** (Lembaga Penelitian dan Pengabdian Masyarakat)
  - Admin Kampus dapat approve/reject assessment dari user di universitasnya
  - Admin Kampus **TIDAK** dapat assign reviewer ke assessment
  - Assignment reviewer dilakukan oleh **Dikti** (lihat poin 6)
  - **Implementation**:
    - `AssessmentController@approve()` - Admin Kampus approves assessment
    - `AssessmentController@requestRevision()` - Admin Kampus rejects with notes
    - Policy enforcement via `JournalAssessmentPolicy::review()`
    - Test coverage: `AssessmentApprovalTest.php` (7/7 tests ✅)

#### Admin Kampus Capabilities
- [x] **Admin Kampus dapat melihat:** ✅ **COMPLETED (Phase 3)**
  - Semua jurnal di sistem (scoped by university_id)
  - Semua assessment yang sudah disubmit
  - Assessment yang sudah di-approve
  - Assessment yang sudah di-review
  - Hasil assessment dan feedback reviewer
  - **Implementation**:
    - Index page with status filters
    - Show page with assessment details
    - Status timeline component for visual progress
    - Assessment notes timeline for activity history

---

### 3. **Filter Enhancement - Multiple Dimensions**

#### Period & Status Filters
- [x] **Tambahkan filter periode pembinaan** ✅ **COMPLETED (Phase 2)**
  - Filter berdasarkan periode pembinaan (contoh: "Per iode 1 2026", "Periode 2 2026")
  - Filter berdasarkan tahun pembinaan
  - User dapat melihat pembinaan berdasarkan timeline
  - **Implementation**: `JournalController@index()` with `pembinaan_period` and `pembinaan_year` filters

- [x] **Tambahkan filter partisipasi** ✅ **COMPLETED (Phase 2)**
  - Filter "Sudah Ikut" - jurnal yang sudah pernah ikut pembinaan
  - Filter "Belum Ikut" - jurnal yang belum pernah ikut pembinaan
  - Membantu Admin Kampus mengidentifikasi jurnal yang perlu didorong
  - **Implementation**: `JournalController@index()` with `participation` filter using `byParticipation()` scope

- [x] **Tambahkan filter approval status** ✅ **COMPLETED (Phase 2)**
  - Filter "Sudah Di-Approve" - assessment yang sudah disetujui LPPM
  - Filter "Menunggu Approval" - assessment yang masih pending
  - Filter "Ditolak" - assessment yang ditolak
  - Lokasi: Admin Kampus - Journal/Assessment list
  - **Implementation**: `AssessmentController@index()` with `approval_status` filter

---

### 4. **Assessment Results Display - Admin Kampus**

#### Show Assessment Results & Feedback
- [x] **Tampilkan hasil assessment di Admin Kampus** ✅ **COMPLETED (Phase 3)**
  - Admin Kampus dapat melihat:
    - Semua assessment yang sudah disubmit
    - Catatan dari reviewer
    - Feedback/rekomendasi dari reviewer
    - Score/penilaian (jika ada)
  - Lokasi: Admin Kampus → Journals → View Detail → Tab Assessment
  - Format: Card-based atau table dengan expandable rows
  - **Implementation**: `AssessmentController@show()` with full assessment details and notes

#### Access Control
- [x] **Admin Kampus melihat assessment untuk university-nya saja** ✅ **COMPLETED (Phase 3)**
  - Scoped by `university_id`
  - Tidak dapat melihat assessment dari universitas lain
  - Policy: `JournalAssessmentPolicy@view()` enforces university scope

---

### 5. **Navigation Changes - Remove Assessment Menu**

#### Simplify Navigation Structure
- [x] **Hapus menu "Assessment" dari navigasi** ✅ **COMPLETED (Phase 3)**
  - Assessment bukan standalone menu
  - Assessment diakses melalui flow:
    - **User**: Pembinaan → Detail Pembinaan Saya → Isi Assessment
    - **Admin Kampus**: Journals → Detail Jurnal → Lihat Assessment
    - **Reviewer**: Dashboard Reviewer → List Assessment to Review
  - Mengurangi kompleksitas navigasi
  - Assessment tetap ada tapi embedded dalam flow pembinaan
  - **Implementation**: Verified in `app-sidebar.tsx` - no standalone Assessment menu exists

---

### 6. **Reviewer Assignment - Dikti Role**

#### Dikti Assigns Reviewers
- [x] **Assignment reviewer dilakukan oleh Dikti** ✅ **COMPLETED (Phase 3)**
  - Hanya role **Dikti** yang dapat assign reviewer
  - Flow:
    1. User submit assessment via pembinaan
    2. LPPM approve assessment (jika perlu approval)
    3. **Dikti** melihat assessment yang butuh reviewer
    4. **Dikti** assign reviewer ke assessment
    5. Reviewer melakukan review
  - Lokasi: Dikti Dashboard → Assessment Management → Assign Reviewer
  - **Implementation**: `Dikti\AssessmentController@assignReviewer()` with authorization middleware

#### Reviewer Assignment UI
- [x] **Interface untuk assign reviewer** ✅ **COMPLETED (Phase 3)**
  - Table assessment yang belum di-assign
  - Dropdown/select reviewer dari pool reviewer aktif
  - Button "Assign" untuk submit
  - Notification ke reviewer setelah di-assign
  - **Implementation**: `Dikti/Assessments/Index.tsx` with reviewer selection dropdown

---

### 7. **User Approval - Admin Kampus Timestamp**

#### Approval by Admin Kampus with Timestamp
- [x] **User section: Approval Admin Kampus dengan timestamp** ✅ **COMPLETED (Phase 3)**
  - Setelah user submit assessment, Admin Kampus (sebagai LPPM) approve/reject
  - System mencatat:
    - **Approved by**: Nama Admin Kampus
    - **Approved at**: Tanggal dan jam approval (format: `02 Feb 2026, 14:30 WIB`)
  - Display di:
    - User: Detail pembinaan saya → Status "Disetujui Admin Kampus pada [timestamp]"
    - Admin Kampus: Journal detail → Assessment history (own actions)
  - **Implementation**: 
    - Migration: `2026_02_02_165652_add_admin_kampus_approval_to_journal_assessments_table.php`
    - Fields: `admin_kampus_approved_by`, `admin_kampus_approved_at`, `admin_kampus_approval_notes`

#### Approval Actions
- [x] **Admin Kampus dapat approve atau reject assessment** ✅ **COMPLETED (Phase 3)**
  - **Approve**: Assessment lanjut ke tahap assignment reviewer (Dikti)
  - **Reject**: Assessment dikembalikan ke user dengan catatan
  - Field: `admin_kampus_approval_notes` (optional, untuk alasan reject)
  - **Implementation**: 
    - `AssessmentController@approve()` - Approves and creates assessment note
    - `AssessmentController@requestRevision()` - Rejects with mandatory notes
    - Test coverage: `AssessmentApprovalTest.php` (7/7 tests ✅)

---

### 8. **Review Process Status for Pembinaan**

#### Review Status Clarity
- [x] **Status review untuk pembinaan** ✅ **COMPLETED (Phase 3)**
  - Setelah assessment di-approve Admin Kampus, masuk proses review
  - Status review untuk **pembinaan**, bukan untuk assessment individu
  - **Status review**:
    - **Menunggu Reviewer** - Belum di-assign reviewer
    - **Sedang Di-Review** - Sudah di-assign, reviewer sedang review
    - **Review Selesai** - Reviewer sudah submit feedback
    - **Ditolak** - Pembinaan ditolak (rare case)
  - **Implementation**: 
    - Migration: `2026_02_02_170241_add_review_status_to_pembinaan_registrations_table.php`
    - Enum values: 'pending_reviewer', 'in_review', 'completed', 'rejected'
  
#### Status Display
- [x] **Tampilkan status review di dashboard user** ✅ **COMPLETED (Phase 3)**
  - Card "Pembinaan Saya" menampilkan status terakhir
  - Indikator visual (badge/chip) dengan warna berbeda per status
  - User dapat track progress pembinaan
  - **Implementation**: Status badges displayed in assessment views with different colors

---

### 9. **Assessment Notes Section**

#### Centralized Notes/Feedback Section
- [x] **Section khusus untuk catatan assessment** ✅ **COMPLETED (Phase 3)**
  - Lokasi: Detail assessment (User, Admin Kampus, Reviewer)
  - **Berisi**:
    - Catatan user saat submit assessment (self-assessment notes)
    - Catatan Admin Kampus saat approve/reject
    - Catatan reviewer (feedback, rekomendasi, score)
  - **Format**: Timeline atau chat-like interface
  - Timestamp untuk setiap catatan
  - **Implementation**:
    - Model: `AssessmentNote.php` with relationships
    - Migration: `2026_02_02_170237_create_assessment_notes_table.php`
    - Relationship: `JournalAssessment@assessmentNotes()` 
    - Test coverage: `AssessmentNotesTest.php` (full test suite)

#### Implementation
```typescript
// Component: AssessmentNotesTimeline.tsx
interface Note {
  id: number;
  author: string; // Admin Kampus, Reviewer, User
  role: string;
  content: string;
  created_at: string;
}
```

---

### 10. **Status Timeline - Top Right Corner**

#### Visual Timeline Component
- [x] **Timeline di pojok kanan atas halaman detail** ✅ **COMPLETED (Phase 3)**
  - Menampilkan status terakhir pembinaan/assessment
  - **Timeline steps**:
    1. **Pendaftaran** - User mendaftar pembinaan
    2. **Submit Assessment** - User submit assessment
    3. **Approval Admin Kampus** - Menunggu/Sudah di-approve
    4. **Assignment Reviewer** - Dikti assign reviewer
    5. **Review Process** - Reviewer sedang review
    6. **Review Complete** - Review selesai
    7. **Diterima/Ditolak** - Final status dengan timestamp
  - **Implementation**: `StatusTimeline.tsx` component created
  
#### Timeline Design
- [x] **Visual design untuk timeline** ✅ **COMPLETED (Phase 3)**
  - Vertical timeline dengan dot indicators
  - Warna berbeda untuk status active/completed/pending
  - Timestamp untuk setiap step yang sudah dilalui
  - **Rejected step**: Tampilkan kapan dan mengapa ditolak
  - **Accepted step**: Tampilkan kapan diterima
  - **Implementation**: Component with Card wrapper and status-based color coding

---

### 11. **Pembinaan Registration - Optional Document Upload**

#### Upload Document Feature
- [x] **Upload dokumen pendukung (optional)** ✅ **COMPLETED (Feb 4, 2026)**
  - Di halaman register pembinaan, user dapat upload dokumen
  - **Sifat**: Optional (tidak wajib)
  - **Jenis dokumen**: Proposal pembinaan, dokumen pendukung lainnya
  - **Format**: PDF, DOC, DOCX (max 5MB)
  - **Storage**: Laravel Storage → `storage/app/public/pembinaan_documents`
  - **Implementation**:
    - Migration: `2026_02_04_040009_add_supporting_document_to_pembinaan_registrations_table.php`
    - Database field: `supporting_document` (nullable string)
    - Model helper methods: `hasSupportingDocument()`, `getSupportingDocumentUrlAttribute()`, `getSupportingDocumentFilenameAttribute()`
    - Controller validation: `'supporting_document' => 'nullable|file|mimes:pdf,doc,docx|max:5120'`
    - Frontend: File input with upload/remove functionality in [Register.tsx](resources/js/pages/User/Pembinaan/Register.tsx)
    - Display: Supporting document card in [Registration.tsx](resources/js/pages/User/Pembinaan/Registration.tsx) detail view

#### Implementation
```php
// Migration: add column to pembinaan_registrations table
Schema::table('pembinaan_registrations', function (Blueprint $table) {
    $table->string('supporting_document')->nullable()->after('status')
        ->comment('Path to optional supporting document (proposal, etc.)');
});

// Controller: Handle file upload
if ($request->hasFile('supporting_document')) {
    $file = $request->file('supporting_document');
    $fileName = time().'_supporting_'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$file->getClientOriginalExtension();
    $supportingDocumentPath = $file->storeAs('pembinaan_documents', $fileName, 'public');
}
```

---

## 🔧 Technical Implementation Notes

### Database Changes Required

#### 1. Admin Kampus Approval Fields in Assessment
```sql
-- Add Admin Kampus approval tracking to journal_assessments
ALTER TABLE journal_assessments 
ADD COLUMN admin_kampus_approved_by BIGINT UNSIGNED NULL AFTER status,
ADD COLUMN admin_kampus_approved_at TIMESTAMP NULL AFTER admin_kampus_approved_by,
ADD COLUMN admin_kampus_approval_notes TEXT NULL AFTER admin_kampus_approved_at,
ADD FOREIGN KEY (admin_kampus_approved_by) REFERENCES users(id) ON DELETE SET NULL;
```

#### 2. Review Status for Pembinaan
```sql
-- Add review status to pembinaan_registrations
ALTER TABLE pembinaan_registrations
ADD COLUMN review_status ENUM('pending_reviewer', 'in_review', 'completed', 'rejected') 
    DEFAULT 'pending_reviewer' AFTER status;
```

#### 3. Assessment Notes/Comments Table
```sql
-- Create assessment_notes table for timeline comments
CREATE TABLE assessment_notes (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    journal_assessment_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role VARCHAR(50) NOT NULL COMMENT 'User, LPPM, Reviewer, Admin Kampus',
    note_type ENUM('submission', 'approval', 'rejection', 'review', 'general') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (journal_assessment_id) REFERENCES journal_assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 4. Reviewer Assignment by Dikti
```sql
-- Add assigned_by field to track who assigned the reviewer
ALTER TABLE journal_assessments
ADD COLUMN assigned_by BIGINT UNSIGNED NULL COMMENT 'Dikti user who assigned reviewer',
ADD COLUMN assigned_at TIMESTAMP NULL,
ADD FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL;
```

#### 5. Supporting Document Upload
```sql
-- Already mentioned in section 11, but for completeness:
ALTER TABLE pembinaan_registrations
ADD COLUMN supporting_document VARCHAR(255) NULL AFTER journal_id;
```

---

### Backend Changes Required

#### 1. Admin Kampus Assessment Policy
```php
// app/Policies/JournalAssessmentPolicy.php (update existing)
class JournalAssessmentPolicy
{
    public function viewAssessments(User $user): bool
    {
        return $user->isAdminKampus();
    }
    
    public function approveAssessment(User $user, JournalAssessment $assessment): bool
    {
        // Admin Kampus can approve assessments from their university
        return $user->isAdminKampus() && 
               $user->university_id === $assessment->journal->university_id;
    }
    
    // Admin Kampus CANNOT assign reviewers
    public function assignReviewer(User $user): bool
    {
        return false; // Only Dikti can assign
    }
}
```

#### 2. Dikti Controller - Assign Reviewer
```php
// app/Http/Controllers/Dikti/AssessmentController.php
class AssessmentController extends Controller
{
    public function assignReviewer(Request $request, JournalAssessment $assessment)
    {
        $this->authorize('assignReviewer', $assessment);
        
        // Ensure assessment is approved by Admin Kampus first
        if ($assessment->status !== 'approved_by_admin_kampus') {
            return back()->withErrors(['error' => 'Assessment belum disetujui oleh Admin Kampus']);
        }
        
        $request->validate([
            'reviewer_id' => 'required|exists:users,id',
        ]);
        
        $assessment->update([
            'reviewer_id' => $request->reviewer_id,
            'assigned_by' => auth()->id(),
            'assigned_at' => now(),
            'review_status' => 'in_review',
        ]);
        
        // Send notification to reviewer
        $reviewer = User::find($request->reviewer_id);
        $reviewer->notify(new AssessmentAssignedNotification($assessment));
        
        return back()->with('success', 'Reviewer berhasil di-assign');
    }
}
```

#### 3. Admin Kampus Approval with Timestamp
```php
// app/Http/Controllers/AdminKampus/AssessmentController.php
public function approve(Request $request, JournalAssessment $assessment)
{
    $this->authorize('approveAssessment', $assessment);
    
    $assessment->update([
        'admin_kampus_approved_by' => auth()->id(),
        'admin_kampus_approved_at' => now(),
        'admin_kampus_approval_notes' => $request->notes,
        'status' => 'approved_by_admin_kampus',
    ]);
    
    // Create assessment note
    AssessmentNote::create([
        'journal_assessment_id' => $assessment->id,
        'user_id' => auth()->id(),
        'role' => 'Admin Kampus',
        'note_type' => 'approval',
        'content' => $request->notes ?? 'Assessment disetujui oleh Admin Kampus',
    ]);
    
    return back()->with('success', 'Assessment berhasil disetujui');
}

public function reject(Request $request, JournalAssessment $assessment)
{
    $request->validate([
        'notes' => 'required|string|min:10',
    ]);
    
    $assessment->update([
        'admin_kampus_approved_by' => auth()->id(),
        'admin_kampus_approved_at' => now(),
        'admin_kampus_approval_notes' => $request->notes,
        'status' => 'rejected_by_admin_kampus',
    ]);
    
    // Create assessment note
    AssessmentNote::create([
        'journal_assessment_id' => $assessment->id,
        'user_id' => auth()->id(),
        'role' => 'Admin Kampus',
        'note_type' => 'rejection',
        'content' => $request->notes,
    ]);
    
    return back()->with('success', 'Assessment ditolak');
}
```

#### 4. Filter Enhancements for Admin Kampus
```php
// app/Http/Controllers/AdminKampus/JournalController.php
public function index(Request $request)
{
    $query = Journal::where('university_id', auth()->user()->university_id);
    
    // Period filter
    if ($request->filled('period')) {
        $query->whereHas('pembinaan_registrations', function($q) use ($request) {
            $q->whereHas('pembinaan', function($p) use ($request) {
                $p->where('period', $request->period);
            });
        });
    }
    
    // Year filter
    if ($request->filled('year')) {
        $query->whereHas('pembinaan_registrations', function($q) use ($request) {
            $q->whereYear('created_at', $request->year);
        });
    }
    
    // Participation filter
    if ($request->filled('participation')) {
        if ($request->participation === 'sudah_ikut') {
            $query->has('pembinaan_registrations');
        } elseif ($request->participation === 'belum_ikut') {
            $query->doesntHave('pembinaan_registrations');
        }
    }
    
    // Approval status filter
    if ($request->filled('approval_status')) {
        $query->whereHas('assessments', function($q) use ($request) {
            $q->where('status', $request->approval_status);
        });
    }
    
    $journals = $query->with(['user', 'scientific_field'])->paginate(15);
    
    return Inertia::render('AdminKampus/Journals/Index', [
        'journals' => $journals,
        'filters' => $request->only(['period', 'year', 'participation', 'approval_status']),
    ]);
}
```

---

### Frontend Changes Required

#### 1. Remove Assessment Navigation Menu
```typescript
// resources/js/layouts/app-sidebar.tsx
// Remove Assessment menu item from navigation
// Assessment is accessed through:
// - User: via Pembinaan detail
// - Admin Kampus: via Journal detail
// - Reviewer: via Reviewer dashboard
```

#### 2. Status Timeline Component
```typescript
// resources/js/components/StatusTimeline.tsx
interface TimelineStep {
  label: string;
  status: 'completed' | 'active' | 'pending' | 'rejected';
  timestamp?: string;
  note?: string;
}

export default function StatusTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="absolute top-4 right-4 w-64">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Status Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full mt-1",
                  step.status === 'completed' && "bg-green-500",
                  step.status === 'active' && "bg-blue-500 animate-pulse",
                  step.status === 'pending' && "bg-gray-300",
                  step.status === 'rejected' && "bg-red-500"
                )} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{step.label}</p>
                  {step.timestamp && (
                    <p className="text-xs text-muted-foreground">{step.timestamp}</p>
                  )}
                  {step.note && (
                    <p className="text-xs text-muted-foreground mt-1">{step.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 3. Assessment Notes Timeline Component
```typescript
// resources/js/components/AssessmentNotesTimeline.tsx
interface AssessmentNote {
  id: number;
  author: string;
  role: string;
  content: string;
  created_at: string;
}

export default function AssessmentNotesTimeline({ 
  notes 
}: { 
  notes: AssessmentNote[] 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Catatan Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="border-l-2 border-gray-300 pl-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{note.role}</Badge>
                <span className="text-sm font-medium">{note.author}</span>
              </div>
              <p className="text-sm text-gray-700">{note.content}</p>
              <p className="text-xs text-gray-500 mt-1">{note.created_at}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 4. Dikti - Assign Reviewer Interface
```typescript
// resources/js/pages/Dikti/Assessments/Index.tsx
export default function DiktiAssessmentsIndex({ 
  assessments, 
  reviewers 
}: { 
  assessments: Assessment[]; 
  reviewers: User[] 
}) {
  const handleAssignReviewer = (assessmentId: number, reviewerId: number) => {
    router.post(route('dikti.assessments.assign-reviewer', assessmentId), {
      reviewer_id: reviewerId,
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Jurnal</TableHead>
          <TableHead>University</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assign Reviewer</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assessments.map((assessment) => (
          <TableRow key={assessment.id}>
            <TableCell>{assessment.journal.name}</TableCell>
            <TableCell>{assessment.journal.university.name}</TableCell>
            <TableCell>
              <Badge>{assessment.status}</Badge>
            </TableCell>
            <TableCell>
              <Select 
                onValueChange={(value) => handleAssignReviewer(assessment.id, parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih Reviewer" />
                </SelectTrigger>
                <SelectContent>
                  {reviewers.map((reviewer) => (
                    <SelectItem key={reviewer.id} value={reviewer.id.toString()}>
                      {reviewer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

#### 5. Document Upload in Pembinaan Registration
```typescript
// resources/js/pages/User/Pembinaan/Register.tsx
const [selectedFile, setSelectedFile] = useState<File | null>(null);

const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('pembinaan_id', pembinaanId);
  formData.append('journal_id', selectedJournalId);
  if (selectedFile) {
    formData.append('supporting_document', selectedFile);
  }
  
  router.post(route('user.pembinaan.register'), formData);
};

return (
  <form onSubmit={handleSubmit}>
    {/* ... other fields ... */}
    
    <div className="space-y-2">
      <Label htmlFor="document">
        Dokumen Pendukung (Opsional)
      </Label>
      <Input
        id="document"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
      <p className="text-xs text-muted-foreground">
        Format: PDF, DOC, DOCX (max 5MB)
      </p>
    </div>
    
    <Button type="submit">Daftar Pembinaan</Button>
  </form>
);
```

---

## 📝 Implementation Priority

### Phase 1 (High Priority - Week 1) ✅ **COMPLETED**
1. [x] Remove Assessment navigation menu (Quick win) ✅
2. [x] Database migrations for Admin Kampus approval & review status ✅
3. [x] Admin Kampus approval/reject functionality with timestamp ✅
4. [x] Dikti assign reviewer interface and backend ✅

### Phase 2 (Medium Priority - Week 2) ✅ **COMPLETED**
5. [x] Filter enhancements (period, year, participation, approval status) ✅
6. [x] Assessment notes timeline component ✅
7. [x] Status timeline component at top right ✅
8. [x] Admin Kampus view assessment results and feedback ✅

### Phase 3 (Medium Priority - Week 2-3) ✅ **COMPLETED**
9. [x] Supporting document upload in pembinaan registration ✅ **COMPLETED (Feb 4, 2026)**
10. [x] Update "indexed journals" definition to Scopus-only ✅
11. [x] Admin Kampus approval flow testing ✅

### Phase 4 (Testing & Polish - Week 3) 🔄 **IN PROGRESS**
12. [x] End-to-end testing of assessment flow ✅ (7/7 tests passing)
13. [x] UI/UX polish for timeline components ✅
14. [ ] Documentation update ⚠️ **PENDING**
15. [ ] User acceptance testing ⚠️ **PENDING**

---

## 🎯 Key Implementation Notes

### Flow Sequence (Important!)
1. **User** mendaftar pembinaan → Upload dokumen pendukung (optional)
2. **User** submit assessment via pembinaan
3. **Admin Kampus** (sebagai LPPM) approve/reject assessment (with timestamp & notes)
4. **Dikti** assign reviewer (only if approved by Admin Kampus)
5. **Reviewer** review assessment and submit feedback
6. **Admin Kampus** melihat hasil assessment dan feedback di dashboard
7. **User** melihat status timeline dan feedback di dashboard

### Access Control Matrix
| Role | Register Pembinaan | Submit Assessment | Approve Assessment | Assign Reviewer | Review Assessment | View All Assessments |
|------|-------------------|-------------------|--------------------|-----------------|--------------------|---------------------|
| User | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ (Own only) |
| Admin Kampus | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ (University scope) |
| Dikti | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Reviewer | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (Assigned only) |

---

## 📌 Catatan Penting

- **Admin Kampus sebagai LPPM**: Admin Kampus berperan sebagai LPPM (Lembaga Penelitian dan Pengabdian Masyarakat) dalam approve/reject assessment di universitasnya. TIDAK ada role terpisah untuk LPPM.
- **Dikti Role**: Satu-satunya role yang dapat assign reviewer ke assessment.
- **Assessment Navigation Removed**: Assessment tidak standalone, embedded dalam flow pembinaan.
- **Timeline Visual**: Penting untuk transparansi status pembinaan ke user.
- **Admin Kampus Approval Timestamp**: Setiap approval harus tercatat tanggal dan jamnya untuk audit trail.
- **Indexed = Scopus**: Definisi jelas untuk menghindari ambiguitas dalam reporting.
- **Multiple Filters**: Admin Kampus butuh filter multi-dimensi untuk analisis yang lebih baik.
- **Document Upload Optional**: Tidak memaksa user, tapi memberikan opsi untuk supporting documents.

---

## 🔗 Related Documents

- [MEETING_NOTES_30_JAN_2026.md](MEETING_NOTES_30_JAN_2026.md) - Previous meeting notes (Statistics Dashboard)
- [MEETING_NOTES_16_JAN_2026.md](MEETING_NOTES_16_JAN_2026.md) - Earlier meeting notes
- [PEMBINAAN_CONTROLLERS_IMPLEMENTATION.md](PEMBINAAN_CONTROLLERS_IMPLEMENTATION.md) - Pembinaan system implementation
- [ERD Database.md](ERD Database.md) - Database schema reference

---

**Prepared by**: GitHub Copilot  
**Date**: 02 Februari 2026  
**Focus**: Assessment Flow Refinement, LPPM/Dikti Role Separation, Navigation Simplification
