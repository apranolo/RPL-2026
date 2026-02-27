# Copilot Instructions for jurnal_mu

## Project Overview
**jurnal_mu** is a Laravel 12 + Inertia.js (React) application for managing academic journal assessments across Indonesian universities (PTM). It implements a hierarchical role-based system with three tiers: Super Admin, Admin Kampus (University Admin), and User (Journal Manager).

## Architecture

### Tech Stack
- **Backend**: Laravel 12, PHP 8.2+, MySQL
- **Frontend**: React 19, TypeScript, Inertia.js 2.0, Vite
- **UI**: Tailwind CSS 4, Radix UI, shadcn/ui components
- **Testing**: Pest PHP, Laravel Dusk (browser tests)
- **Build**: Vite with Laravel plugin, SSR support

### Key Patterns

#### Role-Based Access Control
The application uses a **strict hierarchical ownership model**:
- **Super Admin**: Manages all universities and Admin Kampus users
- **Admin Kampus**: Manages Users within their own university only (enforced by `university_id`)
- **User**: Manages their own journals only (enforced by `user_id`)

Authorization is implemented through:
1. **Policies** (e.g., [JournalPolicy.php](../app/Policies/JournalPolicy.php), [UserPolicy.php](../app/Policies/UserPolicy.php)) - Define what each role can do
2. **Middleware** ([CheckRole.php](../app/Http/Middleware/CheckRole.php)) - Applied via route groups in [web.php](../routes/web.php)
3. **Scopes** on models (e.g., `User::forUniversity($universityId)`) - Filter queries by ownership

**Example Policy Pattern**:
```php
public function view(User $user, Journal $journal): bool {
    if ($user->isSuperAdmin()) return true;
    if ($user->isAdminKampus()) return $user->university_id === $journal->university_id;
    return $user->id === $journal->user_id; // User role
}
```

#### Laravel Conventions
- **Routes**: Named routes grouped by role in [web.php](../routes/web.php) - `admin.*`, `admin-kampus.*`, `user.*`
- **Controllers**: Organized by role in namespaces (e.g., `App\Http\Controllers\AdminKampus\UserController`)
- **Models**: Use soft deletes, fillable attributes, and relationship methods ([User.php](../app/Models/User.php))
- **Migrations**: Follow Laravel naming (`2025_11_06_*_create_*_table.php`)

#### Inertia.js Pattern
- **Server**: Controllers return `Inertia::render('Page', [...props])` instead of JSON
- **Client**: Pages receive props via `<Component {...props} />` TypeScript interfaces
- **Navigation**: Use `<Link>` from `@inertiajs/react` for SPA-like navigation
- **Forms**: Use `router.post/put/delete()` with automatic CSRF handling

**Page Structure Example** ([Show.tsx](../resources/js/pages/AdminKampus/Users/Show.tsx)):
```tsx
// JSDoc header documents route and features
/**
 * @route GET /admin-kampus/users/{id}
 * @features Display user profile, managed journals, toggle status
 */
interface Props { user: User; journals: Journal[]; }
export default function UsersShow({ user, journals }: Props) {
    // Props passed from Inertia::render() in controller
}
```

#### Frontend Organization
- **Pages**: `resources/js/pages/{Role}/{Resource}/{Action}.tsx` (e.g., `AdminKampus/Users/Index.tsx`)
- **Components**: Reusable UI in `resources/js/components/` (shadcn/ui components in `ui/`)
- **Layouts**: `resources/js/layouts/app-layout.tsx` wraps pages with sidebar/breadcrumbs
- **Types**: TypeScript interfaces in `resources/js/types/index.d.ts`

**JSDoc Convention**: All page components use structured JSDoc with `@description`, `@features`, and `@route` tags.

## Database Schema (ERD)
See [ERD Database.md](../docs/database/ERD%20Database.md) for full schema. Key tables:
- `users` - All roles with `role_id` and `university_id`
- `roles` - Super Admin, Admin Kampus, User
- `universities` - PTM institutions
- `journals` - Managed by Users, owned by Universities
- `journal_assessments` - Self-assessment submissions
- `scientific_fields`, `evaluation_indicators` - Reference data

**Soft Deletes**: Used on `users`, `journals`, and assessments for audit trail.

## Developer Workflows

### Local Development (XAMPP)
```bash
# Start XAMPP (Apache + MySQL)
# Navigate to: http://localhost/jurnal_mu

# Backend
composer install
php artisan migrate:fresh --seed  # Reset DB with test data
php artisan serve  # Optional: Use Laravel dev server

# Frontend (in separate terminal)
npm install
npm run dev  # Vite dev server with HMR

# Access: http://localhost/jurnal_mu or http://localhost:8000
```

### Code Quality Checks
Run **before** committing (enforced by GitHub Actions):
```bash
# PHP linting (Laravel Pint)
./vendor/bin/pint --test  # Check only
./vendor/bin/pint         # Fix issues

# JavaScript/TypeScript
npm run lint              # ESLint with auto-fix
npm run format:check      # Prettier check
npm run format            # Prettier auto-fix
npm run types             # TypeScript type checking (tsc --noEmit)

# Tests
php artisan test          # Run Pest tests
php artisan dusk          # Run browser tests (requires ChromeDriver)
```

### Testing
- **Unit/Feature Tests**: Use Pest in `tests/Feature/` and `tests/Unit/`
- **Browser Tests**: Laravel Dusk in `tests/Browser/`
- **Test Database**: Uses `:memory:` SQLite (configured in [phpunit.xml](../phpunit.xml))

### Common Commands
```bash
# Database
php artisan migrate       # Run migrations
php artisan db:seed       # Seed data

# Cache
php artisan optimize:clear  # Clear all caches (config, route, view)

# Build for production
npm run build             # Frontend assets
npm run build:ssr         # SSR support
```

## Project-Specific Conventions

### Naming
- **Routes**: Use kebab-case with role prefix (e.g., `/admin-kampus/users/{id}`)
- **Controllers**: PascalCase with role namespace (e.g., `AdminKampus\UserController`)
- **React Components**: PascalCase files (e.g., `UsersShow.tsx`)
- **Database**: snake_case tables/columns (e.g., `journal_assessments`)

### Data Flow Pattern (Example: Admin Kampus manages Users)
1. Route: `GET /admin-kampus/users` → Middleware `role:Admin Kampus`
2. Controller: `AdminKampus\UserController@index` → Authorizes via `$this->authorize('viewAny', User::class)`
3. Policy: `UserPolicy@viewAny` → Checks `$user->isAdminKampus() && $user->is_active`
4. Query: `User::forUniversity($user->university_id)` → Scopes to admin's university
5. Response: `Inertia::render('AdminKampus/Users/Index', ['users' => ...])` → Returns Inertia response
6. Frontend: `AdminKampus/Users/Index.tsx` → Renders table with props

### File Locations
- **Controllers**: `app/Http/Controllers/{Role}/{Resource}Controller.php`
- **Policies**: `app/Policies/{Resource}Policy.php`
- **Models**: `app/Models/{Resource}.php`
- **Pages**: `resources/js/pages/{Role}/{Resource}/{Action}.tsx`
- **Routes**: [web.php](../routes/web.php) (main), [auth.php](../routes/auth.php), [api.php](../routes/api.php)

## External Integrations
- **Google OAuth**: Laravel Socialite in [SocialAuthController.php](../app/Http/Controllers/Auth/SocialAuthController.php)
- **Ziggy**: Laravel route helper for frontend (`route('name')` in TypeScript)
- **Sanctum**: API authentication (configured but not actively used in MVP)

## Documentation
- **MVP Scope**: [jurnal_mu MVP.md](../docs/jurnal_mu MVP.md) - Feature priorities and user stories
- **Project Plan**: [jurnal_mu project plan.md](../docs/jurnal_mu project plan.md)
- **Automation**: [AUTOMATION_SETUP.md](../AUTOMATION_SETUP.md) - GitHub Actions workflows
- **Policy Testing**: [policy testing.md](../docs/policy testing.md)

## Agentic Skills Reference
The `.agents` folder contains reusable skill definitions for AI agents working on this project. Each skill provides specialized knowledge and capabilities in a specific domain:

### Available Skills
- **[laravel-expert](../.agents/skills/laravel-expert/SKILL.md)** - Laravel framework expertise, architecture patterns, best practices for the PHP backend
- **[react-expert](../.agents/skills/react-expert/SKILL.md)** - React 19 and modern React patterns, with references for hooks, performance optimization, server components, state management, and testing
- **[frontend-design](../.agents/skills/frontend-design/SKILL.md)** - Frontend design principles, UI/UX patterns, component design, accessibility
- **[qa-test-engineer](../.agents/skills/qa-test-engineer/SKILL.md)** - QA processes, test engineering, test automation (Pest, Dusk, Jest/Vitest), with AI agent configuration
- **[security-auditor](../.agents/skills/security-auditor/SKILL.md)** - Security best practices, vulnerability assessment, secure coding patterns for Laravel and React

### Usage
Agents should reference these skills when:
- Working on backend features (use **laravel-expert**)
- Building UI components (use **react-expert** + **frontend-design**)
- Writing tests (use **qa-test-engineer**)
- Reviewing security implications (use **security-auditor**)

Each skill includes SKILL.md with detailed guidelines. Some skills include additional references and agent configurations (e.g., react-expert has hook patterns, performance guides; qa-test-engineer has OpenAI agent config).

## GitHub Actions (PR Automation)
Automated checks run on every PR (see [.github/workflows/](workflows/)):
- PHP linting, JS/TS linting, formatting, type checking, tests
- Auto-labeling by file changes and PR size
- Status updates posted as comments

Before pushing, run local checks to avoid CI failures (see Code Quality Checks above).

---

**Key Insight**: This is a **multi-tenant application** where data isolation by `university_id` is critical. Always verify policies and scopes when creating new features.
