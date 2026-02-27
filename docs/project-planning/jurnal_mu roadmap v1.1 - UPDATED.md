# 🗓️ JurnalMu v1.1 Development Roadmap (EXPANDED SCOPE)

## 📋 Document Information

**Version:** 1.1 (Full Hierarchical Management)  
**Duration:** 17 weeks (Extended from 14 weeks)  
**Start Date:** 15 Januari 2026  
**Target Launch:** 14 Mei 2026  
**Team Size:** 1 Solo Developer  
**Last Updated:** January 15, 2026

**⚠️ SCOPE CHANGE**: Timeline extended by 3 weeks to accommodate full 4-level hierarchical borang management:
- Manajemen Template Borang Akreditasi
- Manajemen Unsur Evaluasi
- Manajemen Sub Unsur
- Manajemen Indikator Penilaian

---

## 🎯 Roadmap Overview

### **V1.1 Mission**
Transform JurnalMu from a static assessment platform into a **dynamic quality improvement ecosystem** with **full hierarchical accreditation structure**, coaching workflow, admin review layer, and dynamic configuration.

### **Strategic Themes**
1. **Hierarchical Configuration System** - 4-level accreditation structure management (NEW)
2. **Quality Improvement Workflow** - Close the feedback loop with coaching
3. **Admin Empowerment** - Enable configuration without developer dependency
4. **Structured Feedback** - Formalize review and coaching processes

---

## 📊 Sprint Structure

### **Timeline Summary**

```
Sprint 1: Assessment Review + Full Hierarchical Borang   [████████████░░░░░░░░] Weeks 1-7   (41% of timeline)
Sprint 2: Pembinaan Module Foundation                    [░░░░░░░░░░░░█████░░░] Weeks 8-12  (29% of timeline)
Sprint 3: Reviewer Management + Integration              [░░░░░░░░░░░░░░░░███░] Weeks 13-15 (18% of timeline)
Sprint 4: Data Master + Polish + Testing                 [░░░░░░░░░░░░░░░░░░██] Weeks 16-17 (12% of timeline)

Total: 17 weeks (85 working days, 5 days/week)
```

### **Critical Path**
```
Week 1-2: Assessment Review (FOUNDATION)
    ↓
Week 3-7: Hierarchical Borang Management (EXPANDED SCOPE - Blocks coaching workflow)
    ↓
Week 8-12: Pembinaan Module (DEPENDENT on assessment review)
    ↓
Week 13-15: Reviewer Management (DEPENDENT on coaching module)
    ↓
Week 16-17: Final Polish + Deployment
```

---

## 🏃 SPRINT 1: Assessment Review + Full Hierarchical Borang Management (7 Weeks)

### **Sprint Goal**
Enable Admin Kampus to review assessments AND Super Admin to manage full 4-level accreditation hierarchy (Template → Unsur → Sub Unsur → Indikator).

### **Why This First?**
- **Assessment Review** unblocks coaching workflow (assessments must be reviewed before coaching requests)
- **Hierarchical Borang** provides foundation for dynamic assessment configuration
- Both features enhance **existing v1.0 functionality** before adding new modules
- High stakeholder priority for accreditation template flexibility

---

### **Phase 1A: Assessment Review Implementation (Weeks 1-2)**

#### **Week 1: Assessment Review Backend (Days 1-5)**

**Focus**: Backend logic untuk admin review workflow

**Tasks**:

**Day 1: Planning & Database Review**
- [ ] Review `journal_assessments` table schema (verify admin_notes, reviewed_by, reviewed_at exist)
- [ ] Review `JournalAssessmentPolicy` for authorization patterns
- [ ] Design review page wireframe (low-fi sketch)
- [ ] Plan email notification templates

**Day 2: Routes & Controller Setup**
- [ ] Add routes to `routes/web.php`:
  ```php
  Route::prefix('admin-kampus')->middleware(['auth', 'role:Admin Kampus'])->group(function () {
      Route::get('/assessments/{id}/review', [AssessmentController::class, 'showReview'])->name('admin-kampus.assessments.review');
      Route::post('/assessments/{id}/approve', [AssessmentController::class, 'approve'])->name('admin-kampus.assessments.approve');
      Route::post('/assessments/{id}/request-revision', [AssessmentController::class, 'requestRevision'])->name('admin-kampus.assessments.request-revision');
  });
  ```
- [ ] Create/update `AdminKampus/AssessmentController.php` with method stubs

**Day 3: Controller Implementation**
- [ ] Implement `showReview($id)` method:
  - Fetch assessment with eager loading (`with(['journal', 'responses.indicator', 'attachments'])`)
  - Authorize with policy (`$this->authorize('review', $assessment)`)
  - Return Inertia::render('AdminKampus/Assessments/Review', [...])
- [ ] Implement `approve(Request $request, $id)` method:
  - Validate: admin_notes optional (max 5000 chars)
  - Update: status → 'reviewed', reviewed_by → auth()->id(), reviewed_at → now()
  - Queue notification job to user
  - Return redirect with success message

**Day 4: Request Revision Logic + Validation**
- [ ] Implement `requestRevision(Request $request, $id)` method:
  - Validate: admin_notes required (min 20 chars, max 5000 chars)
  - Update: status → 'draft', admin_notes saved
  - Queue notification job to user
  - Return redirect with success message
- [ ] Create Form Requests:
  - `ApproveAssessmentRequest`: admin_notes validation
  - `RequestRevisionRequest`: admin_notes required validation

**Day 5: Policy & Testing**
- [ ] Update `JournalAssessmentPolicy@review`:
  ```php
  public function review(User $user, JournalAssessment $assessment): bool {
      if ($user->isSuperAdmin()) return true;
      if ($user->isAdminKampus()) {
          return $user->university_id === $assessment->journal->university_id;
      }
      return false;
  }
  ```
- [ ] Write feature tests:
  - `AdminKampusCanReviewAssessment`
  - `AdminKampusCanApproveAssessment`
  - `AdminKampusCanRequestRevision`
  - `UserCannotReviewOwnAssessment`
  - `AdminKampusCannotReviewOtherUniversityAssessment`
- [ ] Run tests: `php artisan test --filter=Assessment`

**Week 1 Deliverable**: ✅ Backend API functional, tested, ready for frontend

---

#### **Week 2: Assessment Review Frontend + Polish (Days 6-10)**

**Focus**: React UI untuk review workflow

**Tasks**:

**Day 6: Create Review Page Structure**
- [ ] Create `resources/js/pages/AdminKampus/Assessments/Review.tsx`
- [ ] Fetch assessment data via props from Inertia
- [ ] Display assessment header:
  - Journal name, User name, Submitted date
  - Status badge (color-coded: submitted=blue, reviewed=green)
  - Back button to assessments list

**Day 7: Display Assessment Details**
- [ ] Create Accordion component untuk group responses by category
- [ ] Per indicator display:
  - Question text
  - User's response (text/number/file download)
  - Score (if applicable)
- [ ] Display total score and grade at top
- [ ] Download all attachments button

**Day 8: Review Form Implementation**
- [ ] Add rich text editor for admin notes:
  - Install TinyMCE atau Tiptap
  - Configure toolbar (basic formatting: bold, italic, lists, links)
  - Character counter (max 5000 chars)
- [ ] Add action buttons:
  - "Approve" button (green, outline)
  - "Request Revision" button (yellow, outline)
- [ ] Confirmation modal: "Are you sure you want to approve this assessment? This action cannot be undone."

**Day 9: Form Submission & Error Handling**
- [ ] Implement approve logic:
  - Use Inertia router.post() to submit
  - Loading state (disable buttons, show spinner)
  - Success: Toast notification + redirect to assessments list
  - Error: Display validation errors below form
- [ ] Implement request revision logic:
  - Validate admin_notes not empty
  - Similar submit logic as approve
- [ ] Test error scenarios: Empty notes, network timeout

**Day 10: User View Updates & Testing**
- [ ] Update `resources/js/pages/User/Assessments/Show.tsx`:
  - Display status badge prominently
  - If status='reviewed': Show admin notes section (read-only, styled as callout)
  - If status='draft': Show "Edit Assessment" button + admin notes (why revision requested)
- [ ] Add status filter to assessments list page:
  - Dropdown: All/Draft/Submitted/Reviewed
- [ ] End-to-end testing:
  - User submits → Admin reviews → Approve → User sees approved status
  - User submits → Admin requests revision → User edits → Resubmit → Admin approves
- [ ] Browser test (Dusk): Full workflow automation

**Week 2 Deliverable**: ✅ Full assessment review workflow functional

---

### **Phase 1B: Full Hierarchical Borang Management (Weeks 3-7)**

#### **Week 3: Database & Models Setup (Days 11-15)**

**Focus**: Create 3 new tables + update evaluation_indicators + models

**Tasks**:

**Day 11: Create Migrations for New Tables**
- [ ] Create `database/migrations/2026_01_27_create_accreditation_templates_table.php`:
  ```php
  Schema::create('accreditation_templates', function (Blueprint $table) {
      $table->id();
      $table->string('name')->unique();
      $table->text('description')->nullable();
      $table->string('version', 50)->nullable();
      $table->boolean('is_active')->default(true);
      $table->date('effective_date')->nullable();
      $table->timestamps();
      $table->softDeletes();
      $table->index('is_active');
      $table->index('effective_date');
  });
  ```
- [ ] Create `evaluation_categories` migration (see database schema in MVP doc)
- [ ] Create `evaluation_sub_categories` migration
- [ ] Run: `php artisan migrate`
- [ ] Verify foreign keys: `SHOW CREATE TABLE evaluation_categories;`

**Day 12: Alter evaluation_indicators Table**
- [ ] Create `2026_01_27_alter_evaluation_indicators_add_hierarchy.php`:
  ```php
  Schema::table('evaluation_indicators', function (Blueprint $table) {
      $table->foreignId('sub_category_id')->nullable()->after('id')->constrained('evaluation_sub_categories')->onDelete('set null');
      $table->string('code', 50)->nullable()->after('sub_category_id');
      $table->unsignedInteger('display_order')->default(0)->after('question');
      $table->boolean('is_required')->default(true)->after('display_order');
      $table->boolean('is_active')->default(true)->after('is_required');
      $table->index(['sub_category_id', 'display_order']);
      $table->index('is_active');
  });
  ```
- [ ] Run migration
- [ ] Verify: Existing data still accessible (category/sub_category columns preserved)

**Day 13: Create Eloquent Models**
- [ ] Create `app/Models/AccreditationTemplate.php`:
  ```php
  class AccreditationTemplate extends Model {
      use HasFactory, SoftDeletes;
      
      protected $fillable = ['name', 'description', 'version', 'is_active', 'effective_date'];
      protected $casts = ['is_active' => 'boolean', 'effective_date' => 'date'];
      
      public function categories() {
          return $this->hasMany(EvaluationCategory::class, 'template_id');
      }
  }
  ```
- [ ] Create `app/Models/EvaluationCategory.php` with relationships
- [ ] Create `app/Models/EvaluationSubCategory.php` with relationships
- [ ] Update `app/Models/EvaluationIndicator.php`:
  ```php
  public function subCategory() {
      return $this->belongsTo(EvaluationSubCategory::class, 'sub_category_id');
  }
  ```

**Day 14: Create Policies**
- [ ] Create `app/Policies/AccreditationTemplatePolicy.php`:
  ```php
  public function viewAny(User $user): bool {
      return $user->isSuperAdmin();
  }
  // All methods: Super Admin only
  ```
- [ ] Create `EvaluationCategoryPolicy`, `EvaluationSubCategoryPolicy`, `IndicatorPolicy` (all Super Admin only)
- [ ] Register policies in `AuthServiceProvider`
- [ ] Write policy tests in `tests/Feature/Policies/`

**Day 15: Seed Default Data & Migration Script**
- [ ] Create `database/seeders/AccreditationTemplateSeeder.php`:
  - Seed "BAN-PT 2024" template with is_active=true
- [ ] Create migration script to convert existing indicators:
  ```php
  // Extract unique categories → Create evaluation_categories
  $categories = EvaluationIndicator::select('category')->distinct()->get();
  // Extract unique sub_categories → Create evaluation_sub_categories
  // Link indicators to new sub_category_id
  ```
- [ ] Run seeders: `php artisan db:seed --class=AccreditationTemplateSeeder`
- [ ] Test: Query indicators with new relationships, verify backward compatibility

**Week 3 Deliverable**: ✅ Database schema complete, models & policies ready

---

#### **Week 4: Template Borang Management - Backend (Days 16-20)**

**Focus**: CRUD API untuk accreditation templates

**Tasks**:

**Day 16: Create Controller & Routes**
- [ ] Add routes:
  ```php
  Route::prefix('admin')->middleware(['auth', 'role:Super Admin'])->group(function () {
      Route::resource('accreditation-templates', AccreditationTemplateController::class);
      Route::post('accreditation-templates/{id}/clone', [AccreditationTemplateController::class, 'clone']);
      Route::patch('accreditation-templates/{id}/toggle-active', [AccreditationTemplateController::class, 'toggleActive']);
      Route::get('accreditation-templates/{id}/tree', [AccreditationTemplateController::class, 'tree']);
  });
  ```
- [ ] Create `app/Http/Controllers/Admin/AccreditationTemplateController.php` with method stubs

**Day 17: Implement CRUD Methods**
- [ ] `index()`: Paginate templates with counts (use `withCount(['categories', 'subCategories', 'indicators'])`)
- [ ] `store(StoreTemplateRequest $request)`: Create new template
- [ ] `show($id)`: Show template with basic info
- [ ] `update(UpdateTemplateRequest $request, $id)`: Update template details
- [ ] `destroy($id)`: Soft delete (validate: no active journals using this template)

**Day 18: Implement Clone Feature**
- [ ] `clone($id)` method:
  ```php
  DB::transaction(function () use ($template) {
      $newTemplate = $template->replicate();
      $newTemplate->name .= ' (Copy)';
      $newTemplate->save();
      
      foreach ($template->categories as $category) {
          $newCategory = $category->replicate();
          $newCategory->template_id = $newTemplate->id;
          $newCategory->save();
          
          foreach ($category->subCategories as $subCategory) {
              $newSubCategory = $subCategory->replicate();
              $newSubCategory->category_id = $newCategory->id;
              $newSubCategory->save();
              
              foreach ($subCategory->indicators as $indicator) {
                  $newIndicator = $indicator->replicate();
                  $newIndicator->sub_category_id = $newSubCategory->id;
                  $newIndicator->save();
              }
          }
      }
  });
  ```
- [ ] Test: Clone template, verify all nested records copied

**Day 19: Implement Toggle Active & Tree View**
- [ ] `toggleActive($id)`:
  - Validate: At least 1 template must remain active
  - If deactivating: Check journals using this template (show warning)
  - Toggle `is_active` field
- [ ] `tree($id)`:
  - Return nested structure using eager loading:
    ```php
    $template->load(['categories' => function ($query) {
        $query->orderBy('display_order')
             ->with(['subCategories' => function ($q) {
                 $q->orderBy('display_order')
                   ->with(['indicators' => function ($qi) {
                       $qi->orderBy('display_order');
                   }]);
             }]);
    }]);
    ```

**Day 20: Form Requests & Testing**
- [ ] Create `app/Http/Requests/StoreAccreditationTemplateRequest.php`:
  - name: required, unique, max 255
  - effective_date: date, after:today
- [ ] Create `UpdateAccreditationTemplateRequest`
- [ ] Write feature tests:
  - `SuperAdminCanCreateTemplate`
  - `SuperAdminCanCloneTemplate`
  - `SuperAdminCanToggleActive`
  - `TreeViewReturnsNestedStructure`
- [ ] Run: `php artisan test --filter=AccreditationTemplate`

**Week 4 Deliverable**: ✅ Template CRUD + clone + tree API functional

---

#### **Week 5: Unsur & Sub Unsur Management - Backend (Days 21-25)**

**Focus**: CRUD API untuk categories & sub_categories with reordering

**Tasks**:

**Day 21: Create Controllers**
- [ ] Create `app/Http/Controllers/Admin/EvaluationCategoryController.php`
- [ ] Create `app/Http/Controllers/Admin/EvaluationSubCategoryController.php`
- [ ] Add routes for both resources + reorder endpoint

**Day 22: Implement Category CRUD**
- [ ] `index()`: List categories for a template (filter by template_id)
- [ ] `store()`: Create category (template_id, code, name, weight, display_order)
- [ ] `update()`: Edit category details
- [ ] `destroy()`: Soft delete (validate: no active sub_categories)
- [ ] Create `StoreCategoryRequest`: code unique within template, weight max 100

**Day 23: Implement Reordering API**
- [ ] `POST /api/admin/evaluation-categories/reorder`:
  ```php
  public function reorder(Request $request) {
      $request->validate([
          'items' => 'required|array',
          'items.*.id' => 'required|exists:evaluation_categories,id',
          'items.*.display_order' => 'required|integer|min:0'
      ]);
      
      DB::transaction(function () use ($request) {
          foreach ($request->items as $item) {
              EvaluationCategory::where('id', $item['id'])
                  ->update(['display_order' => $item['display_order']]);
          }
      });
  }
  ```
- [ ] Test: Reorder categories, verify order persists

**Day 24: Implement Sub Category CRUD**
- [ ] `index()`: List sub_categories for a category (filter by category_id)
- [ ] `store()`: Create sub_category (category_id, code, name, display_order)
- [ ] `update()`: Edit sub_category + allow moving to different category:
  ```php
  // If category_id changed, show warning: "X indicators will be affected"
  ```
- [ ] `destroy()`: Soft delete (validate: no indicators attached)
- [ ] Create `StoreSubCategoryRequest`: code unique within category

**Day 25: Testing & Validation**
- [ ] Write feature tests for categories & sub_categories CRUD
- [ ] Test reordering logic (multiple categories, edge cases)
- [ ] Test deletion constraints (cannot delete if has children)
- [ ] Test moving sub_category between categories
- [ ] Run: `php artisan test --filter=EvaluationCategory`

**Week 5 Deliverable**: ✅ Category & Sub Category CRUD + reordering API functional

---

#### **Week 6: Indikator Management - Backend & Frontend Prep (Days 26-30)**

**Focus**: Enhanced CRUD untuk indicators with hierarchical context

**Tasks**:

**Day 26: Create/Update Indicator Controller**
- [ ] Create `app/Http/Controllers/Admin/IndicatorController.php` (or update if exists)
- [ ] `index()`: List indicators with filters (template_id, category_id, sub_category_id, is_active)
- [ ] `store()`: Create indicator (sub_category_id, code, question, response_type, is_required, is_active, display_order)
- [ ] `update()`: Edit indicator details
- [ ] `destroy()`: Soft delete (check if used in submitted assessments)

**Day 27: Implement Indicator Reordering**
- [ ] `POST /api/admin/evaluation-indicators/reorder`:
  - Similar logic to category reordering
  - Update `display_order` within sub_category
- [ ] Test: Reorder indicators, verify assessment form displays correct order

**Day 28: Add Audit Trail System**
- [ ] Create `app/Models/HierarchyAuditLog.php` (polymorphic model):
  ```php
  Schema::create('hierarchy_audit_logs', function (Blueprint $table) {
      $table->id();
      $table->morphs('auditable'); // auditable_type, auditable_id
      $table->string('action'); // created, updated, deleted
      $table->json('changes'); // Old vs new values
      $table->foreignId('user_id')->constrained();
      $table->timestamps();
  });
  ```
- [ ] Create Observer for Template, Category, SubCategory, Indicator models
- [ ] Store JSON diff of old vs new values in `changes` field

**Day 29: Create Tree View API Endpoint**
- [ ] Implement `GET /api/admin/accreditation-templates/{id}/tree` (if not done in Week 4)
- [ ] Optimize: Use eager loading to avoid N+1 queries
- [ ] Response format: Nested JSON with counts at each level
- [ ] Test performance: Query time < 500ms for 100+ indicators

**Day 30: Write Integration Tests**
- [ ] Test full hierarchy CRUD workflow (Template → Category → SubCategory → Indicator)
- [ ] Test data integrity (cascading deletes, orphan prevention)
- [ ] Test audit trail (verify logs created on all actions)
- [ ] Test tree view API (verify nested structure correct)
- [ ] Run: `php artisan test --filter=Hierarchy`

**Week 6 Deliverable**: ✅ Indicator CRUD + audit trail + tree API complete

---

#### **Week 7: Hierarchical Management - Frontend (Days 31-35)**

**Focus**: React UI untuk full hierarchy management with drag-and-drop

**Tasks**:

**Day 31: Create Template Management Pages**
- [ ] Create `resources/js/pages/Admin/BorangIndikator/Templates/Index.tsx`:
  - Table: List templates with status badge (Active/Inactive)
  - Columns: Name, Version, Effective Date, Counts (Unsur/Sub Unsur/Indikator), Actions
  - Actions: View Tree, Edit, Clone, Toggle Active, Delete
  - Create Template button (opens modal)
- [ ] Create `TemplateFormModal.tsx` component:
  - Fields: name, description, version, effective_date
  - Client-side validation + server-side error display

**Day 32: Create Tree View Component**
- [ ] Create `resources/js/pages/Admin/BorangIndikator/Templates/Tree.tsx`:
  - Use shadcn/ui Accordion or custom TreeView component
  - Display hierarchy: Template → Unsur → Sub Unsur → Indikator
  - Expandable/collapsible nodes
  - Per level: Show counts (e.g., "5 Unsur, 12 Sub Unsur, 45 Indikator")
  - Color-coded status: Active (green), Inactive (gray)
- [ ] Per node: Display edit/delete/add child icons
- [ ] Breadcrumb: Admin → Borang Indikator → [Template Name] → Tree View

**Day 33: Implement Drag-and-Drop Reordering**
- [ ] Install drag-and-drop library:
  ```bash
  npm install @dnd-kit/core @dnd-kit/sortable
  ```
- [ ] Enable DnD for Categories (reorder within template):
  ```tsx
  <SortableContext items={categories}>
      {categories.map(cat => <CategoryNode key={cat.id} {...cat} />)}
  </SortableContext>
  ```
- [ ] Enable DnD for Sub Categories (reorder within category)
- [ ] Enable DnD for Indicators (reorder within sub_category)
- [ ] On drop: Call reorder API, show optimistic update, rollback if fails

**Day 34: Create CRUD Modals for Each Level**
- [ ] Create `CategoryFormModal.tsx`:
  - Fields: code, name, description, weight
  - Dropdown: parent template (auto-filled if from tree view)
  - Validation: code unique, weight 0-100
- [ ] Create `SubCategoryFormModal.tsx`:
  - Fields: code, name, description
  - Dropdown: parent category (allow moving between categories with warning)
- [ ] Create `IndicatorFormModal.tsx`:
  - Fields: code, question (textarea), response_type (dropdown), is_required (checkbox), is_active (checkbox)
  - Dropdown: parent sub_category
  - Character counter for question (max 500 chars)

**Day 35: Polish & Browser Testing**
- [ ] Add confirmation dialogs:
  - "Delete Unsur? This will also delete X Sub Unsur and Y Indikator."
  - "Move Sub Unsur to different Unsur? X Indikator will be affected."
- [ ] Add loading states: Skeleton loaders during API calls
- [ ] Add success/error toasts for all actions
- [ ] Browser test (Dusk):
  - Create template → Add Unsur → Add Sub Unsur → Add Indikator
  - Reorder all levels with drag-and-drop
  - Clone template → Verify deep copy
  - Toggle active → Verify constraint
- [ ] UX review: Ensure intuitive navigation, clear labels, responsive design

**Week 7 Deliverable**: ✅ Full hierarchical management UI complete with drag-and-drop

---

### **Sprint 1 Final Deliverables**

✅ **Assessment Review Module**:
- Admin Kampus can review submitted assessments
- Add admin notes & change status (Approved/Needs Revision)
- User notifications via email/toast
- Timeline view of submission → review history

✅ **Full Hierarchical Borang Management**:
- **Template Borang Akreditasi** CRUD (clone, activate/deactivate)
- **Unsur Evaluasi** CRUD (with drag-and-drop reordering, weight management)
- **Sub Unsur** CRUD (can move between Unsur, nested display)
- **Indikator Penilaian** CRUD (linked to Sub Unsur, soft delete, ordering)
- **Tree View UI** untuk preview entire hierarchy with expandable nodes
- **Audit Trail** for all changes (user, timestamp, JSON diff)
- **Drag-and-Drop** reordering at all 3 levels (Categories, Sub Categories, Indicators)

✅ **Database**:
- 3 new tables: accreditation_templates, evaluation_categories, evaluation_sub_categories
- Updated evaluation_indicators with relational sub_category_id
- Migrations preserve backward compatibility (old category/sub_category columns retained)

✅ **Testing**:
- Policy tests for all 4 hierarchy levels (Super Admin only)
- Feature tests for CRUD + reordering + clone
- Browser tests for full UI workflow with drag-and-drop
- Performance tests for tree view queries

---

## 🏃 SPRINT 2: Pembinaan Module (5 Weeks)

**Duration**: Week 8-12 (6 Maret - 9 April 2026)  
**Goal**: Implement full coaching request → assignment → feedback workflow

### **Week 8: Pembinaan Module - Database & Backend Setup**

**Focus**: Create 3 new tables + controllers for coaching workflow

**Tasks**:

**Day 36-37: Database Migrations**
- [ ] Create `coaching_requests` table migration (see database schema in MVP doc)
- [ ] Create `coaching_assignments` table migration
- [ ] Create `coaching_feedback` table migration
- [ ] Run migrations: `php artisan migrate`
- [ ] Verify foreign keys and indexes

**Day 38-39: Create Models & Policies**
- [ ] Create `app/Models/CoachingRequest.php` with relationships:
  ```php
  belongsTo: journal, user
  hasMany: assignments
  ```
- [ ] Create `CoachingAssignment.php` and `CoachingFeedback.php` models
- [ ] Create policies: `CoachingRequestPolicy`, `CoachingAssignmentPolicy`, `CoachingFeedbackPolicy`
- [ ] Authorization rules:
  - User: Create request for own journals, view own requests
  - Admin Kampus: View/manage requests from their university
  - Reviewer: View assigned requests, provide feedback

**Day 40: Testing**
- [ ] Write model relationship tests
- [ ] Write policy tests for all 3 roles
- [ ] Run: `php artisan test --filter=Coaching`

---

### **Week 9: User Request Pembinaan - Backend & Frontend**

**Focus**: User can request coaching for reviewed journals

**Tasks**:

**Day 41-42: Backend Implementation**
- [ ] Create `User/CoachingRequestController.php`:
  - `index()`: List user's coaching requests
  - `create()`: Show request form
  - `store()`: Create new coaching request (validate: journal has reviewed assessment)
  - `show($id)`: View request detail with timeline
- [ ] Add routes to `routes/web.php`
- [ ] Create `StoreCoachingRequestRequest` validation

**Day 43-44: Frontend Implementation**
- [ ] Create `User/Pembinaan/Index.tsx`: Table of user's requests
- [ ] Create `User/Pembinaan/Create.tsx`: Request form with validation
- [ ] Create `User/Pembinaan/Show.tsx`: Request detail with timeline
- [ ] Add "Request Pembinaan" button to Journal detail page (show only if assessment reviewed)

**Day 45: Testing**
- [ ] End-to-end test: User submits coaching request
- [ ] Test validation: Cannot request if assessment not reviewed
- [ ] Browser test: Full request submission flow

**Week 9 Deliverable**: ✅ User coaching request feature functional

---

### **Week 10: Admin Kampus Manage Requests - Backend & Frontend**

**Focus**: Admin Kampus can view, filter, and assign requests to reviewers

**Tasks**:

**Day 46-47: Backend Implementation**
- [ ] Create `AdminKampus/CoachingRequestController.php`:
  - `index()`: List all requests from their university (with filters)
  - `show($id)`: View request detail with journal assessment link
  - `assign(Request $request, $id)`: Assign reviewer (create coaching_assignment)
  - `reassign()`: Change assigned reviewer
  - `unassign()`: Remove reviewer (status back to pending)

**Day 48-49: Frontend Implementation**
- [ ] Create `AdminKampus/Pembinaan/Index.tsx`: Table with filters (status, type, priority)
- [ ] Create `AdminKampus/Pembinaan/Show.tsx`: Request detail with assign button
- [ ] Create `AssignReviewerModal.tsx`: Dropdown of reviewers with expertise filter
- [ ] Add email notification queue jobs (on assign/reassign)

**Day 50: Testing**
- [ ] Test assign/reassign/unassign logic
- [ ] Test email notifications sent correctly
- [ ] Browser test: Full assign workflow

**Week 10 Deliverable**: ✅ Admin Kampus request management functional

---

### **Week 11: Reviewer Dashboard & Feedback - Backend & Frontend**

**Focus**: Reviewer can view assigned requests and submit feedback

**Tasks**:

**Day 51-52: Backend Implementation**
- [ ] Create `Reviewer/CoachingController.php`:
  - `dashboard()`: Show assigned requests grouped by status
  - `show($id)`: View assigned request with journal details
  - `startProgress($id)`: Mark request as "in_progress"
  - `submitFeedback(Request $request, $id)`: Create coaching_feedback record, mark completed

**Day 53-54: Frontend Implementation**
- [ ] Create `Reviewer/Dashboard.tsx`: List assigned requests
- [ ] Create `Reviewer/CoachingRequest/Show.tsx`: Request detail with feedback form
- [ ] Feedback form: Rich text editor, attachments upload, rating (1-5)
- [ ] Add "Mark as In Progress" button

**Day 55: Testing & Integration**
- [ ] Test full workflow: Request → Assign → In Progress → Submit Feedback → Completed
- [ ] Test User receives notification on feedback completion
- [ ] Browser test: Full reviewer workflow

**Week 11 Deliverable**: ✅ Reviewer feedback feature functional

---

### **Week 12: Pembinaan Module - Polish & Testing**

**Focus**: Integration testing, email templates, UI polish

**Tasks**:

**Day 56: Email Notifications**
- [ ] Create email templates:
  - `CoachingRequestCreated.php` (to Admin Kampus)
  - `ReviewerAssigned.php` (to User & Reviewer)
  - `FeedbackSubmitted.php` (to User)
- [ ] Test email sending (use Mailtrap for local testing)
- [ ] Configure queue worker for production

**Day 57: UI Polish**
- [ ] Add timeline component showing request status history
- [ ] Add priority badges with color coding (high=red, medium=yellow, low=gray)
- [ ] Add empty states: "No coaching requests yet"
- [ ] Responsive design testing (mobile/tablet)

**Day 58-59: Integration Testing**
- [ ] Write end-to-end tests for full coaching workflow (all 3 roles)
- [ ] Test edge cases: Multiple admins assigning concurrently, Reviewer unavailable
- [ ] Performance testing: Query optimization for dashboard (N+1 prevention)

**Day 60: Sprint Review & Documentation**
- [ ] Demo to stakeholders (if available)
- [ ] Update user documentation with coaching workflow guide
- [ ] Code review: Refactor any duplicate code, add inline comments

**Week 12 Deliverable**: ✅ Pembinaan module complete and polished

---

## 🏃 SPRINT 3: Reviewer Management (3 Weeks)

**Duration**: Week 13-15 (10 April - 30 April 2026)  
**Goal**: Build reviewer profile management & load balancing system

### **Week 13: Reviewer Management - Backend**

**Focus**: Alter users table, create reviewer CRUD API

**Tasks**:

**Day 61: Database Migration**
- [ ] Create migration to alter `users` table (add reviewer fields - see database schema)
- [ ] Run migration: `php artisan migrate`

**Day 62-63: Controller Implementation**
- [ ] Create `AdminKampus/ReviewerController.php`:
  - `index()`: List reviewers in their university (where is_reviewer=true)
  - `store()`: Toggle user to reviewer (set is_reviewer=true)
  - `update()`: Edit reviewer profile (expertise, max_assignments)
  - `destroy()`: Remove reviewer status (set is_reviewer=false)

**Day 64: Load Balancing Logic**
- [ ] Implement reviewer suggestion algorithm:
  ```php
  // In AssignReviewerModal API endpoint
  $suggestedReviewer = User::where('university_id', $universityId)
      ->where('is_reviewer', true)
      ->where('current_assignments', '<', DB::raw('max_assignments'))
      ->orderBy('current_assignments', 'asc')
      ->first();
  ```

**Day 65: Testing**
- [ ] Test reviewer CRUD operations
- [ ] Test load balancing algorithm (assign to lowest loaded reviewer)
- [ ] Test counter updates (current_assignments increment/decrement)

**Week 13 Deliverable**: ✅ Reviewer management backend functional

---

### **Week 14: Reviewer Management - Frontend**

**Focus**: UI untuk manage reviewer profiles & dashboard

**Tasks**:

**Day 66-67: Create Reviewer List Page**
- [ ] Create `AdminKampus/Reviewers/Index.tsx`:
  - Table: List reviewers with columns (Name, Expertise, Current Assignments, Max Assignments, Status)
  - Actions: Edit Profile, Remove Reviewer Status
  - "Add Reviewer" button (opens user dropdown to toggle is_reviewer)

**Day 68: Create Reviewer Profile Edit Modal**
- [ ] Create `EditReviewerModal.tsx`:
  - Fields: reviewer_expertise (multi-select of scientific fields), max_assignments (number input)
  - Validation: max_assignments min 1, max 20

**Day 69: Reviewer Analytics Dashboard**
- [ ] Create `AdminKampus/Reviewers/Analytics.tsx`:
  - Chart: Reviewer workload distribution (bar chart of current_assignments per reviewer)
  - Metrics: Average completion time, Total coaching sessions completed
  - Filter by date range

**Day 70: Testing & Polish**
- [ ] Browser test: Full reviewer management workflow
- [ ] Test analytics dashboard data accuracy
- [ ] UI polish: Responsive design, loading states

**Week 14 Deliverable**: ✅ Reviewer management UI complete

---

### **Week 15: Integration & Testing**

**Focus**: Integrate reviewer management with coaching module, comprehensive testing

**Tasks**:

**Day 71: Integration**
- [ ] Update AssignReviewerModal to show suggested reviewer (based on load balancing)
- [ ] Update coaching assignment logic to auto-increment `current_assignments` counter
- [ ] Update feedback completion logic to auto-decrement `current_assignments` counter

**Day 72-73: Comprehensive Testing**
- [ ] Test full workflow: Create reviewer → Assign to coaching → Submit feedback → Counter updated
- [ ] Test edge cases: Reviewer at max_assignments (should not be suggested)
- [ ] Test counter consistency (use database transactions)

**Day 74: Bug Fixes**
- [ ] Fix any issues found during testing
- [ ] Refactor code for maintainability

**Day 75: Sprint Review**
- [ ] Demo to stakeholders
- [ ] Update documentation

**Week 15 Deliverable**: ✅ Reviewer management fully integrated and tested

---

## 🏃 SPRINT 4: Data Master + Polish (2 Weeks)

**Duration**: Week 16-17 (1 Mei - 14 Mei 2026)  
**Goal**: Complete Data Master CRUD, comprehensive testing, and production deployment

### **Week 16: Data Master Management**

**Focus**: CRUD for universities & scientific fields

**Tasks**:

**Day 76-77: Universities Management**
- [ ] Enhance existing `Admin/UniversityController` (already exists in v1.0):
  - Add validation: Cannot delete university if has active users/journals
  - Add is_active toggle
  - Add bulk import from CSV (optional)

**Day 78-79: Scientific Fields Management**
- [ ] Create `Admin/ScientificFieldController.php`:
  - `index()`: List all fields with pagination
  - `store()`: Create new field
  - `update()`: Edit existing field
  - `destroy()`: Soft delete (validate: not used by journals)
- [ ] Create frontend pages: `Admin/DataMaster/ScientificFields/Index.tsx`

**Day 80: Testing**
- [ ] Test CRUD operations for both data masters
- [ ] Test deletion constraints
- [ ] Browser test: Full data master management workflow

**Week 16 Deliverable**: ✅ Data Master management complete

---

### **Week 17: Final Polish, Testing & Deployment**

**Focus**: Production deployment preparation

**Tasks**:

**Day 81: Code Quality & Documentation**
- [ ] Run Laravel Pint: `./vendor/bin/pint`
- [ ] Run ESLint: `npm run lint`
- [ ] Run TypeScript check: `npm run types`
- [ ] Update inline comments and documentation
- [ ] Update README with v1.1 features

**Day 82: Comprehensive Testing**
- [ ] Run full test suite: `php artisan test`
- [ ] Run browser tests: `php artisan dusk`
- [ ] Manual testing: Test all 5 features end-to-end
- [ ] Performance testing: Check page load times, optimize queries

**Day 83: Security & Accessibility Audit**
- [ ] Security audit: Check authorization on all endpoints
- [ ] Test CSRF protection
- [ ] Test XSS prevention (sanitize rich text editor output)
- [ ] Accessibility check: Keyboard navigation, screen reader support

**Day 84: Production Deployment Prep**
- [ ] Create database backup script
- [ ] Write deployment runbook (see Migration Strategy doc)
- [ ] Configure production environment variables
- [ ] Set up monitoring (error tracking, performance metrics)

**Day 85: Production Deployment**
- [ ] Deploy to production server
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Seed default data: `php artisan db:seed --class=AccreditationTemplateSeeder`
- [ ] Smoke test: Test critical paths (login, create journal, submit assessment, request coaching)
- [ ] Monitor logs for errors (24-hour watch period)

**Week 17 Deliverable**: ✅ **v1.1 PRODUCTION LAUNCH** 🎉

---

## 📊 Risk Management

### **High-Risk Items**

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| **Hierarchical Management Complexity** | Medium | High | Break into smaller tasks, write tests first (TDD), allocate extra buffer (Week 7) |
| **Drag-and-Drop Library Integration** | Low | Medium | Choose battle-tested library (dnd-kit), follow official examples, have fallback (manual reorder buttons) |
| **Performance Issues (Tree View)** | Medium | Medium | Use eager loading, index foreign keys, cache tree structure, test with 100+ indicators |
| **Reviewer Load Balancing Logic** | Low | Medium | Start simple (lowest current_assignments), use database transactions for counter updates |
| **Timeline Overrun** | Medium | High | Strict scope discipline, daily progress tracking, ready to cut low-priority polish items |

### **Mitigation: Weekly Checkpoints**

Every Friday (Days 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85):
- [ ] Review week's progress vs plan
- [ ] Identify blockers or delays
- [ ] Adjust next week's priorities if needed
- [ ] Update stakeholders on status

---

## 🎯 Success Criteria

### **Functional Completeness**
- [ ] All 5 features pass acceptance criteria (100% checklist completion)
- [ ] All API endpoints documented and tested
- [ ] All UI pages responsive and accessible

### **Code Quality**
- [ ] Test coverage > 80% (feature tests + browser tests)
- [ ] No lint errors (Pint + ESLint)
- [ ] No critical security vulnerabilities (authorization tested)

### **Performance**
- [ ] Tree view loads < 500ms for 100+ indicators
- [ ] Dashboard page load time < 2 seconds
- [ ] No N+1 query issues (Laravel Telescope verification)

### **Documentation**
- [ ] User manual updated with v1.1 features
- [ ] API documentation complete (Postman collection or OpenAPI spec)
- [ ] Deployment runbook tested with dry-run

---

## 📅 Milestones & Deadlines

| Milestone | Target Date | Dependencies | Status |
|-----------|-------------|--------------|--------|
| **Sprint 1 Complete** | 5 Maret 2026 | Assessment Review + Hierarchical Borang | ⏳ In Progress |
| **Sprint 2 Complete** | 9 April 2026 | Sprint 1 (coaching requires reviewed assessments) | 🔜 Not Started |
| **Sprint 3 Complete** | 30 April 2026 | Sprint 2 (reviewer management needs coaching module) | 🔜 Not Started |
| **Sprint 4 Complete** | 14 Mei 2026 | Sprint 3 (final polish) | 🔜 Not Started |
| **Production Launch** | 14 Mei 2026 | All sprints complete, stakeholder approval | 🎯 Target |

---

## 🚀 Post-Launch Plan (Week 18+)

### **Immediate (Week 18-19)**
- [ ] Monitor production logs for errors (24/7 for first week)
- [ ] Collect user feedback via surveys or interviews
- [ ] Fix critical bugs (P0/P1 priority)
- [ ] Gather feature requests for v1.2

### **Short-Term (Month 2-3)**
- [ ] Analyze coaching request patterns (most common types, success rates)
- [ ] Optimize slow queries based on production data
- [ ] Iterate on UI/UX based on user feedback
- [ ] Plan v1.2 features (see Out of Scope section)

---

## 📞 Communication Plan

### **Weekly Updates** (Every Monday)
- Send email to stakeholders with:
  - Last week's accomplishments
  - This week's goals
  - Blockers or risks
  - Screenshot/demo link of completed features

### **Sprint Reviews** (End of Each Sprint)
- Live demo of completed features (if stakeholders available)
- Gather feedback for polish items
- Adjust priorities for next sprint if needed

### **Daily Progress** (Internal)
- Track progress in TODO list or Trello board
- Update this roadmap document with ✅ checkmarks as tasks complete

---

## 🏆 Definition of Done (Roadmap-Level)

v1.1 is considered "Done" when:

- [x] All 85 days of tasks completed (or 90% with documented exceptions)
- [x] All 5 features pass acceptance criteria and stakeholder approval
- [x] Test coverage > 80% (feature + browser tests)
- [x] Code deployed to production and stable (no critical bugs for 1 week)
- [x] User documentation updated and published
- [x] Stakeholders trained on new features (if training required)
- [x] Post-launch monitoring plan in place

---

**Last Updated**: January 15, 2026  
**Next Review**: End of Sprint 1 (5 Maret 2026)  
**Timeline Status**: **EXTENDED** - 17 weeks (from 14 weeks) due to expanded hierarchical management scope

---

**Development Lead**: [Your Name]  
**Stakeholder Contact**: [Stakeholder Email]  
**Project Repository**: [GitHub Link]
