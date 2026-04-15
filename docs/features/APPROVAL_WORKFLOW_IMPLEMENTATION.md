# Database Approval & Reassignment Implementation

**Date**: February 8, 2026  
**Status**: ✅ COMPLETED  
**Related**: [MEETING_NOTES_08_FEB_2026.md](MEETING_NOTES_08_FEB_2026.md)

---

## 📋 Overview

Implementation of two-step approval workflow for user registration and journal submission, plus journal manager reassignment capability. This enables LPPM admins to gate access and maintain data quality through approval processes.

---

## ✅ Completed Tasks

### 1. Database Migrations (3 files)

#### Migration 1: User Approval Fields
**File**: `database/migrations/2026_02_08_200000_add_approval_fields_to_users_table.php`

**Fields Added**:
- `approval_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved'
- `approved_by` BIGINT UNSIGNED NULL FK → users.id (SET NULL ON DELETE)
- `approved_at` TIMESTAMP NULL
- `rejection_reason` TEXT NULL
- Index on `approval_status`

**Migration Logic**:
- Existing users default to 'approved' status (maintains continuity)
- New registrations will use 'pending' status
- Foreign key with SET NULL preserves audit trail if approver deleted

#### Migration 2: Journal Approval Fields
**File**: `database/migrations/2026_02_08_200100_add_approval_fields_to_journals_table.php`

**Fields Added**:
- `approval_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
- `approved_by` BIGINT UNSIGNED NULL FK → users.id (SET NULL ON DELETE)
- `approved_at` TIMESTAMP NULL
- `rejection_reason` TEXT NULL
- Index on `approval_status`

**Migration Logic**:
- Existing journals default to 'approved' (maintains visibility)
- New journal submissions default to 'pending'
- Foreign key with SET NULL preserves history

#### Migration 3: Journal Reassignments Table
**File**: `database/migrations/2026_02_08_200200_create_journal_reassignments_table.php`

**Table Structure**:
```sql
CREATE TABLE journal_reassignments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  journal_id BIGINT UNSIGNED NOT NULL FK → journals.id (CASCADE ON DELETE),
  from_user_id BIGINT UNSIGNED NULL FK → users.id (SET NULL ON DELETE),
  to_user_id BIGINT UNSIGNED NULL FK → users.id (SET NULL ON DELETE),
  reassigned_by BIGINT UNSIGNED NULL FK → users.id (SET NULL ON DELETE),
  reason TEXT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Indexes**:
- `journal_id` - Query history by journal
- `from_user_id` - Query transfers from user
- `to_user_id` - Query transfers to user
- `reassigned_by` - Query reassignments by LPPM
- `created_at` - Sort chronologically

**Design Decisions**:
- CASCADE on journal deletion (audit irrelevant if journal deleted)
- SET NULL on user deletions (preserve audit trail with anonymous references)
- No soft deletes (immutable audit log)
- Timestamps for chronological tracking

---

### 2. Model Updates (3 models)

#### Model 1: User Model
**File**: `app/Models/User.php`

**Changes**:
1. **Fillable Fields**: Added `approval_status`, `approved_by`, `approved_at`, `rejection_reason`
2. **Casts**: Added `approved_at => datetime`
3. **Relationships**: 
   - `approver()` - belongsTo(User::class, 'approved_by')
4. **Scopes**:
   - `scopePendingApproval()` - WHERE approval_status = 'pending'
   - `scopeApproved()` - WHERE approval_status = 'approved'
   - `scopeRejected()` - WHERE approval_status = 'rejected'

**Usage Example**:
```php
// Get pending users for LPPM approval
$pendingUsers = User::where('university_id', $lppm->university_id)
    ->pendingApproval()
    ->with('approver')
    ->paginate(15);
```

#### Model 2: Journal Model
**File**: `app/Models/Journal.php`

**Changes**:
1. **Fillable Fields**: Added `approval_status`, `approved_by`, `approved_at`, `rejection_reason`
2. **Casts**: Added `approved_at => datetime`
3. **Relationships**: 
   - `approver()` - belongsTo(User::class, 'approved_by')
   - `reassignments()` - hasMany(JournalReassignment::class)
4. **Scopes**:
   - **Updated** `scopeActive()` - Now filters by `is_active = TRUE AND approval_status = 'approved'`
   - `scopePendingApproval()` - WHERE approval_status = 'pending'
   - `scopeApproved()` - WHERE approval_status = 'approved'
   - `scopeRejected()` - WHERE approval_status = 'rejected'
   - `scopeByApprovalStatus($status)` - Flexible status filter

**BREAKING CHANGE**: 
`scopeActive()` now includes approval status check. This ensures public-facing queries only show approved journals.

**Usage Example**:
```php
// Get pending journals for LPPM approval
$pendingJournals = Journal::where('university_id', $lppm->university_id)
    ->pendingApproval()
    ->with(['user', 'approver'])
    ->latest()
    ->paginate(15);

// Get reassignment history
$history = $journal->reassignments()
    ->with(['fromUser', 'toUser', 'reassignedBy'])
    ->latest()
    ->get();
```

#### Model 3: JournalReassignment (NEW)
**File**: `app/Models/JournalReassignment.php`

**Features**:
- Immutable audit log (no soft deletes)
- Mass-assignable fields: `journal_id`, `from_user_id`, `to_user_id`, `reassigned_by`, `reason`
- Datetime casts for timestamps

**Relationships**:
- `journal()` - belongsTo(Journal::class)
- `fromUser()` - belongsTo(User::class, 'from_user_id')
- `toUser()` - belongsTo(User::class, 'to_user_id')
- `reassignedBy()` - belongsTo(User::class, 'reassigned_by')

**Scopes**:
- `scopeForJournal($journalId)` - Filter by journal
- `scopeFromUser($userId)` - Filter transfers from user
- `scopeToUser($userId)` - Filter transfers to user
- `scopeByReassigner($userId)` - Filter by LPPM admin
- `scopeRecent($days)` - Filter by date range
- `scopeLatest()` - Order by most recent

**Usage Example**:
```php
// Log reassignment
JournalReassignment::create([
    'journal_id' => $journal->id,
    'from_user_id' => $oldUserId,
    'to_user_id' => $newUserId,
    'reassigned_by' => auth()->id(),
    'reason' => 'User left university',
]);

// Query reassignments
$recentReassignments = JournalReassignment::forJournal($journalId)
    ->with(['fromUser', 'toUser', 'reassignedBy'])
    ->latest()
    ->get();
```

---

## 🔄 Workflow Diagrams

### User Registration Approval Flow
```
┌─────────────────┐
│  User Registers │
│  (Public Form)  │
└────────┬────────┘
         │ approval_status = 'pending'
         │ role = 'User' or null (LPPM)
         ▼
┌─────────────────────────┐
│  LPPM/Dikti Sees        │
│  Pending Approval List  │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌─────────┐
│Approve│   │Reject  │
└──┬──┘   └────┬────┘
   │           │
   │ Set:      │ Set:
   │ - approved_by    │ - approved_by
   │ - approved_at    │ - approved_at
   │ - status='approved' │ - status='rejected'
   │           │ - rejection_reason
   ▼           ▼
┌─────────┐ ┌──────────┐
│ User    │ │ User     │
│ Active  │ │ Rejected │
│ + Email │ │ + Email  │
└─────────┘ └──────────┘
```

### Journal Submission Approval Flow
```
┌──────────────────┐
│ User Submits     │
│ Journal (Form)   │
└────────┬─────────┘
         │ approval_status = 'pending'
         ▼
┌─────────────────────────┐
│ LPPM Sees Pending       │
│ Journal Submissions     │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌─────────┐
│Approve│   │Reject  │
└──┬──┘   └────┬────┘
   │           │
   │ Set:      │ Set:
   │ - approved_by    │ - approved_by
   │ - approved_at    │ - approved_at
   │ - status='approved' │ - status='rejected'
   │           │ - rejection_reason
   ▼           ▼
┌─────────┐ ┌──────────────┐
│ Visible │ │ Hidden from  │
│ on       │ │ Public, User │
│ Platform│ │ Can Revise   │
└─────────┘ └──────────────┘
```

### Journal Reassignment Flow
```
┌──────────────────────┐
│ LPPM Selects Journal │
│ + New Manager        │
└──────────┬───────────┘
           │
           ▼
┌───────────────────────────┐
│ Create Audit Log Entry    │
│ journal_reassignments     │
│ - from_user_id            │
│ - to_user_id              │
│ - reassigned_by           │
│ - reason (optional)       │
└──────────┬────────────────┘
           │
           ▼
┌───────────────────────────┐
│ Update Journal Ownership  │
│ journals.user_id          │
└──────────┬────────────────┘
           │
      ┌────┴────┐
      │         │
      ▼         ▼
┌──────────┐ ┌──────────┐
│ Old User │ │ New User │
│ Notified │ │ Notified │
│ Removed  │ │ Assigned │
└──────────┘ └──────────┘
```

---

## 🔒 Authorization Matrix

| Action | User | LPPM | Dikti |
|--------|------|------|-------|
| Register (self) | ✅ | ✅ | ❌ |
| Approve User Registration | ❌ | ✅ (own uni) | ✅ (LPPM only) |
| Submit Journal | ✅ | ❌ | ❌ |
| Approve Journal | ❌ | ✅ (own uni) | ❌ |
| Reassign Journal Manager | ❌ | ✅ (own uni) | ❌ |
| View Pending Users | ❌ | ✅ (own uni) | ✅ (LPPM only) |
| View Pending Journals | ❌ | ✅ (own uni) | ❌ |

**Key Rules**:
- LPPM can only approve users/journals from their university (`university_id` match)
- Dikti approves LPPM registrations only (assigns `role_id` during approval)
- Users can only submit journals after their account is approved
- Journals are hidden from public until approved

---

## 📊 Database Schema Changes

### users Table (UPDATED)
```sql
-- NEW COLUMNS ADDED
approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved' AFTER is_active
approved_by BIGINT UNSIGNED NULL FK users(id) ON DELETE SET NULL AFTER approval_status
approved_at TIMESTAMP NULL AFTER approved_by
rejection_reason TEXT NULL AFTER approved_at

-- NEW INDEX
INDEX idx_approval_status (approval_status)
```

### journals Table (UPDATED)
```sql
-- NEW COLUMNS ADDED
approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER is_active
approved_by BIGINT UNSIGNED NULL FK users(id) ON DELETE SET NULL AFTER approval_status
approved_at TIMESTAMP NULL AFTER approved_by
rejection_reason TEXT NULL AFTER approved_at

-- NEW INDEX
INDEX idx_approval_status (approval_status)
```

### journal_reassignments Table (NEW)
```sql
CREATE TABLE journal_reassignments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  journal_id BIGINT UNSIGNED NOT NULL,
  from_user_id BIGINT UNSIGNED NULL,
  to_user_id BIGINT UNSIGNED NULL,
  reassigned_by BIGINT UNSIGNED NULL,
  reason TEXT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  CONSTRAINT fk_journal FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE,
  CONSTRAINT fk_from_user FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_to_user FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_reassigned_by FOREIGN KEY (reassigned_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_journal (journal_id),
  INDEX idx_from_user (from_user_id),
  INDEX idx_to_user (to_user_id),
  INDEX idx_reassigned_by (reassigned_by),
  INDEX idx_created_at (created_at)
);
```

---

## 🧪 Testing Checklist

### Migration Testing
- [x] Run `php artisan migrate` - All 3 migrations ran successfully
- [ ] Verify existing users have `approval_status = 'approved'`
- [ ] Verify existing journals have `approval_status = 'approved'`
- [ ] Test rollback: `php artisan migrate:rollback`
- [ ] Re-run migrations: `php artisan migrate`

### Model Testing
- [ ] User model relationships (approver)
- [ ] User model scopes (pendingApproval, approved, rejected)
- [ ] Journal model relationships (approver, reassignments)
- [ ] Journal model scopes (pendingApproval, approved, rejected)
- [ ] JournalReassignment model relationships (all 4)
- [ ] JournalReassignment model scopes

### Query Testing
```php
// Test user approval queries
$pending = User::pendingApproval()->forUniversity($uniId)->get();
$approved = User::approved()->forUniversity($uniId)->get();

// Test journal approval queries
$pendingJournals = Journal::pendingApproval()->forUniversity($uniId)->get();
$publicJournals = Journal::active()->get(); // Should include approval check

// Test reassignment queries
$history = JournalReassignment::forJournal($journalId)->latest()->get();
$recentReassignments = JournalReassignment::recent(30)->get();
```

---

## 🚀 Next Steps

### 1. Controller Implementation (HIGH PRIORITY)
Create approval controllers:
- `app/Http/Controllers/AdminKampus/UserApprovalController.php`
  - `index()` - List pending users
  - `approve($userId)` - Approve user registration
  - `reject($userId, $reason)` - Reject with reason

- `app/Http/Controllers/AdminKampus/JournalApprovalController.php`
  - `index()` - List pending journals
  - `approve($journalId)` - Approve journal submission
  - `reject($journalId, $reason)` - Reject with reason

- `app/Http/Controllers/AdminKampus/JournalController.php`
  - `reassign($journalId, $newUserId, $reason)` - Reassign journal manager

### 2. Policy Updates (HIGH PRIORITY)
Update authorization policies:
- `app/Policies/UserPolicy.php`
  - `approveUsers(User $user)` - Can view pending approvals?
  - `approve(User $user, User $targetUser)` - Can approve specific user?

- `app/Policies/JournalPolicy.php`
  - `approve(User $user, Journal $journal)` - Can approve journal?
  - `reassign(User $user, Journal $journal)` - Can reassign manager?

### 3. Frontend Pages (HIGH PRIORITY)
Create React/Inertia pages:
- `resources/js/pages/AdminKampus/Users/PendingApproval.tsx`
- `resources/js/pages/AdminKampus/Journals/PendingApproval.tsx`
- `resources/js/components/JournalReassignDialog.tsx`

### 4. Notification System (MEDIUM PRIORITY)
Create notification classes:
- `app/Notifications/UserApprovedNotification.php`
- `app/Notifications/UserRejectedNotification.php`
- `app/Notifications/JournalApprovedNotification.php`
- `app/Notifications/JournalRejectedNotification.php`
- `app/Notifications/JournalReassignedNotification.php`

### 5. Registration Form Update (HIGH PRIORITY)
Update registration form:
- Add university dropdown (seeded from database)
- Add role selection (User vs LPPM)
- Set `approval_status = 'pending'` on submit

### 6. Seeder Updates (MEDIUM PRIORITY)
Update seeders to set approval_status:
- `database/seeders/DatabaseSeeder.php`
- `database/seeders/UniversitySeeder.php`
- Set all seeded users/journals to 'approved'

### 7. Dashboard Updates (HIGH PRIORITY)
Update dashboards to show pending counts:
- LPPM dashboard: Pending users & journals count
- Dikti dashboard: Pending LPPM registrations count

---

## 📝 Notes & Considerations

### Design Decisions

1. **Default Status for Existing Data**: 
   - Users default to 'approved' to prevent login issues
   - Journals default to 'approved' to maintain visibility
   - Only NEW submissions start as 'pending'

2. **Foreign Key Strategy**:
   - `approved_by` uses SET NULL on delete (preserve audit trail)
   - Journal reassignments use CASCADE on journal delete (irrelevant if journal gone)
   - User reassignments use SET NULL on user delete (preserve history)

3. **Index Strategy**:
   - Only `approval_status` indexed (common filter in dashboards)
   - Other columns (approved_by, approved_at) not indexed initially
   - Can add indexes later if performance issues arise

4. **Scope Update Impact**:
   - `scopeActive()` now includes approval check
   - May affect existing queries that expect all active journals
   - Public-facing queries should use `active()` scope
   - Admin queries may need `->where('approval_status', '!=', 'rejected')` for flexibility

5. **No Approval History**:
   - Only stores current approval state (not full history)
   - If re-approval needed, overwrites previous approval data
   - Consider adding approval history table if needed later

---

## 🐛 Known Issues & Limitations

1. **Existing Controllers**: Need to update existing journal/user controllers to handle pending status
2. **Dashboard Queries**: Need to update dashboard statistics to filter by approval status
3. **Public Browse**: Need to ensure public journal lists only show approved journals
4. **Search Functionality**: Update search to filter by approval status appropriately
5. **Seeder Data**: Existing seeders need updating to set approval_status='approved'

---

## 📚 Related Documentation

- [MEETING_NOTES_08_FEB_2026.md](MEETING_NOTES_08_FEB_2026.md) - Requirements source
- [ERD Database.md](ERD Database.md) - Database schema documentation (needs update)
- [policy testing.md](policy testing.md) - Authorization testing guide

---

**Implementation Status**: ✅ Database layer complete  
**Next Priority**: Controllers & Policies  
**Target Launch**: Thursday, February 12, 2026  
**Days Remaining**: 4 days
