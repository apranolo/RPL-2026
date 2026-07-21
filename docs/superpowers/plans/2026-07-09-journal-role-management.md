# Journal Role Management (RBAC) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement database migration, Eloquent models, relations, RoleMiddleware, UserRoleController, and React Index.tsx view for journal-specific roles (OJS-based).

**Architecture:** Extend the existing `user_roles` pivot table to support contextual journal roles by adding nullable `id_journal`, `role_name`, and `status` columns. Implement contextual role checks in `RoleMiddleware` using new model helper methods.

**Tech Stack:** Laravel, PHP, PHPUnit, Inertia.js, React, TypeScript, Tailwind CSS, shadcn/ui.

---

### Task 1: Database Migration

**Files:**
- Create: `database/migrations/2026_07_09_000000_add_journal_fields_to_user_roles_table.php`

- [ ] **Step 1: Create migration file**

Write migration code in `database/migrations/2026_07_09_000000_add_journal_fields_to_user_roles_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_roles', function (Blueprint $table) {
            // 1. Drop existing unique index unique_user_role or the default name user_roles_user_id_role_id_unique
            // Note: The unique index on user_roles was defined as $table->unique(['user_id', 'role_id']);
            // The default index name is 'user_roles_user_id_role_id_unique'.
            $table->dropUnique('user_roles_user_id_role_id_unique');

            // 2. Make role_id nullable
            $table->unsignedBigInteger('role_id')->nullable()->change();

            // 3. Add new columns
            $table->foreignId('id_journal')->nullable()->after('role_id')->constrained('journals')->nullOnDelete();
            $table->string('role_name')->nullable()->after('id_journal');
            $table->string('status')->default('Active')->after('role_name');

            // 4. Create new unique index
            $table->unique(['user_id', 'role_name', 'id_journal'], 'user_journal_role_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_roles', function (Blueprint $table) {
            $table->dropUnique('user_journal_role_unique');
            $table->dropForeign(['id_journal']);
            $table->dropColumn(['id_journal', 'role_name', 'status']);
            $table->unsignedBigInteger('role_id')->nullable(false)->change();
            $table->unique(['user_id', 'role_id'], 'user_roles_user_id_role_id_unique');
        });
    }
};
```

- [ ] **Step 2: Run migration**

Run: `php artisan migrate`
Expected: Migrated: `2026_07_09_000000_add_journal_fields_to_user_roles_table`

- [ ] **Step 3: Commit**

```bash
git add database/migrations/2026_07_09_000000_add_journal_fields_to_user_roles_table.php
git commit -m "migration: add journal fields to user_roles table"
```

---

### Task 2: Eloquent Model & Relations

**Files:**
- Create: `app/Models/UserRole.php`
- Modify: `app/Models/User.php`
- Modify: `app/Models/Journal.php`
- Create: `tests/Feature/UserRoleModelTest.php`

- [ ] **Step 1: Create app/Models/UserRole.php**

Write code:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRole extends Model
{
    protected $table = 'user_roles';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'id_journal',
        'role_name',
        'status',
        'assigned_at',
        'assigned_by',
    ];

    protected $appends = ['id_user'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function journal()
    {
        return $this->belongsTo(Journal::class, 'id_journal');
    }

    public function getIdUserAttribute()
    {
        return $this->user_id;
    }

    public function setIdUserAttribute($value)
    {
        $this->attributes['user_id'] = $value;
    }
}
```

- [ ] **Step 2: Modify app/Models/User.php**

Add relationship and helper methods:
```php
    /**
     * Get journal roles of this user
     */
    public function userRoles()
    {
        return $this->hasMany(UserRole::class, 'user_id');
    }

    /**
     * Check if user has a role in a specific journal
     */
    public function hasJournalRole(string $roleName, $journalId = null): bool
    {
        return $this->userRoles()
            ->where('role_name', $roleName)
            ->where('id_journal', $journalId)
            ->where('status', 'Active')
            ->exists();
    }

    /**
     * Check if user has a role in any journal
     */
    public function hasRoleInAnyJournal(string $roleName): bool
    {
        return $this->userRoles()
            ->where('role_name', $roleName)
            ->where('status', 'Active')
            ->exists();
    }
```

- [ ] **Step 3: Modify app/Models/Journal.php**

Add relationship:
```php
    /**
     * Get user roles for this journal
     */
    public function userRoles()
    {
        return $this->hasMany(UserRole::class, 'id_journal');
    }
```

- [ ] **Step 4: Create Model Tests**

Create `tests/Feature/UserRoleModelTest.php`:
```php
<?php

namespace Tests\Feature;

use App\Models\Journal;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_have_journal_specific_roles()
    {
        $user = User::factory()->create();
        $journal = Journal::factory()->create();

        $userRole = UserRole::create([
            'user_id' => $user->id,
            'id_journal' => $journal->id,
            'role_name' => 'Editor',
            'status' => 'Active',
        ]);

        $this->assertTrue($user->hasJournalRole('Editor', $journal->id));
        $this->assertTrue($user->hasRoleInAnyJournal('Editor'));
        $this->assertFalse($user->hasJournalRole('Author', $journal->id));
        $this->assertEquals($user->id, $userRole->id_user);
    }
}
```

- [ ] **Step 5: Run tests**

Run: `php artisan test --filter=UserRoleModelTest`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/Models/UserRole.php app/Models/User.php app/Models/Journal.php tests/Feature/UserRoleModelTest.php
git commit -m "feat: implement UserRole model and relations"
```

---

### Task 3: RoleMiddleware

**Files:**
- Create: `app/Http/Middleware/RoleMiddleware.php`
- Modify: `bootstrap/app.php`
- Create: `tests/Feature/RoleMiddlewareTest.php`

- [ ] **Step 1: Create RoleMiddleware**

Write code in `app/Http/Middleware/RoleMiddleware.php`:
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login')
                ->with('error', 'You must be logged in to access this page.');
        }

        if (! $user->is_active) {
            auth()->logout();

            return redirect()->route('login')
                ->with('error', 'Your account has been deactivated.');
        }

        $journal = $request->route('journal');
        $journalId = null;

        if ($journal) {
            if (is_object($journal)) {
                $journalId = $journal->id;
            } elseif (is_numeric($journal)) {
                $journalId = (int) $journal;
            }
        } else {
            $journalId = $request->route('journal_id') ?? $request->route('id_journal') ?? $request->input('id_journal');
        }

        if ($journalId) {
            foreach ($roles as $role) {
                if ($user->hasJournalRole($role, $journalId)) {
                    return $next($request);
                }
            }
        } else {
            foreach ($roles as $role) {
                if ($user->hasRoleInAnyJournal($role)) {
                    return $next($request);
                }

                if ($user->hasRole($role)) {
                    return $next($request);
                }
            }
        }

        abort(403, 'Unauthorized. You do not have the required role for this journal.');
    }
}
```

- [ ] **Step 2: Register in bootstrap/app.php**

Modify `bootstrap/app.php`:
```php
        // Register middleware aliases
        $middleware->alias([
            'role' => App\Http\Middleware\CheckRole::class,
            'journal.role' => App\Http\Middleware\RoleMiddleware::class,
            'active' => App\Http\Middleware\EnsureUserIsActive::class,
            'journal.owner' => App\Http\Middleware\CheckJournalOwnership::class,
            'university' => App\Http\Middleware\CheckUniversity::class,
        ]);
```

- [ ] **Step 3: Create middleware tests**

Create `tests/Feature/RoleMiddlewareTest.php`:
```php
<?php

namespace Tests\Feature;

use App\Models\Journal;
use App\Models\User;
use App\Models\UserRole;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_middleware_allows_user_with_role_for_journal()
    {
        $user = User::factory()->create(['is_active' => true]);
        $journal = Journal::factory()->create();

        UserRole::create([
            'user_id' => $user->id,
            'id_journal' => $journal->id,
            'role_name' => 'Editor',
            'status' => 'Active',
        ]);

        $request = Request::create('/journals/' . $journal->id, 'GET');
        $request->setUserResolver(fn () => $user);
        
        // Mock route parameter
        $request->setRouteResolver(fn () => new class($journal) {
            private $journal;
            public function __construct($journal) { $this->journal = $journal; }
            public function parameter($name) { return $name === 'journal' ? $this->journal : null; }
        });

        $middleware = new RoleMiddleware();
        $response = $middleware->handle($request, function () {
            return response('Access Granted');
        }, 'Editor');

        $this->assertEquals('Access Granted', $response->getContent());
    }
}
```

- [ ] **Step 4: Run tests**

Run: `php artisan test --filter=RoleMiddlewareTest`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Http/Middleware/RoleMiddleware.php bootstrap/app.php tests/Feature/RoleMiddlewareTest.php
git commit -m "feat: implement RoleMiddleware and register alias"
```

---

### Task 4: Controller & Routes

**Files:**
- Create: `app/Http/Controllers/Admin/UserRoleController.php`
- Modify: `routes/web.php`
- Create: `tests/Feature/UserRoleControllerTest.php`

- [ ] **Step 1: Create UserRoleController**

Write code in `app/Http/Controllers/Admin/UserRoleController.php`:
```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserRoleController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with(['userRoles.journal'])->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->userRoles->map(function ($ur) {
                    return [
                        'id' => $ur->id,
                        'id_user' => $ur->user_id,
                        'id_journal' => $ur->id_journal,
                        'role_name' => $ur->role_name,
                        'status' => $ur->status,
                        'journal' => $ur->journal ? [
                            'name' => $ur->journal->title
                        ] : null,
                    ];
                }),
            ];
        });

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }
}
```

- [ ] **Step 2: Add Web Routes**

Add to `routes/web.php` in the `auth` middleware group:
```php
        // Journal User Role Management
        Route::get('/admin/users', [\App\Http\Controllers\Admin\UserRoleController::class, 'index'])->name('admin.users.index');
```
*Note: Make sure to place this before any general `/admin/users` resource route or replace the index route specifically so it uses UserRoleController.*

- [ ] **Step 3: Create Controller Tests**

Create `tests/Feature/UserRoleControllerTest.php`:
```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_user_roles_index()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('admin.users.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Users/Index'));
    }
}
```

- [ ] **Step 4: Run tests**

Run: `php artisan test --filter=UserRoleControllerTest`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/Admin/UserRoleController.php routes/web.php tests/Feature/UserRoleControllerTest.php
git commit -m "feat: implement UserRoleController and add route"
```

---

### Task 5: Frontend Page Index.tsx

**Files:**
- Modify: `resources/js/pages/Admin/Users/Index.tsx`

- [ ] **Step 1: Write UI component**

Rewrite `resources/js/pages/Admin/Users/Index.tsx`:
```tsx
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export interface UserRole {
    id: number;
    id_user: number;
    id_journal: number | null;
    role_name: 'Author' | 'Editor' | 'SectionEditor' | 'Reviewer' | 'Copyeditor' | 'ProductionEditor' | 'Admin';
    status: 'Active' | 'Invited' | 'Declined';
    journal?: {
        name: string;
    };
}

export interface User {
    id: number;
    name: string;
    email: string;
    roles: UserRole[];
}

export interface IndexProps {
    users: User[];
}

export default function Index({ users }: IndexProps) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'User Management' }]}>
            <Head title="Manajemen Pengguna & Peran" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pengelola Jurnal</h1>
                        <p className="text-muted-foreground text-sm">
                            Daftar seluruh pengguna dan peran mereka di dalam sistem JurnalMu.
                        </p>
                    </div>
                    <div>
                        <Link href="/admin/users/invite">
                            <Button className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Undang Peran Baru
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Pengguna</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Peran & Jurnal</TableHead>
                                    <TableHead>Status Undangan</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Tidak ada pengguna ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-2">
                                                    {user.roles.map((role) => (
                                                        <div key={role.id} className="flex flex-col items-start gap-1">
                                                            <span className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800">
                                                                {role.role_name}
                                                            </span>
                                                            {role.journal && (
                                                                <span className="text-xs text-muted-foreground italic pl-1">
                                                                    {role.journal.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-2">
                                                    {user.roles.map((role) => (
                                                        <div key={role.id} className="flex items-center">
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                role.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                                role.status === 'Invited' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                                                            }`}>
                                                                {role.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col gap-2 items-end">
                                                    {user.roles.map((role) => (
                                                        <div key={role.id} className="flex items-center">
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => {
                                                                    // Placeholder action
                                                                    console.log('Revoke role', role.id);
                                                                }}
                                                            >
                                                                Cabut Peran
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/pages/Admin/Users/Index.tsx
git commit -m "feat: implement React view for User roles index"
```
