# Meeting Notes - Bimbingan Jurnal MU
**Tanggal**: 08 Februari 2026  
**Status**: Production Launch Preparation - Phase 1 MVP  
**Recording**: [View Recording](https://fathom.video/share/MHWsPpthUZ_sYqMcFYjbaukZqLgrtRwv)

---

## 📋 Ringkasan Prioritas

Persiapan platform untuk **LAUNCH PRODUCTION** pada **Kamis, 12 Februari 2026** ke 21 universitas Muhammadiyah "excellent". Meeting ini mengubah scope secara signifikan - fokus pada core functionality (user & journal management) dan **DEFER assessment system** untuk iterasi berikutnya.

**Key Decision**: Two-Step Approval Workflow
- Step 1: LPPM approve user registration
- Step 2: LPPM approve journal submission

**Target Users**: 21 Universitas Muhammadiyah "Excellent"

---

## 🎯 Strategic Pivot

### Launch Strategy - Phased Approach

#### Phase 1: Thursday Launch (Feb 12, 2026) - Core Platform
**Include**:
- ✅ User Registration & Management
- ✅ University Selection
- ✅ LPPM Approval Workflow (Users & Journals)
- ✅ Journal Submission & Management
- ✅ Dashboard with Key Metrics
- ✅ Browse by University

**Explicitly DEFER**:
- ❌ Assessment System (entire flow)
- ❌ Pembinaan System
- ❌ Reviewer Role & Management
- ❌ Complex Search/Browse Features
- ❌ OAI-PMH Harvesting (future enhancement)
- ❌ Article-level Search

**Rationale**: 
- Immediate need is a functional system for LPPM admins to populate journal data
- Assessment system requires more complex workflows (reviewers, scoring, feedback)
- Focus on data collection first, evaluation later

---

## 🔄 Perubahan yang Perlu Diimplementasikan

### 1. **Two-Step Approval Workflow**

#### User Registration → LPPM Approval → Journal Submission → LPPM Approval

- [x] **Step 1: User Registration with University Selection** ✅ **IMPLEMENTED**
  - User mendaftar via public registration form
  - **New Field**: Dropdown pilihan universitas (21 universities)
  - User memilih role: **LPPM Admin** atau **User** (Journal Manager)
  - Setelah register, akun dalam status `pending_approval`
  - **Implementation**:
    - ✅ Migration: Add `approval_status` enum field to `users` table - DONE
    - ✅ Values: `pending`, `approved`, `rejected` - DONE
    - ✅ Add `approved_by` (foreign key to users) and `approved_at` timestamp - DONE
    - ✅ Registration form: Add university dropdown (seeded from database) - DONE
    - ✅ Role selection: LPPM Admin vs User - DONE

- [x] **Step 2: LPPM Approval for User Registration** ✅ **IMPLEMENTED**
  - LPPM admin melihat daftar user pending approval **di university mereka**
  - LPPM dapat approve/reject dengan alasan
  - Setelah di-approve, user dapat login dan submit journals
  - **Notification**: Email ke user setelah approval/rejection (TODO: Phase 6)
  - **Implementation**:
    - ✅ Route: `GET /admin-kampus/users/pending` → Index pending users - DONE
    - ✅ Controller: `AdminKampus\UserApprovalController@index()` - DONE
    - ✅ Action: `POST /admin-kampus/users/{id}/approve` - DONE
    - ✅ Action: `POST /admin-kampus/users/{id}/reject` - DONE
    - ✅ Policy: `UserPolicy@approve()` - only LPPM from same university - DONE
    - ✅ Frontend: Integrated in `AdminKampus/Users/Index.tsx` with separate pagination - DONE
    - ✅ **UI Enhancement**: Pending approvals integrated in main Users index page for better UX - DONE

- [x] **Step 3: Journal Submission** ✅ **IMPLEMENTED**
  - Approved user dapat submit journal
  - Journal dalam status `pending_approval` setelah submit
  - **New Field**: `approval_status` on journals table
  - Journal belum visible di public/dashboard sampai di-approve
  - **Implementation**:
    - ✅ Migration: Add `approval_status`, `approved_by`, `approved_at` to `journals` table - DONE
    - ✅ Form: User submit journal via `/user/journals/create` - DONE (existing)
    - ✅ Controller: `User\JournalController@store()` - set status to `pending_approval` - DONE (existing)

- [x] **Step 4: LPPM Approval for Journal Submission** ✅ **IMPLEMENTED**
  - LPPM melihat daftar journal pending approval di university mereka
  - LPPM approve/reject journal dengan catatan
  - Setelah approved, journal visible di platform
  - **Implementation**:
    - ✅ Route: `GET /admin-kampus/journals/pending` - DONE
    - ✅ Controller: `AdminKampus\JournalApprovalController@index()` - DONE
    - ✅ Action: `POST /admin-kampus/journals/{id}/approve` - DONE
    - ✅ Action: `POST /admin-kampus/journals/{id}/reject` - DONE
    - ✅ Policy: `JournalPolicy@approve()` - only LPPM from same university - DONE
    - ✅ Frontend: `AdminKampus/Journals/PendingApproval.tsx` - DONE

#### LPPM Admin Registration Flow
- [x] **LPPM Admin Registration → Dikti Approval** ✅ **IMPLEMENTED** (Feb 10, 2026)
  - LPPM admin register via separate path (different from regular user)
  - Dikti admin approve LPPM registration
  - Dikti admin **assign role** LPPM (Admin Kampus) saat approval
  - **Implementation**:
    - ✅ Controller: `Admin\LppmApprovalController` created with `approve()` and `reject()` methods
    - ✅ Routes: `POST /admin/users/{user}/approve-lppm` and `reject-lppm` added to web.php
    - ✅ Frontend: Integrated pending LPPM section in `Admin/Users/Index.tsx` following AdminKampus pattern
    - ✅ Dashboard: Pending LPPM count card added to Super Admin dashboard
    - ✅ Policy: Existing `UserPolicy@approve()` supports LPPM approval by Super Admin
    - ✅ Auto-activate: LPPM assigned Admin Kampus role and `is_active=true` on approval
    - ✅ Rejection flow: Requires reason (10-500 chars), sets `rejection_reason` field
  - **Pattern Used**: Integrated approval section (not separate page) following `AdminKampus/Users/Index.tsx`
  - ⏳ Notification: Email to LPPM after approval/rejection (TODO: Phase 6)

---

### 2. **Dashboard Redesign - Move Visualizations**

#### Relocate Journal Metrics from "Jurnal" Tab to Main Dashboard

- [x] **Move Visualization Section to Dashboard** ✅ **IMPLEMENTED** (Feb 11, 2026)
  - ✅ Visualization moved from `/journals` to `/dashboard`
  - ✅ Main dashboard now shows key metrics
  - Display key metrics:
    - ✅ Total Journals
    - ✅ Journals Terindeks Scopus
    - ✅ Journals Terindeks SINTA
    - ✅ Journals Non-SINTA
  - ✅ Accessible to **all user roles** with different scope:
    - ✅ **User**: Only journals they manage with status breakdown
    - ✅ **LPPM**: All journals in their university
    - ✅ **Dikti**: Aggregated data from all universities
  - **Implementation**:
    - ✅ Controller: `DashboardController@index()` with journal statistics and caching
    - ✅ Component: `<StatisticsDashboard />` - comprehensive metrics visualization
    - ✅ Existing visualization integrated into Dashboard
    - ✅ Role-based scoping logic fully implemented

#### Dikti Dashboard - Aggregated Metrics
- [x] **Dikti Dashboard: System-Wide Statistics** ✅ **IMPLEMENTED** (Feb 10, 2026)
  - Dikti melihat collective data dari **semua universities**
  - Metrics:
    - Total journals across all universities ✅
    - Scopus-indexed journals (system-wide) ✅
    - SINTA-indexed journals (system-wide) ✅
    - Non-SINTA journals ✅
    - **Distribution by University** (table with percentage) ✅
  - **Implementation**:
    - Route: `GET /dashboard` (unified dashboard for all roles) ✅
    - Controller: `DashboardController@index()` (role-based metrics) ✅
    - Query: Aggregate journals across all universities with JOIN ✅
    - Component: University distribution table with hover effects ✅

#### User Dashboard - Simplified
- [x] **User Dashboard: Personal Journal View** ✅ **IMPLEMENTED** (Feb 10, 2026)
  - User hanya melihat journals yang mereka manage
  - Simple metrics:
    - Total journals saya ✅
    - Journals by status (pending, approved, rejected) ✅
    - Indexation status ✅
  - **Implementation**:
    - Scope: `Journal::where('user_id', auth()->id())` ✅
    - 4-column card layout with status breakdown ✅
    - Color-coded cards: pending (amber), approved (green), rejected (red) ✅

---

### 3. **LPPM Admin - Reassign Journal Manager**

#### Critical Feature for Continuity Management

- [x] **LPPM Can Reassign Journal Manager** ✅ **IMPLEMENTED**
  - Use Case: User leaves university, LPPM needs to transfer journal ownership
  - LPPM dapat reassign journal dari satu user ke user lain **di university yang sama**
  - **Audit Trail**: Log reassignment history (who reassigned, when, from/to)
  - **Notification**: Both old and new manager notified (TODO: Phase 6)
  - **Implementation**:
    - ✅ Route: `POST /admin-kampus/journals/{id}/reassign` - DONE
    - ✅ Controller: `AdminKampus\JournalController@reassign()` - DONE
    - ✅ Policy: `JournalPolicy@reassign()` - LPPM only, same university - DONE
    - ✅ Audit log uses existing `journal_reassignments` table - DONE
    - ⏳ Frontend: Reassignment dialog component - PENDING (Phase 5)

---

### 4. **LPPM Admin - Direct User Registration**

#### LPPM Can Register Users on Behalf of University

- [x] **LPPM Direct Registration Feature** ✅ **IMPLEMENTED**
  - LPPM admin dapat register user **langsung** (bypass approval)
  - User langsung active, tidak perlu approval lagi
  - Use Case: LPPM mengundang specific users ke platform
  - **Implementation**:
    - ✅ Route: `GET /admin-kampus/users/create` - Registration form
    - ✅ Controller: `AdminKampus\UserController@create()` and `@store()`
    - ✅ Set `approval_status` = `approved` by default
    - ✅ Set `approved_by` = LPPM admin ID
    - ⏳ Generate random password, send via email (pending email setup)
    - ⏳ User forced to change password on first login (pending)

---

### 5. **University List - 21 "Excellent" Universities**

#### Seed Database with Target Universities

- [x] **University Seeder for Production** ✅ **COMPLETED** (Feb 11, 2026)
  - ✅ Received PTMA.json list from ADTRAINING (172 universities)
  - ✅ Seeded ALL 172 universitas (not just 21 "excellent")
  - ✅ Per advisor guidance: "Semua saja mas skalian, Nanti yg diundang memang bertahap"
  - **Implementation**:
    - ✅ Seeder: [UniversitySeeder.php](../database/seeders/UniversitySeeder.php) - Dynamic JSON loading
    - ✅ Source: [PTMA.json](../database/PTMA.json) - 172 universities
    - ✅ Features: Auto code mapping, error handling, progress bar, idempotent seeding
    - ✅ Includes: code, ptm_code, name, accreditation_status, is_active
    - ⏳ **Pending**: Complete data (address, city, website) - will be updated post-launch
    - 📄 See: [UNIVERSITY_SEEDER_IMPLEMENTATION.md](UNIVERSITY_SEEDER_IMPLEMENTATION.md)

---

### 6. **Future Features - OAI-PMH Integration** (DEFERRED)

#### Harvest Article Metadata from Journal Endpoints

- [ ] **Add OAI Field to Journal Registration** 🟡 **LOW PRIORITY - FUTURE**
  - **New Field**: `oai_endpoint` (nullable string) in `journals` table
  - Form: Text input for OAI-PMH endpoint URL
  - **Goal**: Harvest article metadata (abstracts, issues) from journals
  - **Mechanism**: Background job queries OAI endpoint periodically
  - **Use Case**: Enable article-level search (like Garuda platform)
  - **Status**: Deferred to post-launch iteration
  - **Implementation**:
    - Migration: `ALTER TABLE journals ADD COLUMN oai_endpoint VARCHAR(255) NULL`
    - Form field: Optional URL input with validation
    - Future: Create `ArticleHarvesterJob` using OAI-PMH protocol

---

### 7. **Browse by University**

#### Public Browse Feature for Journal Discovery

- [x] **Browse Journals by University** ✅ **IMPLEMENTED** (Feb 11, 2026)
  - ✅ Public page: Browse journals grouped by university
  - ✅ Filter by university from searchable dropdown
  - Display:
    - ✅ University name, code, short name
    - ✅ Total journals count per university
    - ✅ List of journals (title, ISSN, indexation status, scientific field)
  - **Implementation**:
    - ✅ Route: `GET /browse/universities` - Public route
    - ✅ Controller: `PublicJournalController@browseUniversities()`
    - ✅ Query: Group journals by university, only show approved journals
    - ✅ Component: `Browse/Universities.tsx` with filtering and pagination
    - ✅ Features: Expandable view, journal cards, statistics caching

---

## 🗂️ Database Changes Required

### 1. User Approval Fields
```sql
ALTER TABLE users
ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER role_id,
ADD COLUMN approved_by BIGINT UNSIGNED NULL AFTER approval_status,
ADD COLUMN approved_at TIMESTAMP NULL AFTER approved_by,
ADD COLUMN rejection_reason TEXT NULL AFTER approved_at,
ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
```

### 2. Journal Approval Fields
```sql
ALTER TABLE journals
ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER status,
ADD COLUMN approved_by BIGINT UNSIGNED NULL AFTER approval_status,
ADD COLUMN approved_at TIMESTAMP NULL AFTER approved_by,
ADD COLUMN rejection_reason TEXT NULL AFTER approved_at,
ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
```

### 3. Journal Reassignment Audit Log
```sql
CREATE TABLE journal_reassignments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  journal_id BIGINT UNSIGNED NOT NULL,
  from_user_id BIGINT UNSIGNED NOT NULL,
  to_user_id BIGINT UNSIGNED NOT NULL,
  reassigned_by BIGINT UNSIGNED NOT NULL,
  reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reassigned_by) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4. OAI-PMH Endpoint (Future)
```sql
ALTER TABLE journals
ADD COLUMN oai_endpoint VARCHAR(255) NULL AFTER website
  COMMENT 'OAI-PMH endpoint URL for article harvesting';
```

---

## 💻 Backend Implementation Required

### 1. User Approval Controllers

```php
// app/Http/Controllers/AdminKampus/UserApprovalController.php
namespace App\Http\Controllers\AdminKampus;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserApprovalController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('approveUsers', User::class);
        
        $query = User::where('university_id', auth()->user()->university_id)
            ->where('approval_status', 'pending')
            ->with('role');
        
        $users = $query->paginate(15);
        
        return Inertia::render('AdminKampus/Users/PendingApproval', [
            'users' => $users,
        ]);
    }
    
    public function approve(Request $request, User $user)
    {
        $this->authorize('approve', $user);
        
        // Ensure LPPM can only approve users from their university
        if ($user->university_id !== auth()->user()->university_id) {
            abort(403, 'Unauthorized');
        }
        
        $user->update([
            'approval_status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);
        
        // Send notification to user
        $user->notify(new UserApprovedNotification());
        
        return redirect()
            ->route('admin-kampus.users.pending')
            ->with('success', 'User berhasil disetujui');
    }
    
    public function reject(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|min:10',
        ]);
        
        $this->authorize('approve', $user);
        
        if ($user->university_id !== auth()->user()->university_id) {
            abort(403, 'Unauthorized');
        }
        
        $user->update([
            'approval_status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $request->reason,
        ]);
        
        // Send notification to user
        $user->notify(new UserRejectedNotification($request->reason));
        
        return redirect()
            ->route('admin-kampus.users.pending')
            ->with('success', 'User ditolak');
    }
}
```

### 2. Journal Approval Controllers

```php
// app/Http/Controllers/AdminKampus/JournalApprovalController.php
namespace App\Http\Controllers\AdminKampus;

use App\Models\Journal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JournalApprovalController extends Controller
{
    public function index(Request $request)
    {
        $query = Journal::where('university_id', auth()->user()->university_id)
            ->where('approval_status', 'pending')
            ->with(['user', 'scientific_field']);
        
        $journals = $query->paginate(15);
        
        return Inertia::render('AdminKampus/Journals/PendingApproval', [
            'journals' => $journals,
        ]);
    }
    
    public function approve(Request $request, Journal $journal)
    {
        $this->authorize('approve', $journal);
        
        if ($journal->university_id !== auth()->user()->university_id) {
            abort(403, 'Unauthorized');
        }
        
        $journal->update([
            'approval_status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);
        
        // Notify journal manager
        $journal->user->notify(new JournalApprovedNotification($journal));
        
        return redirect()
            ->route('admin-kampus.journals.pending')
            ->with('success', 'Jurnal berhasil disetujui');
    }
    
    public function reject(Request $request, Journal $journal)
    {
        $request->validate([
            'reason' => 'required|string|min:10',
        ]);
        
        $this->authorize('approve', $journal);
        
        if ($journal->university_id !== auth()->user()->university_id) {
            abort(403, 'Unauthorized');
        }
        
        $journal->update([
            'approval_status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $request->reason,
        ]);
        
        $journal->user->notify(new JournalRejectedNotification($journal, $request->reason));
        
        return redirect()
            ->route('admin-kampus.journals.pending')
            ->with('success', 'Jurnal ditolak');
    }
}
```

### 3. Journal Reassignment

```php
// app/Http/Controllers/AdminKampus/JournalController.php
public function reassign(Request $request, Journal $journal)
{
    $this->authorize('reassign', $journal);
    
    $request->validate([
        'new_user_id' => 'required|exists:users,id',
        'reason' => 'nullable|string|max:500',
    ]);
    
    // Ensure new user is from same university
    $newUser = User::findOrFail($request->new_user_id);
    if ($newUser->university_id !== auth()->user()->university_id) {
        return back()->withErrors(['error' => 'User harus dari universitas yang sama']);
    }
    
    $oldUserId = $journal->user_id;
    
    // Log reassignment
    \DB::table('journal_reassignments')->insert([
        'journal_id' => $journal->id,
        'from_user_id' => $oldUserId,
        'to_user_id' => $request->new_user_id,
        'reassigned_by' => auth()->id(),
        'reason' => $request->reason,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    // Update journal ownership
    $journal->update([
        'user_id' => $request->new_user_id,
    ]);
    
    // Notify both users
    $oldUser = User::find($oldUserId);
    $oldUser->notify(new JournalReassignedNotification($journal, 'removed'));
    $newUser->notify(new JournalReassignedNotification($journal, 'assigned'));
    
    return back()->with('success', 'Jurnal berhasil di-reassign');
}
```

### 4. Dashboard Redesign

```php
// app/Http/Controllers/DashboardController.php
public function index()
{
    $user = auth()->user();
    
    // Role-based metrics
    if ($user->isSuperAdmin()) {
        // System-wide metrics
        $metrics = [
            'total_journals' => Journal::where('approval_status', 'approved')->count(),
            'scopus_journals' => Journal::where('approval_status', 'approved')
                ->where('is_indexed_in_scopus', true)->count(),
            'sinta_journals' => Journal::where('approval_status', 'approved')
                ->whereNotNull('sinta_rank')->count(),
            'non_sinta_journals' => Journal::where('approval_status', 'approved')
                ->whereNull('sinta_rank')
                ->where('is_indexed_in_scopus', false)->count(),
            'universities_distribution' => Journal::where('approval_status', 'approved')
                ->with('university')
                ->get()
                ->groupBy('university_id')
                ->map(fn($journals) => [
                    'university' => $journals->first()->university->name,
                    'count' => $journals->count(),
                ]),
        ];
    } elseif ($user->isAdminKampus()) {
        // University-scoped metrics
        $metrics = [
            'total_journals' => Journal::where('university_id', $user->university_id)
                ->where('approval_status', 'approved')->count(),
            'scopus_journals' => Journal::where('university_id', $user->university_id)
                ->where('approval_status', 'approved')
                ->where('is_indexed_in_scopus', true)->count(),
            'sinta_journals' => Journal::where('university_id', $user->university_id)
                ->where('approval_status', 'approved')
                ->whereNotNull('sinta_rank')->count(),
            'non_sinta_journals' => Journal::where('university_id', $user->university_id)
                ->where('approval_status', 'approved')
                ->whereNull('sinta_rank')
                ->where('is_indexed_in_scopus', false)->count(),
            'pending_approvals' => [
                'users' => User::where('university_id', $user->university_id)
                    ->where('approval_status', 'pending')->count(),
                'journals' => Journal::where('university_id', $user->university_id)
                    ->where('approval_status', 'pending')->count(),
            ],
        ];
    } else {
        // User: Only their own journals
        $metrics = [
            'total_journals' => Journal::where('user_id', $user->id)->count(),
            'approved_journals' => Journal::where('user_id', $user->id)
                ->where('approval_status', 'approved')->count(),
            'pending_journals' => Journal::where('user_id', $user->id)
                ->where('approval_status', 'pending')->count(),
            'rejected_journals' => Journal::where('user_id', $user->id)
                ->where('approval_status', 'rejected')->count(),
        ];
    }
    
    return Inertia::render('Dashboard', [
        'metrics' => $metrics,
    ]);
}
```

### 5. Registration with University Selection

```php
// app/Http/Controllers/Auth/RegisteredUserController.php
public function create()
{
    // Get active universities for dropdown
    $universities = \App\Models\University::where('status', 'active')
        ->orderBy('name')
        ->get(['id', 'name']);
    
    return Inertia::render('Auth/Register', [
        'universities' => $universities,
    ]);
}

public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|confirmed|min:8',
        'university_id' => 'required|exists:universities,id',
        'role_type' => 'required|in:lppm,user',
    ]);
    
    // Determine pending role based on selection
    $roleId = $request->role_type === 'lppm' 
        ? null // Will be assigned by Dikti after approval
        : \App\Models\Role::where('name', 'User')->first()->id;
    
    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'university_id' => $request->university_id,
        'role_id' => $roleId,
        'approval_status' => 'pending',
    ]);
    
    // Notify LPPM admin (if registering as User)
    // Or notify Dikti (if registering as LPPM)
    if ($request->role_type === 'lppm') {
        // Notify Dikti for LPPM approval
        $dikitiAdmins = User::whereHas('role', fn($q) => $q->where('name', 'Super Admin'))->get();
        \Notification::send($dikitiAdmins, new NewLPPMRegistrationNotification($user));
    } else {
        // Notify LPPM for User approval
        $lppmAdmins = User::where('university_id', $request->university_id)
            ->whereHas('role', fn($q) => $q->where('name', 'Admin Kampus'))
            ->get();
        \Notification::send($lppmAdmins, new NewUserRegistrationNotification($user));
    }
    
    return redirect()->route('login')
        ->with('status', 'Pendaftaran berhasil. Menunggu approval dari admin.');
}
```

---

## 🎨 Frontend Implementation Required

### 1. User Registration Form with University Dropdown

```typescript
// resources/js/pages/Auth/Register.tsx
interface Props {
  universities: Array<{ id: number; name: string }>;
}

export default function Register({ universities }: Props) {
  const [roleType, setRoleType] = useState<'lppm' | 'user'>('user');
  
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    university_id: '',
    role_type: 'user',
  });
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post(route('register'));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name, Email, Password fields... */}
      
      <div className="space-y-2">
        <Label htmlFor="university">Universitas *</Label>
        <Select 
          value={data.university_id.toString()} 
          onValueChange={(value) => setData('university_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Universitas" />
          </SelectTrigger>
          <SelectContent>
            {universities.map((uni) => (
              <SelectItem key={uni.id} value={uni.id.toString()}>
                {uni.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.university_id && <InputError message={errors.university_id} />}
      </div>
      
      <div className="space-y-2">
        <Label>Daftar Sebagai *</Label>
        <RadioGroup 
          value={data.role_type} 
          onValueChange={(value) => {
            setData('role_type', value);
            setRoleType(value as 'lppm' | 'user');
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="user" id="user" />
            <Label htmlFor="user">Journal Manager (User)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lppm" id="lppm" />
            <Label htmlFor="lppm">LPPM Admin</Label>
          </div>
        </RadioGroup>
        <p className="text-xs text-muted-foreground">
          {roleType === 'lppm' 
            ? 'Akun LPPM akan disetujui oleh Dikti' 
            : 'Akun User akan disetujui oleh LPPM universitas Anda'}
        </p>
        {errors.role_type && <InputError message={errors.role_type} />}
      </div>
      
      <Button type="submit" disabled={processing} className="w-full">
        Daftar
      </Button>
    </form>
  );
}
```

### 2. LPPM Pending Approval Pages

```typescript
// resources/js/pages/AdminKampus/Users/PendingApproval.tsx
interface PendingUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  role?: { name: string };
}

interface Props {
  users: PaginatedData<PendingUser>;
}

export default function PendingApproval({ users }: Props) {
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  const handleApprove = (userId: number) => {
    router.post(route('admin-kampus.users.approve', userId));
  };
  
  const handleReject = (userId: number, reason: string) => {
    router.post(route('admin-kampus.users.reject', userId), { reason });
    setShowRejectDialog(false);
  };
  
  return (
    <AppLayout title="Pending User Approvals">
      <Card>
        <CardHeader>
          <CardTitle>User Menunggu Approval</CardTitle>
          <CardDescription>
            Daftar user yang mendaftar di universitas Anda dan menunggu persetujuan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tanggal Daftar</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Tidak ada user menunggu approval
                  </TableCell>
                </TableRow>
              ) : (
                users.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.role?.name || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleApprove(user.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Reject Dialog with Reason */}
      <RejectDialog 
        open={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={(reason) => selectedUser && handleReject(selectedUser.id, reason)}
        userName={selectedUser?.name || ''}
      />
    </AppLayout>
  );
}
```

### 3. Dashboard with Metrics Cards

```typescript
// resources/js/pages/Dashboard.tsx
interface Metrics {
  total_journals: number;
  scopus_journals: number;
  sinta_journals: number;
  non_sinta_journals: number;
  pending_approvals?: {
    users: number;
    journals: number;
  };
  universities_distribution?: Array<{
    university: string;
    count: number;
  }>;
}

interface Props {
  metrics: Metrics;
}

export default function Dashboard({ metrics }: Props) {
  const user = usePage().props.auth.user;
  
  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold">
            Selamat Datang, {user.name}!
          </h1>
          <p className="text-muted-foreground">
            {user.role.name} - {user.university?.name}
          </p>
        </div>
        
        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Jurnal"
            value={metrics.total_journals}
            icon={BookOpen}
            description="Jurnal yang dikelola"
          />
          <MetricCard
            title="Terindeks Scopus"
            value={metrics.scopus_journals}
            icon={Award}
            description="Jurnal terindeks Scopus"
            variant="success"
          />
          <MetricCard
            title="Terindeks SINTA"
            value={metrics.sinta_journals}
            icon={Trophy}
            description="Jurnal terindeks SINTA"
            variant="info"
          />
          <MetricCard
            title="Non-SINTA"
            value={metrics.non_sinta_journals}
            icon={FileText}
            description="Jurnal belum terindeks"
            variant="warning"
          />
        </div>
        
        {/* LPPM: Pending Approvals */}
        {metrics.pending_approvals && (
          <Card>
            <CardHeader>
              <CardTitle>Menunggu Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Link href={route('admin-kampus.users.pending')}>
                  <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">User</p>
                        <p className="text-2xl font-bold">
                          {metrics.pending_approvals.users}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
                <Link href={route('admin-kampus.journals.pending')}>
                  <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Jurnal</p>
                        <p className="text-2xl font-bold">
                          {metrics.pending_approvals.journals}
                        </p>
                      </div>
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Dikti: Distribution by University */}
        {metrics.universities_distribution && (
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Jurnal per Universitas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Universitas</TableHead>
                    <TableHead className="text-right">Jumlah Jurnal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.universities_distribution.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.university}</TableCell>
                      <TableCell className="text-right font-medium">
                        {item.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
```

### 4. Journal Reassignment Dialog

```typescript
// resources/js/components/JournalReassignDialog.tsx
interface Props {
  journal: Journal;
  users: User[]; // Users from same university
  open: boolean;
  onClose: () => void;
}

export default function JournalReassignDialog({ 
  journal, 
  users, 
  open, 
  onClose 
}: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    new_user_id: '',
    reason: '',
  });
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post(route('admin-kampus.journals.reassign', journal.id), {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign Journal Manager</DialogTitle>
          <DialogDescription>
            Pindahkan ownership jurnal "{journal.name}" ke user lain
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Manager Saat Ini</Label>
            <Input value={journal.user.name} disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new_user">Manager Baru *</Label>
            <Select 
              value={data.new_user_id} 
              onValueChange={(value) => setData('new_user_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih User" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter(u => u.id !== journal.user_id)
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.new_user_id && <InputError message={errors.new_user_id} />}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Alasan (Opsional)</Label>
            <Textarea
              id="reason"
              value={data.reason}
              onChange={(e) => setData('reason', e.target.value)}
              placeholder="Alasan reassignment..."
              rows={3}
            />
            {errors.reason && <InputError message={errors.reason} />}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={processing}>
              Reassign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📋 Implementation Priority & Timeline

### 🔴 **CRITICAL - Must Complete by Thursday Morning** (Feb 12, 2026)

#### Day 1 - Sunday, Feb 9 (Today Evening Follow-up)
- [x] Database migrations (user/journal approval fields, reassignment table) ✅
- [x] University seeder (waiting for 21 universities list from ADTRAINING) ✅
- [x] Registration form with university dropdown ✅
- [x] User approval flow (LPPM approve users) ✅

#### Day 2 - Monday, Feb 10
- [x] Journal approval flow (LPPM approve journals) ✅
- [x] Dashboard redesign (move visualizations, role-based metrics) ✅
- [x] LPPM direct user registration ✅
- [x] Journal reassignment feature (backend) ✅
- [ ] Journal reassignment feature (frontend) ⏳ Phase 5

#### Day 3 - Tuesday, Feb 11
- [x] Dikti dashboard (system-wide metrics) ✅
- [x] Browse by university (public page) ✅
- [x] Dashboard redesign (move visualizations) ✅
- [x] Testing all approval flows ✅
- [x] Bug fixes and polish ✅

#### Day 4 - Wednesday, Feb 12 (Morning) - TODAY
- [ ] Final testing ⏳
- [ ] Production deployment ⏳
- [ ] Data verification ⏳
- [ ] **LAUNCH at Thursday presentation** 🎯

---

### 🟡 **DEFERRED - Post-Launch Iteration**

These features are explicitly deferred and will NOT be in Thursday launch:

- ❌ **Assessment System** (entire module)
  - Assessment submission flow
  - Reviewer assignment
  - Assessment review and feedback
  - Assessment notes/timeline
  
- ❌ **Pembinaan System** (entire module)
  - Pembinaan registration
  - Pembinaan periods
  - Supporting documents upload
  
- ❌ **Reviewer Role** (not needed without assessments)
  
- ❌ **OAI-PMH Integration**
  - Article harvesting
  - Article-level search
  
- ❌ **Advanced Search/Browse**
  - Complex filtering
  - Article search

**Rationale**: Focus on getting core platform functional for data population first. Assessment and advanced features can be added incrementally post-launch.

---

## 🎯 Success Criteria for Thursday Launch

### Functional Requirements
- [x] ✅ Users can register and select university
- [x] ✅ LPPM can approve/reject user registrations
- [x] ✅ Approved users can submit journals
- [x] ✅ LPPM can approve/reject journal submissions
- [x] ✅ LPPM can reassign journal managers (backend implemented)
- [x] ✅ Dashboard displays key metrics (role-based) - COMPLETED Feb 11
- [x] ✅ Public browse by university works - COMPLETED Feb 11
- [ ] ⏳ Journal reassignment frontend (dialog UI) - Optional for launch

### Data Requirements
- [x] ✅ 21 universities seeded in database (seeder ready)
- [ ] ⏳ At least 1 LPPM admin per university created (manual/seeder needed)
- [ ] ⏳ Sample journals for demo purposes (to be populated)

### Technical Requirements
- [ ] ⏳ Production server deployed and accessible
- [ ] ⏳ SSL certificate configured
- [ ] ⏳ Database backed up
- [ ] ⏳ Email notifications working (SMTP configuration pending)
- [x] ✅ All critical bugs fixed (core features stable)

### User Acceptance
- [x] ✅ ADTRAINING approves UI/UX
- [x] ✅ Tutorial slides prepared
- [x] ✅ User documentation ready
- [x] ✅ Demo script tested

---

## 🔒 Authorization Matrix (Updated)

| Feature | User | LPPM | Dikti | Reviewer |
|---------|------|------|-------|----------|
| Register (public) | ✅ | ✅ | ❌ | ❌ |
| Approve User Registration | ❌ | ✅ (own uni) | ✅ (LPPM only) | ❌ |
| Submit Journal | ✅ | ❌ | ❌ | ❌ |
| Approve Journal | ❌ | ✅ (own uni) | ❌ | ❌ |
| Reassign Journal Manager | ❌ | ✅ (own uni) | ❌ | ❌ |
| Register User Directly | ❌ | ✅ (own uni) | ✅ | ❌ |
| View Dashboard (own) | ✅ | ✅ | ✅ | ❌ |
| View System-Wide Metrics | ❌ | ❌ | ✅ | ❌ |
| Browse Journals (public) | ✅ | ✅ | ✅ | ❌ |

**Note**: Reviewer role is deferred. Assessment-related authorizations removed from this phase.

---

## 📝 Policy Updates Required

### 1. UserPolicy - Add Approval Methods

```php
// app/Policies/UserPolicy.php
class UserPolicy
{
    public function approveUsers(User $user): bool
    {
        // LPPM can view pending approvals for their university
        return $user->isAdminKampus();
    }
    
    public function approve(User $user, User $targetUser): bool
    {
        // LPPM can approve users from their university
        // Dikti can approve LPPM registrations
        if ($user->isSuperAdmin()) {
            // Dikti can approve LPPM only
            return $targetUser->role_id === null; // LPPM pending role
        }
        
        if ($user->isAdminKampus()) {
            // LPPM can approve regular users from their university
            return $user->university_id === $targetUser->university_id;
        }
        
        return false;
    }
    
    public function registerDirectly(User $user): bool
    {
        // LPPM can register users directly in their university
        return $user->isAdminKampus() || $user->isSuperAdmin();
    }
}
```

### 2. JournalPolicy - Add Approval & Reassignment

```php
// app/Policies/JournalPolicy.php
class JournalPolicy
{
    public function approve(User $user, Journal $journal): bool
    {
        // LPPM can approve journals from their university
        return $user->isAdminKampus() && 
               $user->university_id === $journal->university_id;
    }
    
    public function reassign(User $user, Journal $journal): bool
    {
        // LPPM can reassign journals in their university
        return $user->isAdminKampus() && 
               $user->university_id === $journal->university_id;
    }
    
    public function viewAny(User $user): bool
    {
        // Public can browse approved journals
        return true;
    }
    
    public function view(User $user, Journal $journal): bool
    {
        // User can view their own journals (any status)
        if ($user->id === $journal->user_id) {
            return true;
        }
        
        // LPPM can view all journals in their university
        if ($user->isAdminKampus() && $user->university_id === $journal->university_id) {
            return true;
        }
        
        // Dikti can view all
        if ($user->isSuperAdmin()) {
            return true;
        }
        
        // Public can only view approved journals
        return $journal->approval_status === 'approved';
    }
}
```

---

## 🚨 Critical Blockers & Dependencies

### External Dependencies
1. **University List** - REQUIRED from ADTRAINING
   - **Status**: ⏳ Waiting
   - **Required By**: Sunday evening (Feb 9)
   - **Impact**: Cannot seed database without this
   - **Action**: ADTRAINING to email list to Akyas

2. **Production Server Access**
   - **Status**: ✅ Assumed ready
   - **Required By**: Tuesday (Feb 11) for deployment
   - **Impact**: Cannot deploy without server

3. **Email Configuration**
   - **Status**: ⏳ To be configured
   - **Required By**: Monday (Feb 10)
   - **Impact**: Notifications won't work without this

### Internal Dependencies
1. **Migration Order**
   - Must run approval fields migrations before implementing controllers
   - Must seed universities before testing registration

2. **Testing Data**
   - Need sample users for each university
   - Need sample journals for demo

---

## 📚 Related Documents

### Previous Meetings
- [MEETING_NOTES_02_FEB_2026.md](MEETING_NOTES_02_FEB_2026.md) - Assessment flow (NOW DEFERRED)
- [MEETING_NOTES_30_JAN_2026.md](MEETING_NOTES_30_JAN_2026.md) - Statistics dashboard
- [MEETING_NOTES_16_JAN_2026.md](MEETING_NOTES_16_JAN_2026.md) - Initial requirements

### Technical Documentation
- [ERD Database.md](ERD Database.md) - Database schema (needs update for approval fields)
- [PEMBINAAN_CONTROLLERS_IMPLEMENTATION.md](PEMBINAAN_CONTROLLERS_IMPLEMENTATION.md) - Deferred module
- [ASSESSMENT_FLOW.md](ASSESSMENT_FLOW.md) - Deferred module

### Project Planning
- [jurnal_mu MVP.md](jurnal_mu MVP.md) - Original MVP scope (now revised)
- [jurnal_mu project plan.md](jurnal_mu project plan.md) - Overall project plan

---

## 🎤 Notes from Meeting

### Key Quotes & Decisions

> "Focus on getting the platform functional for data population. Assessment can come later."

> "LPPM is the gatekeeper - they approve both users AND journals."

> "Move the visualizations to dashboard - everyone needs to see metrics immediately."

> "Thursday is non-negotiable. We need core functionality working."

### Design Philosophy
- **Simplicity First**: Launch with minimal viable features
- **Data Collection**: Priority is getting journals registered
- **Gated Access**: Two-step approval ensures quality control
- **Flexibility**: LPPM can reassign to handle staff turnover

### Risk Mitigation
- **Deferred Complexity**: Assessment system is complex, defer it
- **Focused Scope**: Only core features to reduce bugs
- **Approval Workflow**: Prevents spam/invalid submissions
- **Audit Trail**: Reassignment logging for transparency

---

## ✅ Action Items Summary

### Akyas (Developer)
- [x] Implement user registration with university selection ✅
- [x] Implement LPPM approval for users ✅
- [x] Implement journal submission with approval ✅
- [x] Build journal reassignment feature (backend) ✅
- [x] Redesign dashboard with metrics ✅ (Feb 11)
- [x] Create browse by university page ✅ (Feb 11)
- [ ] Deploy to production by Wednesday ⏳ (TODAY)
- [ ] Prepare for Thursday launch ⏳

### ADTRAINING
- [x] Send list of 21 universities to Akyas (URGENT)
- [x] Create tutorial slides for launch
- [x] Prepare demo script
- [x] Schedule follow-up on Feb 9 evening
- [x] Share Feb 12 online session link

### Team
- [x] Progress check: Tomorrow (Feb 9) evening
- [x] Final check: Wednesday (Feb 12) morning
- [x] Launch: Thursday (Feb 12) presentation

---

**Prepared by**: GitHub Copilot  
**Date**: 08 Februari 2026  
**Focus**: Production Launch Preparation - Core Platform MVP  
**Deadline**: Thursday, February 12, 2026  
**Next Review**: Sunday Evening (Feb 9, 2026)
