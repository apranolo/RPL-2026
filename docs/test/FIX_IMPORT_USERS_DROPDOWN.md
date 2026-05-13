# Fix: Users Dropdown Not Showing in Import Page

**Date**: February 7, 2026  
**Status**: ✅ FIXED

## Issue
Saat membuka halaman Import Jurnal (`/admin-kampus/journals/import/form`), dropdown "Pengelola Jurnal" tidak menampilkan daftar users meskipun sudah ada users yang sesuai di database.

## Root Cause
Mismatch antara relasi database yang digunakan:

### Problem:
1. **Di Database**:
   - Users disimpan dengan field `role_id` (one-to-one relationship ke table `roles`)
   - Table `user_roles` (many-to-many) **kosong** (tidak diisi oleh seeder)

2. **Di Controller** (`app/Http/Controllers/AdminKampus/JournalController.php`):
   ```php
   // ❌ BEFORE - mencari via many-to-many relationship
   $users = User::query()
       ->whereHas('roles', function ($query) {  // Query ini mencari di table user_roles
           $query->where('name', 'User');
       })
       ->where('university_id', $authUser->university_id)
       ->where('is_active', true)
       ->get();
   ```
   
   Query ini mencari di table `user_roles` yang **kosong**, sehingga tidak mengembalikan hasil apapun.

## Solution
Mengubah query di controller untuk menggunakan relasi `role_id` yang sudah ada di database:

```php
// ✅ AFTER - mencari via one-to-one relationship
$users = User::query()
    ->where('role_id', DB::table('roles')->where('name', Role::USER)->value('id'))
    ->where('university_id', $authUser->university_id)
    ->where('is_active', true)
    ->select('id', 'name', 'email')
    ->orderBy('name')
    ->get()
    ->map(fn ($user) => [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'label' => "{$user->name} ({$user->email})",
    ]);
```

### Changes Made:
1. **File**: `app/Http/Controllers/AdminKampus/JournalController.php`
   - Added import: `use App\Models\Role;`
   - Changed query from `->whereHas('roles', ...)` to `->where('role_id', ...)`
   - Query now correctly retrieves users with role "User" from the specified university

## Testing
- ✅ PHP syntax check: No errors
- ✅ File: `/admin-kampus/journals/import/form`
- Expected: Dropdown "Pengelola Jurnal" sekarang menampilkan daftar users dengan format "Name (email)"

## Related Notes
- Architecture menggunakan field `role_id` untuk primary role (one-to-one)
- Relasi `roles()` (many-to-many) ada untuk backward compatibility tetapi tidak digunakan dalam seeder
- Jika di masa depan ingin menggunakan many-to-many roles, seeder perlu diupdate untuk populate table `user_roles`

## Files Modified
- `app/Http/Controllers/AdminKampus/JournalController.php` (lines 8, 430-438)
