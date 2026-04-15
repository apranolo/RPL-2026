# BUG-001: Cover Image & Logo Not Displaying

- **Date Reported**: 2026-03-04
- **Severity**: High (visual breakage on all public pages)
- **Status**: Fixed
- **Fixed By**: GitHub Copilot (automated fix)

---

## Summary

Two related image display bugs were reported:

1. **Journal cover images not showing** on public journal pages.
2. **`logo_dark.png` (Risetmu logo) not showing** in the navbar, favicon, and other UI elements.

---

## Bug 1 — Logo Not Displaying

### Root Cause A: File in wrong directory

`logo_dark.png` was placed in the **project root** (`c:\xampp\htdocs\jurnal_mu\logo_dark.png`) — not inside `public/`. The web server only serves files under `public/`, so the file was completely unreachable by the browser.

### Root Cause B: Bare relative path in templates

All references used bare relative URLs like `src="logo_dark.png"`. On SPA routes deeper than the root (e.g. `/jurnal_mu/dashboard`), the browser resolves this as `/jurnal_mu/dashboard/logo_dark.png` → **404 Not Found**.

Affected files:

| File | Reference |
|------|-----------|
| [resources/views/app.blade.php](../../resources/views/app.blade.php) | `href="logo_dark.png"` (favicon) |
| [resources/js/components/app-logo.tsx](../../resources/js/components/app-logo.tsx) | `src="logo_dark.png"` |
| [resources/js/pages/welcome.tsx](../../resources/js/pages/welcome.tsx) | `src="logo_dark.png"` |
| [resources/js/pages/Journals/Index.tsx](../../resources/js/pages/Journals/Index.tsx) | `src="logo_dark.png"` |
| [resources/js/pages/Journals/Show.tsx](../../resources/js/pages/Journals/Show.tsx) | `src="logo_dark.png"` |

### Fix Applied

1. Copied `logo_dark.png` to `public/logo_dark.png` so Apache/XAMPP can serve it.
2. Copied `logo_dark.png` to `resources/js/assets/logo_dark.png` for Vite bundling.
3. Updated `app.blade.php` to use `{{ asset('logo_dark.png') }}` — the `asset()` helper correctly prepends `APP_URL`, making the path absolute and subdirectory-safe.
4. Updated all four TSX files to import the logo via Vite asset import:
   ```tsx
   import logoUrl from '@/assets/logo_dark.png';
   // ...
   <img src={logoUrl} ... />
   ```
   Vite resolves the import to a hashed absolute URL at build time, which is deployment-path-agnostic.

---

## Bug 2 — Journal Cover Image Not Displaying

### Root Cause: Hardcoded `/storage/` prefix

[`JournalCoverService::upload()`](../../app/Services/JournalCoverService.php) stored cover image paths as:

```
/storage/journal-covers/cover_1_1234567890.jpg
```

This **hardcoded absolute URL path** does not include the app subdirectory. When the application is deployed under XAMPP at `http://localhost/jurnal_mu/`, the browser resolves `/storage/...` as `http://localhost/storage/...` (missing `/jurnal_mu`) → **404 Not Found**.

The correct base is defined in `config/filesystems.php`:
```php
'url' => env('APP_URL').'/storage',  // e.g. http://localhost/jurnal_mu/storage
```

Additionally, existing DB records already contain the broken `/storage/...` paths.

### Fix Applied

**`JournalCoverService::upload()`** — Changed return value to use `Storage::url()`:
```php
// Before (broken under subdirectory)
return '/storage/' . $path;

// After (correct in all deployment configurations)
return Storage::disk(self::DISK)->url($path);
```

**`JournalCoverService::deleteExisting()`** — Updated to:
- Use `$journal->getRawOriginal('cover_image')` to bypass the model accessor and get the raw DB value.
- Handle both legacy paths (`/storage/...`) and new full URLs when extracting the storage-relative path for deletion.

**`Journal::getCoverImageAttribute()` accessor** — Added to the `Journal` model to normalize **existing DB records** on-the-fly without requiring a data migration:
```php
public function getCoverImageAttribute(?string $value): ?string
{
    if (! $value) return $value;

    // Normalise legacy: /storage/journal-covers/... → full URL via Storage::url()
    if (str_starts_with($value, '/storage/')) {
        $relativePath = ltrim(str_replace('/storage/', '', $value), '/');
        return Storage::disk('public')->url($relativePath);
    }

    return $value; // already a full URL
}
```

---

## Detailed Technical Summary

### Problem Diagnosis Flow

1. **Initial Report**: Logo and cover images not displaying
2. **Logo Investigation**: File in project root (not `public/`), bare relative URLs in templates
3. **Cover Image Investigation**: Absolute path `/storage/...` correct in code, but images return 403
4. **403 Root Cause Identified**: 
   - Laravel's `storage.local` auto-route (from `serve: true`) intercepts `/storage/{path}` requests
   - Routes to **private** local disk, not public disk → 403
   - Applies to both `artisan serve` and Apache deployments
5. **Solution**: Disable auto-route, add explicit public route

### Configuration Impact

| Component | Before | After | Impact |
|-----------|--------|-------|--------|
| `config/filesystems.php` local disk | `serve: true` | `serve: false` | Removes conflicting `storage.local` route |
| `routes/web.php` | No storage route | `GET /storage/{path}` | Explicit route for public disk file serving |
| Private file downloads | Still work | Still work | Use `Storage::disk('local')->download()` directly, never use the route |
| File paths in DB | `mixed` (legacy + new) | Same | Accessor normalizes on read |
| Cover image requests | 403 error | Success | Now routed to public disk |

### Edge Cases Handled

1. **Existing DB Records**: Records with legacy `/storage/journal-covers/cover.jpg` paths are normalized by `getCoverImageAttribute()` accessor — no migration needed
2. **artisan serve**: PHP dev server doesn't follow junctions; the new route handles this by streaming from Storage layer
3. **Apache/Nginx**: Real server doesn't invoke this route (Apache serves static file directly via junction), so zero production overhead
4. **Private vs Public**: Private disk (`local`) is unaffected — downloads are handled in the controller, never via a route

---

## Files Changed (Detailed)

| File | Change | Lines |
|------|--------|-------|
| `public/logo_dark.png` | **Added** — copied from project root to web-accessible location | N/A |
| `resources/js/assets/logo_dark.png` | **Added** — copied for Vite bundling with hashed asset names | N/A |
| `resources/views/app.blade.php` | Changed `href="logo_dark.png"` → `{{ asset('logo_dark.png') }}` | 36–37 |
| `resources/js/components/app-logo.tsx` | Added `import logoUrl from '@/assets/logo_dark.png'`; changed `src="logo_dark.png"` → `src={logoUrl}` | 1, 5 |
| `resources/js/pages/welcome.tsx` | Added logo import at top; changed `src="logo_dark.png"` → `src={logoUrl}` | 1, 54 |
| `resources/js/pages/Journals/Index.tsx` | Added logo import at top; changed `src="logo_dark.png"` → `src={logoUrl}` | 1, 140 |
| `resources/js/pages/Journals/Show.tsx` | Added logo import at top; changed `src="logo_dark.png"` → `src={logoUrl}` | 1, 128 |
| `app/Services/JournalCoverService.php` | 1. Changed `return '/storage/'.$path;` → `return Storage::disk(self::DISK)->url($path);` (line 38); 2. Updated `deleteExisting()` to use `getRawOriginal()` and handle both path formats | 38, 48–62 |
| `app/Models/Journal.php` | 1. Added `use Illuminate\Support\Facades\Storage;` import (line 8); 2. Added `getCoverImageAttribute()` accessor to normalize legacy paths | 8, 475–493 |
| `config/filesystems.php` | Changed `'serve' => true` → `'serve' => false` on `local` disk to remove conflicting `storage.local` route | 40 |
| `routes/web.php` | 1. Added `use Illuminate\Support\Facades\Storage;` import; 2. Added `GET /storage/{path}` route with documentation explaining why it's needed | 34, 40–51 |

---

## Bug 2 — Addendum: 403 on `/storage/...` After Initial Fix

After Bug 2's initial fix (using `Storage::url()`), a **403 Forbidden** was still returned for cover images.

### Root Cause: `serve: true` on the `local` disk

`config/filesystems.php` had `'serve' => true` on the `local` disk. This caused Laravel to register an automatic route:

```
GET|HEAD  storage/{path}   storage.local
```

This route **intercepted every `/storage/{path}` request** and attempted to serve it from the **private** `local` disk (`storage/app/private/`). Since cover images are on the `public` disk (`storage/app/public/`), the file was not found → **403 Forbidden**.

Additionally, PHP's built-in web server (`php artisan serve`) does **not follow Windows directory junctions** for static file serving. This means requests for `public/storage/...` (the junction) could not be served as static files and always fell through to PHP — where they hit the conflicting `storage.local` route.

### Fix Applied

**`config/filesystems.php`** — Set `'serve' => false` on the `local` disk:
```php
'local' => [
    'driver' => 'local',
    'root' => storage_path('app/private'),
    'serve' => false,   // ← was true; caused route conflict
    ...
],
```
This removes the `storage.local` Laravel route. Private file downloads are unaffected — they use `Storage::disk('local')->download()` directly in the controller, not via the route.

**`routes/web.php`** — Added a public-facing storage serving route:
```php
Route::get('/storage/{path}', function (string $path) {
    if (! Storage::disk('public')->exists($path)) {
        abort(404);
    }
    return Storage::disk('public')->response($path);
})->where('path', '.+')->name('storage.serve');
```
This route correctly serves files from the `public` disk for `artisan serve`. When using a real web server (Apache/Nginx), the `public/storage` symlink is served directly as a static file before PHP is invoked, so this route is never reached in production.

---

## Verification Steps

### 1. Logo Display
- Start XAMPP, visit `http://localhost/jurnal_mu` → confirm Risetmu logo in navbar
- Navigate to `/journals` → confirm logo visible
- Navigate to any journal detail page → confirm logo in navbar
- Inspect the logo in browser DevTools → should be a hashed URL like `/build/assets/logo_dark-DXNPjaUN.png` (Vite-bundled)

### 2. Journal Cover Images
- Visit `/journals/{id}` for a journal with a cover image
- Inspect the cover image URL in DevTools → should show `http://localhost:8000/storage/journal-covers/cover_1_***.jpg`
- Confirm the image renders (no 403 or 404)
- In browser Network tab, the `/storage/...` request should:
  - **If using Apache/XAMPP**: served as static file by Apache (type: image, no PHP overhead)
  - **If using `artisan serve`**: served by the `storage.serve` route (type: image, with Response header `Content-Type: image/jpeg`)

### 3. New Cover Upload
- Upload a new journal cover via the journal edit form
- Confirm the new image displays on the journal detail page
- Verify the URL is full-qualified: `http://localhost:8000/storage/journal-covers/cover_***.jpg`

### 4. Build & Tests
- Run `npm run build` → zero TypeScript/Vite errors, includes `logo_dark-*.png` in bundle
- Run `php artisan test` — no regressions
- Run `php artisan route:list --path=storage` — should show only one route: `storage.serve` (no `storage.local`)

---

## Lessons Learned & Recommendations

### What Went Wrong

1. **Logo File Location**: Committed to project root instead of `public/` — only files in `public/` are web-accessible
2. **Relative URL Paths**: Hard-coded `src="logo_dark.png"` breaks on any non-root route; always use `asset()` helper or Vite imports
3. **Overly Broad Route**: `serve: true` on a private disk caused a catch-all route that intercepted public storage requests
4. **Path Hardcoding**: Returning `/storage/...` instead of using `Storage::url()` breaks under subdirectory deployments
5. **Junction Assumptions**: Assumed Windows junctions work in PHP dev server (they don't)

### Best Practices Going Forward

#### Static Assets (CSS, JS, Images, Fonts)
- **Always place in `resources/` or `public/`**, never in `storage/`
- **Use Vite imports** for component images: `import logo from '@/assets/logo.png'` → hashed, versioned, cacheable
- **Use `asset()` helper** for non-imported static files (favicons, fallback images)
- **Never hard-code relative URLs** like `src="file.png"` — always dynamic path resolution

#### Uploaded User Files
- **Always store in `storage/app/public/`** (public disk) for user-facing files
- **Always use `Storage::disk('public')->url()` for URL generation** — respects `APP_URL` and deployment structure
- **Never hard-code `/storage/...` paths** in code
- **Consider adding a route handler** if the app targets `php artisan serve` in dev (real servers handle symlinks natively)

#### Configuration
- **Leave `serve: false`** on private disks unless you explicitly need a route for those files
- **Test both `artisan serve` and Apache/Nginx** — dev server behavior differs (junctions, symlinks, etc.)
- **Document why routes exist** — future maintainers won't know if a route is needed or legacy

#### Database
- **Store relative paths** in the DB (e.g., `journal-covers/cover_1.jpg`), not full URLs
- **Generate URLs at runtime** using `Storage::url()` or model accessors
- **Use accessors/mutators** to normalize legacy paths when code changes
- **Never migrate full URLs** to the DB — they become brittle when deployment structure changes

---

## Related Issues & Dependencies

- **Vite SSR**: If SSR is enabled, ensure asset imports work in both client and server rendering contexts
- **Future CDN Migration**: Using `Storage::url()` makes it trivial to switch from local storage to S3/CloudFront — no code changes needed
- **File Permissions**: Ensure `storage/app/public/` has correct permissions for uploads (`775` recommended, or managed by web server user)

---

## Status

✅ **Fixed** — All cover images and logos now display correctly in development (`artisan serve`) and production (Apache/Nginx)
