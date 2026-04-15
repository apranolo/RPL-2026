# 🎯 Assessment Features - Quick Reference Guide

## 📋 Overview
Fitur Assessment Phase 1 telah diimplementasikan dengan 2 komponen utama:
1. **Multiple Issues Tracking** - User dapat mencatat banyak masalah
2. **Save Draft Functionality** - User dapat menyimpan progress

---

## 🗃️ Database

### Table: `assessment_issues`
```sql
id                       BIGINT UNSIGNED PRIMARY KEY
journal_assessment_id    BIGINT UNSIGNED (FK to journal_assessments)
title                    VARCHAR(200)
description              TEXT
category                 ENUM('editorial', 'technical', 'content_quality', 'management')
priority                 ENUM('high', 'medium', 'low')
display_order            INT UNSIGNED DEFAULT 0
created_at              TIMESTAMP
updated_at              TIMESTAMP

Indexes:
- idx_assessment (journal_assessment_id)
- idx_priority (priority)
- idx_category (category)
```

---

## 🔌 Backend API

### Model: AssessmentIssue
**Location**: `app/Models/AssessmentIssue.php`

**Relationships**:
```php
$issue->assessment; // BelongsTo JournalAssessment
```

**Scopes**:
```php
AssessmentIssue::byPriority('high')->get();
AssessmentIssue::byCategory('editorial')->get();
AssessmentIssue::ordered()->get(); // Order by display_order, created_at
```

### Controller: AssessmentIssueController
**Location**: `app/Http/Controllers/User/AssessmentIssueController.php`

**Methods**:
- `store(Request, JournalAssessment)` - Create issue
- `update(Request, JournalAssessment, AssessmentIssue)` - Update issue
- `destroy(JournalAssessment, AssessmentIssue)` - Delete issue
- `reorder(Request, JournalAssessment)` - Reorder issues

**Authorization**: All methods use `$this->authorize('update', $assessment)`

### Controller: AssessmentController
**Location**: `app/Http/Controllers/User/AssessmentController.php`

**New Method**:
```php
saveDraft(Request $request, JournalAssessment $assessment)
```

**Validation**:
```php
$request->validate([
    'responses' => 'nullable|array',
    'responses.*.evaluation_indicator_id' => 'required|exists:evaluation_indicators,id',
    'issues' => 'nullable|array',
    'issues.*.title' => 'required|string|max:200',
    'issues.*.description' => 'required|string|max:1000',
    'issues.*.category' => 'required|in:editorial,technical,content_quality,management',
    'issues.*.priority' => 'required|in:high,medium,low',
]);
```

---

## 🎨 Frontend Components

### 1. IssueCard
**Location**: `resources/js/components/IssueCard.tsx`

**Usage**:
```tsx
<IssueCard
  issue={issue}
  readOnly={false}
  onEdit={() => handleEdit(issue)}
  onDelete={() => handleDelete(issue)}
/>
```

**Props**:
| Prop | Type | Required | Default |
|------|------|----------|---------|
| issue | AssessmentIssue | ✓ | - |
| readOnly | boolean | ✗ | false |
| onEdit | () => void | ✗ | undefined |
| onDelete | () => void | ✗ | undefined |

### 2. IssueFormDialog
**Location**: `resources/js/components/IssueFormDialog.tsx`

**Usage**:
```tsx
<IssueFormDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  onSave={handleSaveIssue}
  issue={editingIssue}
  mode="edit"
/>
```

**Props**:
| Prop | Type | Required | Default |
|------|------|----------|---------|
| open | boolean | ✓ | - |
| onOpenChange | (open: boolean) => void | ✓ | - |
| onSave | (issue) => void | ✓ | - |
| issue | AssessmentIssue \| null | ✗ | null |
| mode | 'create' \| 'edit' | ✗ | 'create' |

### 3. AssessmentIssueManager
**Location**: `resources/js/components/AssessmentIssueManager.tsx`

**Usage**:
```tsx
<AssessmentIssueManager
  issues={assessment.issues || []}
  onChange={setIssues}
  readOnly={false}
/>
```

**Props**:
| Prop | Type | Required | Default |
|------|------|----------|---------|
| issues | AssessmentIssue[] | ✓ | - |
| onChange | (issues) => void | ✓ | - |
| readOnly | boolean | ✗ | false |

---

## 🛣️ Routes

### User Routes
```php
// Save draft
POST /user/assessments/{assessment}/save-draft

// Issue CRUD
POST   /user/assessments/{assessment}/issues
PUT    /user/assessments/{assessment}/issues/{issue}
DELETE /user/assessments/{assessment}/issues/{issue}
POST   /user/assessments/{assessment}/issues/reorder
```

### Named Routes
```php
route('user.assessments.save-draft', $assessment->id)
route('user.assessments.issues.store', $assessment->id)
route('user.assessments.issues.update', [$assessment->id, $issue->id])
route('user.assessments.issues.destroy', [$assessment->id, $issue->id])
route('user.assessments.issues.reorder', $assessment->id)
```

---

## 📦 TypeScript Types

### AssessmentIssue Interface
**Location**: `resources/js/types/index.d.ts`

```typescript
export interface AssessmentIssue {
    id: number;
    journal_assessment_id: number;
    title: string;
    description: string;
    category: 'editorial' | 'technical' | 'content_quality' | 'management';
    priority: 'high' | 'medium' | 'low';
    display_order: number;
    created_at: string;
    updated_at: string;
}
```

### JournalAssessment Update
```typescript
export interface JournalAssessment {
    // ... existing fields
    issues?: AssessmentIssue[];
}
```

---

## 🎯 Common Use Cases

### 1. Display Issues in Assessment Form
```tsx
import AssessmentIssueManager from '@/components/AssessmentIssueManager';

const [issues, setIssues] = useState<AssessmentIssue[]>(assessment.issues || []);

<AssessmentIssueManager
  issues={issues}
  onChange={setIssues}
  readOnly={assessment.status !== 'draft'}
/>
```

### 2. Save Draft with Issues
```tsx
const handleSaveDraft = () => {
  router.post(
    route('user.assessments.save-draft', assessment.id),
    {
      responses: formData.responses,
      issues: issues,
    },
    {
      preserveScroll: true,
      onSuccess: () => {
        console.log('Draft saved');
      },
    }
  );
};
```

### 3. Display Issues in Review Mode
```tsx
// For Admin/Reviewer
<AssessmentIssueManager
  issues={assessment.issues || []}
  onChange={() => {}} // No-op
  readOnly={true}
/>
```

### 4. Eager Load Issues in Controller
```php
$assessment->load(['issues']);

return Inertia::render('Page', [
    'assessment' => $assessment,
]);
```

---

## 🔒 Authorization

**Policy**: `JournalAssessmentPolicy@update`

**Rules**:
- User can only edit their own assessments
- Only assessments with `status = 'draft'` can be edited
- Issues can only be managed on draft assessments

**Enforcement**:
```php
// In controller
$this->authorize('update', $assessment);

if ($assessment->status !== 'draft') {
    return back()->with('error', 'Cannot modify submitted assessment');
}
```

---

## 🎨 Category & Priority Configs

### Category Colors
```tsx
editorial:       blue  (bg-blue-100 text-blue-800)
technical:       purple (bg-purple-100 text-purple-800)
content_quality: green (bg-green-100 text-green-800)
management:      orange (bg-orange-100 text-orange-800)
```

### Priority Colors & Icons
```tsx
high:   red     (AlertCircle icon)
medium: yellow  (AlertTriangle icon)
low:    gray    (Info icon)
```

---

## 🧪 Testing Commands

### Run Migration
```bash
php artisan migrate
```

### Rollback Migration
```bash
php artisan migrate:rollback --step=1
```

### Build Frontend
```bash
npm run build
```

### Dev Mode (Hot Reload)
```bash
npm run dev
```

---

## 📝 Sample Data

### Create Issue via Tinker
```php
php artisan tinker

$assessment = JournalAssessment::find(1);
$assessment->issues()->create([
    'title' => 'Missing editorial board',
    'description' => 'Editorial board information is not available on the website',
    'category' => 'editorial',
    'priority' => 'high',
    'display_order' => 0,
]);
```

### Query Issues
```php
// Get all issues for assessment
$issues = JournalAssessment::find(1)->issues;

// Get high priority issues
$highPriority = AssessmentIssue::byPriority('high')->get();

// Get editorial issues
$editorial = AssessmentIssue::byCategory('editorial')->get();
```

---

## 🔍 Debugging

### Check Issues Loaded
```php
// In controller
dd($assessment->issues);
```

### Frontend Console
```tsx
console.log('Issues:', assessment.issues);
```

### Inspect Network Request
```
// Chrome DevTools -> Network
POST /user/assessments/1/save-draft
Payload: { responses: {...}, issues: [...] }
```

---

## 📚 Related Documentation

- [ASSESSMENT_IMPLEMENTATION_PLAN.md](ASSESSMENT_IMPLEMENTATION_PLAN.md) - Full implementation plan
- [ASSESSMENT_PHASE1_COMPLETED.md](ASSESSMENT_PHASE1_COMPLETED.md) - Implementation summary
- [MEETING_NOTES_30_JAN_2026.md](MEETING_NOTES_30_JAN_2026.md) - Original requirements

---

**Last Updated**: 2 Februari 2026  
**Status**: Production Ready ✅
