# Pembinaan System - Quick Reference Guide

## Overview
The Pembinaan (Coaching/Training) system allows:
- **Super Admin**: Create/manage training programs
- **Admin Kampus**: Review registrations, assign reviewers
- **Users**: Register journals to programs
- **Reviewers**: Submit feedback and scores

## System Architecture

```
┌─────────────────┐
│  Super Admin    │ Creates Programs
│  (Admin Panel)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│   Pembinaan     │◄────│ Accreditation    │
│   Programs      │     │ Templates        │
└────────┬────────┘     └──────────────────┘
         │
         │ Register
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Registrations  │─────│   Attachments    │
│  (Journals)     │     │   (PDF/Images)   │
└────────┬────────┘     └──────────────────┘
         │
         │ Approve/Reject
         ▼
┌─────────────────┐
│ Admin Kampus    │
│ (Approval)      │
└────────┬────────┘
         │
         │ Assign
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Reviewer       │────►│   Reviews        │
│  Assignments    │     │   (Score+Notes)  │
└─────────────────┘     └──────────────────┘
```

## Database Tables

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `pembinaan` | Training programs | category, status, dates, quota |
| `pembinaan_registrations` | Journal enrollments | status, reviewed_at, reviewed_by |
| `pembinaan_registration_attachments` | Uploaded documents | file_path, document_type |
| `pembinaan_reviews` | Reviewer feedback | score, feedback, recommendation |
| `reviewer_assignments` | Reviewer-to-registration | status (assigned/in_progress/completed) |

## User Workflow

### Super Admin: Create Program
1. Navigate to `/admin/pembinaan`
2. Click "Create Program"
3. Fill form:
   - Name, Description
   - Category (Akreditasi/Indeksasi)
   - Accreditation Template (optional)
   - Registration Period (start/end)
   - Assessment Period (start/end)
   - Quota (optional)
4. Status defaults to "draft"
5. Toggle status: draft → active → closed

### User: Register Journal
1. Navigate to `/user/pembinaan`
2. Browse "Available Programs" (active + registration open)
3. Click program → "Register"
4. Select journal from dropdown
5. Upload documents:
   - ISSN Certificate (required)
   - Journal Cover (required)
   - Previous Accreditation (if applicable)
6. Submit (status = pending)
7. View registration status in "My Registrations" tab

### Admin Kampus: Approve Registration
1. Navigate to `/admin-kampus/pembinaan`
2. Filter by status/pembinaan
3. Click registration → View details
4. Review attachments
5. Actions:
   - **Approve**: Sets status=approved, reviewed_at=now()
   - **Reject**: Requires rejection reason
   - **Assign Reviewer**: Select from university reviewers

### Reviewer: Submit Review
1. Navigate to `/reviewer/assignments`
2. Click assignment → View registration
3. Download/review attachments
4. Click "Submit Review"
5. Fill form:
   - Score (0-100)
   - Feedback (required)
   - Recommendation (optional)
6. Submit → Assignment marked completed

## API Endpoints

### Admin Routes
```php
GET    /admin/pembinaan                          # List programs
GET    /admin/pembinaan/create                   # Create form
POST   /admin/pembinaan                          # Store program
GET    /admin/pembinaan/{id}                     # Show program
GET    /admin/pembinaan/{id}/edit                # Edit form
PUT    /admin/pembinaan/{id}                     # Update program
DELETE /admin/pembinaan/{id}                     # Delete program
POST   /admin/pembinaan/{id}/toggle-status       # Change status
```

### Admin Kampus Routes
```php
GET    /admin-kampus/pembinaan                   # List registrations
GET    /admin-kampus/pembinaan/registrations/{id}    # Show registration
POST   /admin-kampus/pembinaan/registrations/{id}/approve    # Approve
POST   /admin-kampus/pembinaan/registrations/{id}/reject     # Reject
POST   /admin-kampus/pembinaan/registrations/{id}/assign-reviewer    # Assign
DELETE /admin-kampus/pembinaan/assignments/{id}    # Remove assignment
GET    /admin-kampus/pembinaan/reviewers         # Get reviewers JSON
```

### User Routes
```php
GET    /user/pembinaan                           # Index (available + my registrations)
GET    /user/pembinaan/programs/{id}             # Show program
GET    /user/pembinaan/programs/{id}/register    # Register form
POST   /user/pembinaan/programs/{id}/register    # Submit registration
GET    /user/pembinaan/registrations/{id}        # View registration
DELETE /user/pembinaan/registrations/{id}        # Cancel registration
POST   /user/pembinaan/registrations/{id}/upload    # Upload attachment
GET    /user/pembinaan/attachments/{id}          # Download attachment
```

### Reviewer Routes
```php
GET    /reviewer/assignments                     # List assignments
GET    /reviewer/assignments/{id}                # Show assignment
GET    /reviewer/assignments/{id}/review         # Review form
POST   /reviewer/assignments/{id}/review         # Submit review
GET    /reviewer/assignments/{id}/attachments/{id}    # Download attachment
```

## Authorization Matrix

| Action | Super Admin | Admin Kampus | User | Reviewer |
|--------|-------------|--------------|------|----------|
| Create program | ✅ | ❌ | ❌ | ❌ |
| Edit program | ✅ | ❌ | ❌ | ❌ |
| Toggle status | ✅ | ❌ | ❌ | ❌ |
| View all registrations | ✅ | ✅ (university) | ❌ | ❌ |
| Approve/reject | ✅ | ✅ (university) | ❌ | ❌ |
| Assign reviewer | ✅ | ✅ (university) | ❌ | ❌ |
| Register journal | ❌ | ❌ | ✅ (own journals) | ❌ |
| View own registrations | ❌ | ❌ | ✅ | ❌ |
| Submit review | ❌ | ❌ | ❌ | ✅ (assigned only) |

## Code Examples

### Check if Program Registration Open
```php
$pembinaan = Pembinaan::find($id);

if ($pembinaan->isRegistrationOpen()) {
    // Registration period is active
}

if ($pembinaan->isQuotaFull()) {
    // No more slots available
}
```

### Query Available Programs
```php
$programs = Pembinaan::active()
    ->open()
    ->withCount(['registrations', 'approvedRegistrations'])
    ->get();
```

### Get Registrations for Admin Kampus
```php
$registrations = PembinaanRegistration::forUniversity($user->university_id)
    ->pending()
    ->with(['pembinaan', 'journal', 'user'])
    ->paginate(15);
```

### Approve Registration
```php
$registration->update([
    'status' => 'approved',
    'reviewed_at' => now(),
    'reviewed_by' => auth()->id(),
]);
```

### Assign Reviewer
```php
ReviewerAssignment::create([
    'reviewer_id' => $reviewerId,
    'registration_id' => $registration->id,
    'assigned_by' => auth()->id(),
    'status' => 'assigned',
]);
```

### Submit Review
```php
PembinaanReview::create([
    'registration_id' => $registration->id,
    'reviewer_id' => auth()->id(),
    'score' => $validated['score'],
    'feedback' => $validated['feedback'],
    'recommendation' => $validated['recommendation'],
]);

// Mark assignment as completed
$assignment->markCompleted();
```

## File Upload Configuration

- **Directory**: `storage/app/public/pembinaan_attachments/`
- **Allowed Types**: pdf, jpg, jpeg, png
- **Max Size**: 5MB (5120 KB)
- **Naming**: `{timestamp}_{original_filename}`

### Storage Setup
```bash
# Create symlink (if not exists)
php artisan storage:link
```

### Access Files
- Private: via controller download method
- URL pattern: `/user/pembinaan/attachments/{id}`

## Model Scopes Reference

### Pembinaan Scopes
```php
Pembinaan::active()         // status = 'active'
Pembinaan::draft()          // status = 'draft'
Pembinaan::closed()         // status = 'closed'
Pembinaan::byCategory('akreditasi')  // filter by category
Pembinaan::open()           // registration period is active
Pembinaan::upcoming()       // registration_start in future
```

### PembinaanRegistration Scopes
```php
PembinaanRegistration::pending()              // status = 'pending'
PembinaanRegistration::approved()             // status = 'approved'
PembinaanRegistration::rejected()             // status = 'rejected'
PembinaanRegistration::forUser($userId)       // user_id = $userId
PembinaanRegistration::forUniversity($uniId)  // via journal->university_id
PembinaanRegistration::forPembinaan($id)      // pembinaan_id = $id
```

### ReviewerAssignment Scopes
```php
ReviewerAssignment::assigned()                // status = 'assigned'
ReviewerAssignment::inProgress()              // status = 'in_progress'
ReviewerAssignment::completed()               // status = 'completed'
ReviewerAssignment::forReviewer($userId)      // reviewer_id = $userId
ReviewerAssignment::forRegistration($id)      // registration_id = $id
```

## Status Flow Diagrams

### Program Status Flow
```
┌───────┐   Toggle   ┌────────┐   Toggle   ┌────────┐
│ Draft ├──────────► │ Active ├──────────► │ Closed │
└───────┘            └────────┘            └────────┘
```

### Registration Status Flow
```
┌─────────┐   Approve   ┌──────────┐
│ Pending ├────────────►│ Approved │
└────┬────┘             └──────────┘
     │
     │ Reject
     ▼
┌──────────┐
│ Rejected │
└──────────┘
```

### Assignment Status Flow
```
┌──────────┐   Start Review   ┌─────────────┐   Submit   ┌───────────┐
│ Assigned ├────────────────► │ In Progress ├───────────►│ Completed │
└──────────┘                  └─────────────┘            └───────────┘
```

## Testing Checklist

### Unit Tests
- [ ] Pembinaan model scopes
- [ ] PembinaanRegistration model scopes
- [ ] ReviewerAssignment status transitions
- [ ] File attachment helpers

### Feature Tests
- [ ] Admin creates program
- [ ] Admin toggles status
- [ ] User registers journal
- [ ] User uploads attachments
- [ ] Admin Kampus approves registration
- [ ] Admin Kampus rejects registration
- [ ] Admin Kampus assigns reviewer
- [ ] Reviewer submits review

### Policy Tests
- [ ] PembinaanPolicy authorization rules
- [ ] PembinaanRegistrationPolicy authorization rules
- [ ] ReviewerAssignmentPolicy authorization rules
- [ ] PembinaanReviewPolicy authorization rules

### Browser Tests (Dusk)
- [ ] Full registration workflow
- [ ] Approval workflow
- [ ] Review submission workflow

## Troubleshooting

### Common Issues

**Issue**: "Cannot delete pembinaan with approved registrations"
- **Solution**: Check `$pembinaan->canBeDeleted()` returns false if approved registrations exist

**Issue**: "File not found" when downloading attachment
- **Solution**: Verify storage symlink exists (`php artisan storage:link`)

**Issue**: "Unauthorized" when accessing routes
- **Solution**: Check user role and policy methods, verify middleware applied

**Issue**: "Duplicate reviewer assignment"
- **Solution**: Policy prevents duplicates via `ReviewerAssignmentPolicy@assign()`

**Issue**: "Registration not allowed"
- **Solution**: Check:
  1. Program is active
  2. Registration period is open
  3. Quota not exceeded
  4. Journal not already registered

## Migration Commands

```bash
# Run migrations
php artisan migrate

# Fresh install with seeders
php artisan migrate:fresh --seed

# Rollback pembinaan migrations
php artisan migrate:rollback --step=5
```

## Seeder Data (To Be Created)

1. **Sample Programs**:
   - Akreditasi SINTA 1-6
   - Indeksasi Scopus/WoS

2. **Sample Registrations**:
   - Pending (awaiting approval)
   - Approved (awaiting review)
   - Rejected (with reasons)

3. **Sample Reviewers**:
   - Users with Reviewer role
   - From different universities

4. **Sample Reviews**:
   - With various scores (60-95)
   - With detailed feedback

---

**Last Updated**: January 27, 2026  
**Version**: v1.1  
**Status**: Backend Complete, Frontend Pending
