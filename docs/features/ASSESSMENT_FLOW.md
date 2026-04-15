# Assessment Flow Documentation

## Overview
Dokumen ini menjelaskan alur proses assessment jurnal dari User hingga Admin Kampus approval.

**Version:** Phase 3 Implementation (Feb 2026)  
**Status:** ✅ Implemented & Tested

---

## Assessment Status Flow

```
┌──────────┐   User submits    ┌───────────┐   Admin approves   ┌──────────┐
│  draft   │ ─────────────────>│ submitted │ ──────────────────>│ reviewed │
└──────────┘                    └───────────┘                    └──────────┘
                                     │                                 │
                                     │ Admin rejects                   │
                                     │ (Request Revision)              │
                                     v                                 v
                                ┌──────────┐                    (End of Phase 3)
                                │  draft   │                    Future: Dikti
                                └──────────┘                    reviewer assignment
```

### Status Definitions

| Status | Description | Who Can Access | Next Action |
|--------|-------------|----------------|-------------|
| `draft` | Initial state, User working on assessment | User (owner only) | User submits |
| `submitted` | User submitted, waiting for Admin Kampus review | User (read-only), Admin Kampus | Admin approves/rejects |
| `reviewed` | Admin Kampus approved, assessment complete (Phase 3) | User (read-only), Admin Kampus | Future: Dikti assignment |

---

## Role Responsibilities

### 1. User (Journal Manager)
**Can Do:**
- Create new assessment (auto status: `draft`)
- Edit draft assessments
- Submit assessment for review (draft → `submitted`)
- View own submitted/reviewed assessments (read-only)
- Revise rejected assessments (status back to `draft`)

**Cannot Do:**
- View/edit other users' assessments
- Approve/reject assessments
- Access assessments from other universities

**Related Files:**
- Controller: `app/Http/Controllers/User/AssessmentController.php`
- Policy: `app/Policies/JournalAssessmentPolicy.php` (`update()`, `view()`)
- Routes: `routes/web.php` (user.assessments.*)

---

### 2. Admin Kampus (LPPM)
**Can Do:**
- View all `submitted` assessments from their university
- Approve assessment: `submitted` → `reviewed`
  - Required: `admin_kampus_approved_by`, `admin_kampus_approved_at`
  - Optional: `admin_kampus_approval_notes`
  - Auto-sets: `reviewed_by`, `reviewed_at`
- Request revision (reject): `submitted` → `draft`
  - Required: `admin_kampus_approval_notes` (reason for rejection)
  - User receives notification to revise
- View reviewed assessments (read-only)

**Cannot Do:**
- Approve/reject assessments from other universities
- Edit assessment responses directly
- Approve draft assessments (must be submitted first)

**Related Files:**
- Controller: `app/Http/Controllers/AdminKampus/AssessmentController.php`
- Policy: `app/Policies/JournalAssessmentPolicy.php` (`review()`)
- Routes: `routes/web.php` (admin-kampus.assessments.*)
- Tests: `tests/Feature/AdminKampus/AssessmentApprovalTest.php` ✅

---

## Database Schema

### Key Fields in `journal_assessments` Table

```sql
-- Status & Submission
status ENUM('draft', 'submitted', 'reviewed')
submitted_at TIMESTAMP NULL          -- User submission timestamp

-- Admin Kampus Approval (Phase 3)
admin_kampus_approved_by BIGINT      -- Admin Kampus user_id
admin_kampus_approved_at TIMESTAMP   -- Approval/rejection timestamp
admin_kampus_approval_notes TEXT     -- Notes (approval/rejection reason)

-- Final Review (populated on approval)
reviewed_by BIGINT                   -- Same as admin_kampus_approved_by
reviewed_at TIMESTAMP                -- Same as admin_kampus_approved_at
```

### Related Tables

**1. `assessment_notes` (Assessment Timeline)**
```sql
CREATE TABLE assessment_notes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    journal_assessment_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    author_role VARCHAR(50) NOT NULL,        -- 'User', 'Admin Kampus', 'Reviewer'
    note_type ENUM('submission', 'approval', 'rejection', 'review', 'general'),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (journal_assessment_id) REFERENCES journal_assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**2. `notifications` (Laravel Standard)**
- Used for notifying User about approval/rejection
- Created automatically via `Notification` facade

---

## API Endpoints

### User Routes
```php
// View assessments
GET  /user/assessments                → index()
GET  /user/assessments/{id}           → show()

// Create/Edit
GET  /user/assessments/create         → create()
POST /user/assessments                → store()
GET  /user/assessments/{id}/edit      → edit()
PUT  /user/assessments/{id}           → update()

// Submit for review
POST /user/assessments/{id}/submit    → submit()
```

### Admin Kampus Routes
```php
// View assessments
GET  /admin-kampus/assessments        → index()
GET  /admin-kampus/assessments/{id}   → show()

// Approval actions
POST /admin-kampus/assessments/{id}/approve          → approve()
POST /admin-kampus/assessments/{id}/request-revision → requestRevision()
```

---

## Authorization Rules

### Policy: `JournalAssessmentPolicy`

**User Permissions:**
```php
// Can view own assessments only
view($user, $assessment) {
    return $user->id === $assessment->user_id;
}

// Can update only draft assessments they own
update($user, $assessment) {
    return $user->id === $assessment->user_id 
        && $assessment->status === 'draft';
}
```

**Admin Kampus Permissions:**
```php
// Can review submitted assessments from own university
review($user, $assessment) {
    return $user->isAdminKampus()
        && $user->university_id === $assessment->journal->university_id
        && $assessment->status === 'submitted';
}

// Can view all assessments from own university
viewAny($user) {
    return $user->isAdminKampus();
}
```

---

## Notifications

### 1. AssessmentApprovedNotification
**Sent to:** User (assessment owner)  
**When:** Admin Kampus approves assessment  
**Channels:** `database`, `mail` (optional)  
**Data:**
```php
[
    'assessment_id' => $assessment->id,
    'journal_title' => $assessment->journal->title,
    'admin_notes' => $approvalNotes,
    'approved_by' => $adminName,
    'approved_at' => $timestamp,
    'action_url' => route('user.assessments.show', $assessment)
]
```

### 2. AssessmentRevisionRequestedNotification
**Sent to:** User (assessment owner)  
**When:** Admin Kampus rejects assessment (requests revision)  
**Channels:** `database`, `mail` (optional)  
**Data:**
```php
[
    'assessment_id' => $assessment->id,
    'journal_title' => $assessment->journal->title,
    'admin_notes' => $rejectionNotes,
    'requested_by' => $adminName,
    'message' => 'Admin has requested revisions',
    'action_url' => route('user.assessments.edit', $assessment)
]
```

---

## UI Components

### 1. StatusTimeline Component
**File:** `resources/js/components/StatusTimeline.tsx`  
**Purpose:** Visual timeline showing assessment progress  
**Props:**
```typescript
interface StatusTimelineProps {
    status: 'draft' | 'submitted' | 'reviewed';
    submittedAt?: string;
    reviewedAt?: string;
    reviewerName?: string;
}
```

**Features:**
- Color-coded status indicators
- Timestamps for each milestone
- Responsive design
- Icon indicators (CheckCircle, Clock, XCircle)

### 2. AssessmentNotesTimeline Component
**File:** `resources/js/components/AssessmentNotesTimeline.tsx`  
**Purpose:** Display timeline of all notes/activities on assessment  
**Props:**
```typescript
interface AssessmentNote {
    id: number;
    author: string;
    role: string;              // 'User', 'Admin Kampus', 'Reviewer'
    note_type: NoteType;       // 'submission', 'approval', 'rejection', etc.
    content: string;
    created_at: string;
}
```

**Features:**
- Chronological display
- Role-based color coding
- Expandable long notes
- Formatted timestamps

### 3. StatisticsDashboard Component
**File:** `resources/js/components/StatisticsDashboard.tsx`  
**Purpose:** Admin Kampus dashboard showing assessment statistics  
**Updated in Phase 3:**
- "Jurnal Terindeks Scopus" label (Scopus-only definition)
- Statistics card for submitted assessments count
- ApexCharts integration for visual analytics

---

## Testing

### Test Suite: AssessmentApprovalTest
**File:** `tests/Feature/AdminKampus/AssessmentApprovalTest.php`  
**Coverage:** 7 test cases, 42 assertions ✅

**Test Cases:**
1. ✅ Admin Kampus can view submitted assessments from own university
2. ✅ Admin Kampus cannot view assessments from other universities
3. ✅ Admin Kampus can approve assessment with timestamp
4. ✅ Admin Kampus can reject assessment with notes
5. ✅ Admin Kampus cannot approve assessment from other university
6. ✅ Admin Kampus can only review submitted assessments
7. ✅ Approval notes are required for rejection

**Run Tests:**
```bash
php artisan test tests/Feature/AdminKampus/AssessmentApprovalTest.php
```

---

## Validation Rules

### Approve Assessment
```php
$request->validate([
    'admin_notes' => 'nullable|string|max:1000',
]);
```

### Request Revision (Reject)
```php
$request->validate([
    'admin_notes' => 'required|string|max:1000',  // Required for rejection!
]);
```

---

## Business Rules

### 1. Indexation Definition (Phase 3)
**Scopus-Only Definition:**
- "Jurnal Terindeks" now means "Jurnal Terindeks Scopus"
- Statistics dashboard shows only Scopus-indexed journals
- Model method: `Journal::isIndexedInScopus()`
- Scope: `Journal::indexedInScopus()`

**Implementation:**
```php
// In Journal model
public function isIndexedInScopus(): bool {
    return isset($this->indexations['Scopus']);
}

// In controller
$indexedJournals = $journals->filter(fn($j) => $j->isIndexedInScopus())->count();
```

### 2. Cross-University Access Prevention
- Admin Kampus can ONLY access assessments from their own `university_id`
- Enforced at policy level (`JournalAssessmentPolicy::review()`)
- Additional middleware check: `CheckRole` middleware
- Route groups ensure role-based access

### 3. Status Transition Rules
```
Valid Transitions:
- draft → submitted (User action)
- submitted → reviewed (Admin Kampus approval)
- submitted → draft (Admin Kampus rejection)

Invalid Transitions:
- draft → reviewed (must go through submitted)
- reviewed → draft (cannot revert approved assessments)
- submitted → submitted (idempotent, no-op)
```

---

## Migration History

### Phase 3 Migrations (Feb 2026)

**1. Add Admin Kampus Approval Fields**
```sql
ALTER TABLE journal_assessments
ADD COLUMN admin_kampus_approved_by BIGINT UNSIGNED NULL AFTER reviewed_by,
ADD COLUMN admin_kampus_approved_at TIMESTAMP NULL AFTER reviewed_at,
ADD COLUMN admin_kampus_approval_notes TEXT NULL AFTER admin_notes,
ADD FOREIGN KEY (admin_kampus_approved_by) REFERENCES users(id) ON DELETE SET NULL;
```
**Migration File:** `2026_02_02_165652_add_admin_kampus_approval_to_journal_assessments_table.php`

**2. Create Notifications Table**
```bash
php artisan notifications:table
php artisan migrate
```
**Migration File:** `2026_02_03_002813_create_notifications_table.php`

**3. Fix Migration Order**
- Renamed `accreditation_templates` migration from `2026_01_27_*` to `2026_01_24_*`
- Reason: Must run before `pembinaan` table (foreign key dependency)

---

## Future Enhancements (Post-Phase 3)

### Planned for v1.1:
1. **Dikti Reviewer Assignment**
   - Super Admin assigns reviewer to `reviewed` assessments
   - New status: `reviewed` → `assigned` → `completed`
   - Reviewer provides final feedback

2. **Assessment Revision History**
   - Track all changes to assessment responses
   - Audit trail for compliance

3. **Batch Approval**
   - Admin Kampus can approve multiple assessments at once
   - Bulk actions UI

4. **Advanced Notifications**
   - Email templates
   - SMS notifications (via Twilio/Vonage)
   - Real-time WebSocket notifications

5. **Export to PDF**
   - Generate assessment report as PDF
   - Include timeline and all notes

---

## Troubleshooting

### Common Issues

**Issue 1: Status not updating**
```
Symptom: Assessment status remains 'submitted' after approval
Cause: Controller using wrong enum value (e.g., 'approved_by_lppm')
Fix: Use 'reviewed' status (matches migration enum)
```

**Issue 2: Notifications not sending**
```
Symptom: User not receiving approval/rejection notification
Cause: notifications table doesn't exist
Fix: Run php artisan notifications:table && php artisan migrate
```

**Issue 3: Admin Kampus can see other universities**
```
Symptom: Cross-university data leak
Cause: Missing university_id filter in query
Fix: Use Journal::forUniversity($universityId) scope
```

**Issue 4: Tests failing with "role_id required"**
```
Symptom: Factory creating users without role_id
Cause: User factory not using role states
Fix: Use User::factory()->user() or ->adminKampus()
```

---

## Related Documentation

- [ERD Database.md](./ERD%20Database.md) - Complete database schema
- [MEETING_NOTES_02_FEB_2026.md](./MEETING_NOTES_02_FEB_2026.md) - Phase 3 requirements
- [ROLE_CONSTANTS_GUIDE.md](./ROLE_CONSTANTS_GUIDE.md) - Role-based access control
- [policy testing.md](./policy%20testing.md) - Policy testing guide

---

**Last Updated:** February 3, 2026  
**Implementation Status:** ✅ Complete (Phase 3)  
**Test Coverage:** 7/7 tests passing (100%)
