# Role Constants Usage Guide

## Overview

Role names are now defined as constants to prevent maintenance issues from typos and ensure consistency across the application. This refactoring addresses the risk of silent failures when role names change or contain typos.

## Backend (PHP)

### Role Constants Location

Role constants are defined in the `Role` model:

```php
// app/Models/Role.php
class Role extends Model
{
    public const SUPER_ADMIN = 'Super Admin';
    public const ADMIN_KAMPUS = 'Admin Kampus';
    public const USER = 'User';
    
    // ... rest of the model
}
```

### Usage in PHP Code

**✅ DO: Use Role constants**

```php
use App\Models\Role;

// In queries
$superAdmins = User::byRole(Role::SUPER_ADMIN)->get();

// In comparisons
if ($user->role->name === Role::SUPER_ADMIN) {
    // Super Admin logic
}

// In middleware (routes)
Route::middleware(['role:' . Role::SUPER_ADMIN])->group(function () {
    // Protected routes
});

// In seeders
'role_id' => DB::table('roles')->where('name', Role::SUPER_ADMIN)->value('id')
```

**❌ DON'T: Use hardcoded strings**

```php
// Bad - typo risk, no IDE autocomplete
if ($user->role->name === 'Super Admin') { }

// Bad - inconsistent casing
if ($user->role->name === 'super_admin') { }
```

### Helper Methods

The `User` model provides convenient helper methods:

```php
// Check user roles
if ($user->isSuperAdmin()) { }
if ($user->isAdminKampus()) { }
if ($user->isUser()) { }

// The Role model also has these methods
if ($role->isSuperAdmin()) { }
```

These methods internally use the Role constants, so they're always consistent.

## Frontend (TypeScript/React)

### Role Constants Location

Role constants are defined in a TypeScript module:

```typescript
// resources/js/constants/roles.ts
export const ROLE_NAMES = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN_KAMPUS: 'Admin Kampus',
    USER: 'User',
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];
```

### Usage in TypeScript/React Code

**✅ DO: Use ROLE_NAMES constants**

```tsx
import { ROLE_NAMES } from '@/constants/roles';

// In components
if (user.role?.name === ROLE_NAMES.SUPER_ADMIN) {
    // Super Admin UI
}

// In navigation logic
const isSuperAdmin = user.role?.name === ROLE_NAMES.SUPER_ADMIN;
const isAdminKampus = user.role?.name === ROLE_NAMES.ADMIN_KAMPUS;
const isUser = user.role?.name === ROLE_NAMES.USER;
```

**❌ DON'T: Use hardcoded strings**

```tsx
// Bad - no type safety, typo risk
if (user.role?.name === 'Super Admin') { }

// Bad - will fail silently if name changes
if (user.role?.name === 'super_admin') { }
```

### Type Safety

The `RoleName` type provides compile-time type checking:

```typescript
import { type RoleName } from '@/constants/roles';

// Function parameter with type safety
function checkRole(roleName: RoleName) {
    // Only valid role names are accepted
}
```

## Migration Path

If you need to change a role name in the future:

1. **Update the database** via migration:
   ```php
   DB::table('roles')->where('name', 'Old Name')->update(['name' => 'New Name']);
   ```

2. **Update the constant** in `app/Models/Role.php`:
   ```php
   public const ROLE_NAME = 'New Name';
   ```

3. **Update the frontend constant** in `resources/js/constants/roles.ts`:
   ```typescript
   ROLE_NAME: 'New Name',
   ```

4. **No other code changes needed!** All references use the constants automatically.

## Files Updated

### Backend (PHP)
- ✅ `app/Models/Role.php` - Constants defined, helper methods updated
- ✅ `app/Models/User.php` - Helper methods and scopes updated
- ✅ `routes/web.php` - Middleware role checks updated
- ✅ `database/seeders/RoleSeeder.php` - Seeder updated
- ✅ `database/seeders/UserSeeder.php` - Seeder updated

### Frontend (TypeScript/React)
- ✅ `resources/js/constants/roles.ts` - New constants file created
- ✅ `resources/js/components/app-sidebar.tsx` - Updated to use constants

### Files NOT Updated (Should be updated when touched)
Test files still use hardcoded strings. Update them as needed when writing new tests or fixing existing ones:
- `tests/Browser/*.php`
- `tests/Feature/*.php`

## Testing

After this refactoring:

1. **Run migrations**: `php artisan migrate:fresh --seed`
2. **Run tests**: `php artisan test`
3. **Check frontend**: `npm run dev` and test navigation
4. **Verify roles**: Log in as different roles and ensure access control works

## Benefits

1. **Type Safety**: IDE autocomplete and compile-time checking
2. **Refactoring Safety**: Change role names in one place
3. **No Silent Failures**: Typos cause immediate errors, not runtime bugs
4. **Consistency**: Same values across backend and frontend
5. **Documentation**: Constants serve as documentation of available roles
6. **Searchability**: Find all role usages with "Find References"

## Questions?

If you need to add a new role:

1. Create a migration to add it to the database
2. Add a constant to `Role.php` (backend)
3. Add a constant to `roles.ts` (frontend)
4. Add helper methods if needed (`isNewRole()`)
5. Update routes and policies as appropriate
