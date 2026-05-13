# Policy Testing Documentation

Dokumentasi untuk testing authorization policies menggunakan Laravel Tinker.

## 📋 Setup Data

Jalankan command berikut di Tinker untuk load test data:

```php
// Load test users
$superAdmin = \App\Models\User::with('role', 'university')
    ->where('email', 'superadmin@ajm.ac.id')->first();

$adminKampus = \App\Models\User::with('role', 'university')
    ->where('email', 'admin.uad@ajm.ac.id')->first();

$user = \App\Models\User::with('role', 'university')
    ->where('email', 'andi.prasetyo@uad.ac.id')->first();

$userAnotherCampus = \App\Models\User::with('role', 'university')
    ->where('email', 'eko.wijaya@umy.ac.id')->first();

// Load universities
$uad = \App\Models\University::where('code', 'UAD')->first();
$umy = \App\Models\University::where('code', 'UMY')->first();

// Load journals (if exist)
$journal = \App\Models\Journal::with('university', 'user')->first();

// Load assessments (if exist)
$assessment = \App\Models\JournalAssessment::with('journal')->first();
```

---

## 🏛️ UniversityPolicy Testing

### ✅ Super Admin Permissions

```php
// Create university
Gate::forUser($superAdmin)->allows('create', \App\Models\University::class); 
// Expected: true

// View all universities
Gate::forUser($superAdmin)->allows('viewAny', \App\Models\University::class);
// Expected: true

Gate::forUser($superAdmin)->allows('view', $uad);
// Expected: true

Gate::forUser($superAdmin)->allows('view', $umy);
// Expected: true

// Update any university
Gate::forUser($superAdmin)->allows('update', $uad);
// Expected: true

Gate::forUser($superAdmin)->allows('update', $umy);
// Expected: true

// Delete university (without journals)
Gate::forUser($superAdmin)->allows('delete', $uad);
// Expected: true
```

### 🎓 Admin Kampus Permissions

```php
// Cannot create university
Gate::forUser($adminKampus)->allows('create', \App\Models\University::class);
// Expected: false

// Can view their own university only
Gate::forUser($adminKampus)->allows('view', $uad);
// Expected: true (UAD adalah kampusnya)

Gate::forUser($adminKampus)->allows('view', $umy);
// Expected: false (UMY bukan kampusnya)

// Cannot update any university
Gate::forUser($adminKampus)->allows('update', $uad);
// Expected: false

// Cannot delete any university
Gate::forUser($adminKampus)->allows('delete', $uad);
// Expected: false
```

### 👤 User Permissions

```php
// Can view their own university
Gate::forUser($user)->allows('view', $uad);
// Expected: true (jika user dari UAD)

Gate::forUser($user)->allows('view', $umy);
// Expected: false (jika user bukan dari UMY)

// Cannot create, update, or delete universities
Gate::forUser($user)->allows('create', \App\Models\University::class);
// Expected: false
```

---

## 👥 UserPolicy Testing

### ✅ Super Admin Permissions

```php
// View any user
Gate::forUser($superAdmin)->allows('viewAny', \App\Models\User::class);
// Expected: true

Gate::forUser($superAdmin)->allows('view', $user);
// Expected: true

Gate::forUser($superAdmin)->allows('view', $userAnotherCampus);
// Expected: true

Gate::forUser($superAdmin)->allows('view', $adminKampus);
// Expected: true

// Create users
Gate::forUser($superAdmin)->allows('create', \App\Models\User::class);
// Expected: true

// Update any user
Gate::forUser($superAdmin)->allows('update', $user);
// Expected: true

Gate::forUser($superAdmin)->allows('update', $adminKampus);
// Expected: true

// Delete users (except Super Admin)
Gate::forUser($superAdmin)->allows('delete', $user);
// Expected: true

Gate::forUser($superAdmin)->allows('delete', $adminKampus);
// Expected: true

// Cannot delete themselves
Gate::forUser($superAdmin)->allows('delete', $superAdmin);
// Expected: false

// Can assign Admin Kampus and User roles
Gate::forUser($superAdmin)->allows('assign-role', 'Admin Kampus');
// Expected: true

Gate::forUser($superAdmin)->allows('assign-role', 'User');
// Expected: true

Gate::forUser($superAdmin)->allows('assign-role', 'Super Admin');
// Expected: false

// Can assign any university
Gate::forUser($superAdmin)->allows('assign-university', $uad->id);
// Expected: true

Gate::forUser($superAdmin)->allows('assign-university', $umy->id);
// Expected: true
```

### 🎓 Admin Kampus Permissions

```php
// View users list
Gate::forUser($adminKampus)->allows('viewAny', \App\Models\User::class);
// Expected: true

// View users from their university
Gate::forUser($adminKampus)->allows('view', $user);
// Expected: true (same university)

Gate::forUser($adminKampus)->allows('view', $userAnotherCampus);
// Expected: false (different university)

// Create users
Gate::forUser($adminKampus)->allows('create', \App\Models\User::class);
// Expected: true

// Update users from their university
Gate::forUser($adminKampus)->allows('update', $user);
// Expected: true (same university)

Gate::forUser($adminKampus)->allows('update', $userAnotherCampus);
// Expected: false (different university)

// Cannot update Super Admin
Gate::forUser($adminKampus)->allows('update', $superAdmin);
// Expected: false

// Delete users from their university
Gate::forUser($adminKampus)->allows('delete', $user);
// Expected: true (same university, user role)

Gate::forUser($adminKampus)->allows('delete', $userAnotherCampus);
// Expected: false (different university)

// Cannot delete themselves
Gate::forUser($adminKampus)->allows('delete', $adminKampus);
// Expected: false

// Can only assign 'User' role
Gate::forUser($adminKampus)->allows('assign-role', 'User');
// Expected: true

Gate::forUser($adminKampus)->allows('assign-role', 'Admin Kampus');
// Expected: false

Gate::forUser($adminKampus)->allows('assign-role', 'Super Admin');
// Expected: false

// Can only assign their own university
Gate::forUser($adminKampus)->allows('assign-university', $uad->id);
// Expected: true (if adminKampus from UAD)

Gate::forUser($adminKampus)->allows('assign-university', $umy->id);
// Expected: false
```

### 👤 User Permissions

```php
// Cannot view all users
Gate::forUser($user)->allows('viewAny', \App\Models\User::class);
// Expected: false

// Can view their own profile
Gate::forUser($user)->allows('view', $user);
// Expected: true

// Cannot view other users
Gate::forUser($user)->allows('view', $userAnotherCampus);
// Expected: false

// Cannot create users
Gate::forUser($user)->allows('create', \App\Models\User::class);
// Expected: false

// Can update their own profile
Gate::forUser($user)->allows('update', $user);
// Expected: true

// Cannot update other users
Gate::forUser($user)->allows('update', $userAnotherCampus);
// Expected: false

// Cannot delete any user (including themselves)
Gate::forUser($user)->allows('delete', $user);
// Expected: false
```

---

## 📚 JournalPolicy Testing

### ✅ Super Admin Permissions

```php
// View all journals
Gate::forUser($superAdmin)->allows('viewAny', \App\Models\Journal::class);
// Expected: true

Gate::forUser($superAdmin)->allows('view', $journal);
// Expected: true

// Create journals
Gate::forUser($superAdmin)->allows('create', \App\Models\Journal::class);
// Expected: true

// Update any journal
Gate::forUser($superAdmin)->allows('update', $journal);
// Expected: true

// Delete any journal
Gate::forUser($superAdmin)->allows('delete', $journal);
// Expected: true (unless has submitted assessment)
```

### 🎓 Admin Kampus Permissions

```php
// View journals from their university
Gate::forUser($adminKampus)->allows('view', $journal);
// Expected: true/false (depends on journal's university_id)

// Create journals
Gate::forUser($adminKampus)->allows('create', \App\Models\Journal::class);
// Expected: true

// Update journals from their university
Gate::forUser($adminKampus)->allows('update', $journal);
// Expected: true (if same university)

// Delete journals from their university
Gate::forUser($adminKampus)->allows('delete', $journal);
// Expected: true (if same university and no submitted assessment)
```

### 👤 User Permissions

```php
// View their own journals
Gate::forUser($user)->allows('view', $journal);
// Expected: true/false (depends on journal's user_id)

// Create journals
Gate::forUser($user)->allows('create', \App\Models\Journal::class);
// Expected: true

// Update their own journals
Gate::forUser($user)->allows('update', $journal);
// Expected: true (if journal belongs to user)

// Delete their own journals
Gate::forUser($user)->allows('delete', $journal);
// Expected: true (if journal belongs to user and no submitted assessment)
```

---

## 📝 JournalAssessmentPolicy Testing

### ✅ Super Admin Permissions

```php
// View all assessments
Gate::forUser($superAdmin)->allows('viewAny', \App\Models\JournalAssessment::class);
// Expected: true

Gate::forUser($superAdmin)->allows('view', $assessment);
// Expected: true

// Review any submitted assessment
Gate::forUser($superAdmin)->allows('review', $assessment);
// Expected: true (if status is 'submitted')

// Export any assessment
Gate::forUser($superAdmin)->allows('export', $assessment);
// Expected: true
```

### 🎓 Admin Kampus Permissions

```php
// View assessments from their university
Gate::forUser($adminKampus)->allows('view', $assessment);
// Expected: true (if assessment's journal is from their university)

// Cannot create assessments
Gate::forUser($adminKampus)->allows('create', \App\Models\JournalAssessment::class);
// Expected: false

// Review submitted assessments from their university
Gate::forUser($adminKampus)->allows('review', $assessment);
// Expected: true (if status='submitted' and same university)

// Cannot review draft assessments
// (create draft assessment first: $draftAssessment = JournalAssessment::where('status', 'draft')->first();)
Gate::forUser($adminKampus)->allows('review', $draftAssessment);
// Expected: false

// Export assessments from their university
Gate::forUser($adminKampus)->allows('export', $assessment);
// Expected: true (if same university)
```

### 👤 User Permissions

```php
// View their own assessments
Gate::forUser($user)->allows('view', $assessment);
// Expected: true (if assessment belongs to user's journal)

// Create assessments
Gate::forUser($user)->allows('create', \App\Models\JournalAssessment::class);
// Expected: true

// Update their own draft assessments
Gate::forUser($user)->allows('update', $assessment);
// Expected: true (if status='draft' and belongs to user)

// Cannot update submitted assessments
Gate::forUser($user)->allows('update', $submittedAssessment);
// Expected: false

// Delete their own draft assessments
Gate::forUser($user)->allows('delete', $assessment);
// Expected: true (if status='draft' and belongs to user)

// Cannot delete submitted assessments
Gate::forUser($user)->allows('delete', $submittedAssessment);
// Expected: false

// Submit their own draft assessments
Gate::forUser($user)->allows('submit', $assessment);
// Expected: true (if status='draft' and belongs to user)

// Cannot submit already submitted assessments
Gate::forUser($user)->allows('submit', $submittedAssessment);
// Expected: false

// Add responses to draft assessments
Gate::forUser($user)->allows('addResponse', $assessment);
// Expected: true (if status='draft' and belongs to user)

// Upload attachments to draft assessments
Gate::forUser($user)->allows('uploadAttachment', $assessment);
// Expected: true (if status='draft' and belongs to user)

// Export their own submitted assessments
Gate::forUser($user)->allows('export', $submittedAssessment);
// Expected: true (if belongs to user and status='submitted')
```

---

## 🧪 Helper Commands

### Check User Role

```php
$user->role->name;
// Output: 'Super Admin', 'Admin Kampus', or 'User'

$user->isSuperAdmin();
$user->isAdminKampus();
$user->isUser();
```

### Check User University

```php
$user->university_id;
$user->university->name;
```

### Check Journal Ownership

```php
$journal->user_id;
$journal->university_id;
$journal->user->name;
$journal->university->name;
```

### Check Assessment Status

```php
$assessment->status;
// Output: 'draft' or 'submitted'

$assessment->journal->user_id;
$assessment->user_id;
```

### Count Related Data

```php
// Check if university has journals
$uad->journals()->count();

// Check if journal has submitted assessments
$journal->assessments()->where('status', 'submitted')->count();
```

---

## 📊 Complete Test Suite

Jalankan semua tests sekaligus:

```php
// Copy-paste command ini ke Tinker untuk comprehensive test
php artisan test --filter=Policy
```

Atau jalankan test specific policy:

```php
php artisan test tests/Unit/Policies/UniversityPolicyTest.php
php artisan test tests/Unit/Policies/UserPolicyTest.php
php artisan test tests/Unit/Policies/JournalPolicyTest.php
php artisan test tests/Unit/Policies/JournalAssessmentPolicyTest.php
```

---

## ✅ Policy Testing Checklist

### UniversityPolicy:
- [x] Super Admin can CRUD all universities
- [x] Admin Kampus can only view their university
- [x] User can only view their university
- [x] Cannot delete university with journals

### UserPolicy:
- [x] Super Admin can CRUD all users
- [x] Admin Kampus can CRUD users in their university
- [x] Admin Kampus can only assign 'User' role
- [x] User can view/edit their own profile
- [x] Cannot delete yourself

### JournalPolicy:
- [x] Super Admin can CRUD all journals
- [x] Admin Kampus can CRUD journals in their university
- [x] User can CRUD their own journals
- [x] Cannot delete journal with submitted assessment

### JournalAssessmentPolicy:
- [x] User can create assessment for their journals
- [x] User can edit draft assessments
- [x] User cannot edit submitted assessments
- [x] Admin Kampus can review submitted assessments
- [x] User can submit draft assessments

---

## 🔧 Troubleshooting

### Policy tidak terdaftar

```php
// Clear cache
php artisan optimize:clear

// Re-register policies di AppServiceProvider
Gate::policy(\App\Models\User::class, \App\Policies\UserPolicy::class);
```

### Role name mismatch

```php
// Cek role names di database
DB::table('roles')->select('id', 'name')->get();

// Pastikan sesuai dengan yang di-check di Policy:
// 'Super Admin', 'Admin Kampus', 'User'
```

### Relasi tidak ter-load

```php
// Selalu eager load relasi yang dibutuhkan
$user = User::with('role', 'university')->find($id);
$journal = Journal::with('user', 'university', 'assessments')->find($id);
```