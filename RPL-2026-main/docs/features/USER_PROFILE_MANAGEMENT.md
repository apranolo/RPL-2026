# User Profile Management Feature

## Overview
Complete profile management system for User (Pengelola Jurnal) role with avatar upload, enhanced profile fields, and consolidated settings interface.

## Implementation Date
February 14, 2026

## Features Implemented

### ✅ 1. Avatar Upload & Management
- **Upload**: Support for JPG, PNG images up to 2MB
- **Preview**: Real-time preview before upload
- **Delete**: Remove uploaded avatars (OAuth avatars protected)
- **Fallback**: Displays initials when no avatar exists
- **Storage**: `/storage/app/public/avatars/avatar_{user_id}_{timestamp}.{ext}`

### ✅ 2. Enhanced Profile Fields
- **Name** - Full name (required)
- **Email** - Email address with verification flow (required)
- **Phone** - Contact number (optional, max 20 chars)
- **Position** - Job title/position (optional, max 100 chars)
- **Scientific Field** - Research area dropdown (optional, foreign key)

### ✅ 3. User/Profil Redirect
- `/user/profil` now redirects to `/settings/profile`
- Consolidated profile management in settings area
- Maintains consistent user experience

## File Changes

### Backend

#### 1. **ProfileUpdateRequest.php** - Enhanced Validation
**Location**: `app/Http/Requests/Settings/ProfileUpdateRequest.php`

```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($this->user()->id)],
        'phone' => ['nullable', 'string', 'max:20'],
        'position' => ['nullable', 'string', 'max:100'],
        'scientific_field_id' => ['nullable', 'exists:scientific_fields,id'],
    ];
}
```

#### 2. **ProfileController.php** - Avatar Methods & Props
**Location**: `app/Http/Controllers/Settings/ProfileController.php`

**Changes**:
- Added `ScientificField` import
- Added `Storage` and `Str` facades
- Enhanced `edit()` method to pass `scientificFields` prop
- Added `uploadAvatar()` method for avatar upload
- Added `deleteAvatar()` method for avatar removal

**Key Methods**:
```php
// Pass scientific fields to frontend
public function edit(Request $request): Response
{
    $scientificFields = ScientificField::where('is_active', true)
        ->orderBy('name')
        ->get(['id', 'name', 'code']);

    return Inertia::render('settings/profile', [
        'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
        'status' => $request->session()->get('status'),
        'scientificFields' => $scientificFields,
    ]);
}

// Upload avatar with validation
public function uploadAvatar(Request $request): RedirectResponse
{
    $request->validate([
        'avatar' => 'required|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    $user = $request->user();

    // Delete old avatar if stored locally
    if ($user->avatar_url && Str::startsWith($user->avatar_url, '/storage/avatars/')) {
        $oldPath = str_replace('/storage/', '', $user->avatar_url);
        Storage::disk('public')->delete($oldPath);
    }

    // Store new avatar
    $file = $request->file('avatar');
    $filename = 'avatar_'.$user->id.'_'.time().'.'.$file->extension();
    $path = $file->storeAs('avatars', $filename, 'public');

    $user->update(['avatar_url' => '/storage/'.$path]);

    return back()->with('success', 'Avatar updated successfully.');
}
```

#### 3. **settings.php** - Avatar Routes
**Location**: `routes/settings.php`

```php
Route::post('settings/profile/avatar', [ProfileController::class, 'uploadAvatar'])->name('profile.upload-avatar');
Route::delete('settings/profile/avatar', [ProfileController::class, 'deleteAvatar'])->name('profile.delete-avatar');
```

#### 4. **ProfilController.php** - Redirect to Settings
**Location**: `app/Http/Controllers/User/ProfilController.php`

```php
public function index(): RedirectResponse
{
    return redirect()->route('profile.edit');
}
```

### Frontend

#### 5. **profile.tsx** - Enhanced UI
**Location**: `resources/js/pages/settings/profile.tsx`

**Features**:
- **Avatar Section**: Upload, preview, delete with visual feedback
- **Profile Form**: Name, email, phone, position, scientific field
- **Validation**: Client-side file type/size validation
- **Toast Notifications**: Success/error feedback using sonner
- **Responsive Design**: Card-based layout with proper spacing

**Key Components**:
```tsx
// Avatar display with fallback
{avatarPreview || auth.user.avatar_url ? (
    <img src={avatarPreview || auth.user.avatar_url} className="h-24 w-24 rounded-full" />
) : (
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
        <span className="text-3xl font-bold">
            {auth.user.initials || auth.user.name.charAt(0).toUpperCase()}
        </span>
    </div>
)}

// Scientific field dropdown
<Select value={data.scientific_field_id} onValueChange={(value) => setData('scientific_field_id', value)}>
    <SelectContent>
        {scientificFields.map((field) => (
            <SelectItem key={field.id} value={field.id.toString()}>
                {field.code} - {field.name}
            </SelectItem>
        ))}
    </SelectContent>
</Select>
```

#### 6. **index.d.ts** - TypeScript Types
**Location**: `resources/js/types/index.d.ts`

**Updated User Interface**:
```typescript
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: Role;
    roles?: Role[];
    university_id?: number;
    avatar_url?: string;
    avatar?: string;
    phone?: string;              // NEW
    position?: string;           // NEW
    is_reviewer?: boolean;
    scientific_field?: ScientificField;
    scientific_field_id?: number; // NEW
    initials?: string;            // NEW
}

export interface ScientificField {
    id: number;
    name: string;
    code: string;               // NEW
}
```

## User Flow

### 1. Updating Profile Information
1. Navigate to `/settings/profile` or `/user/profil` (both work)
2. Edit name, email, phone, position, or scientific field
3. Click "Save Changes"
4. Toast notification confirms success
5. Email verification required if email changed

### 2. Uploading Avatar
1. Click "Change Avatar" button
2. Select JPG/PNG image (max 2MB)
3. Preview appears with "Upload" and "Cancel" buttons
4. Click "Upload" to confirm
5. Avatar updates immediately with toast notification

### 3. Removing Avatar
1. Click "Remove" button (only visible for uploaded avatars)
2. Confirm deletion
3. Avatar reverts to initials fallback
4. OAuth avatars (Google profile pictures) cannot be removed

## Validation Rules

### Backend Validation (ProfileUpdateRequest)
| Field | Rules |
|-------|-------|
| name | required, string, max:255 |
| email | required, email, unique (ignore self), lowercase, max:255 |
| phone | nullable, string, max:20 |
| position | nullable, string, max:100 |
| scientific_field_id | nullable, exists in scientific_fields table |

### Avatar Upload Validation
| Field | Rules |
|-------|-------|
| avatar | required, image, mimes:jpeg,png,jpg, max:2048 (KB) |

### Frontend Validation
- **File Type**: Only JPEG, PNG, JPG allowed
- **File Size**: Maximum 2MB
- **Toast Errors**: User-friendly error messages for validation failures

## Database Schema

No database changes required. Uses existing `users` table fields:
- `avatar_url` - VARCHAR(500) - Stores `/storage/avatars/...` or OAuth URL
- `phone` - VARCHAR(20) - Contact number
- `position` - VARCHAR(100) - Job title
- `scientific_field_id` - Foreign key to `scientific_fields` table

## Authorization

Uses existing `UserPolicy::update()` method:
- ✅ Users can update their own profile (self-update)
- ✅ Super Admin can update any user
- ✅ Admin Kampus can update users in their university

## Storage Configuration

### Directory Structure
```
storage/
  app/
    public/
      avatars/
        avatar_1_1734192000.jpg
        avatar_2_1734192001.png
```

### Public Access
- Symbolic link: `public/storage -> storage/app/public`
- Avatar URL: `/storage/avatars/avatar_{user_id}_{timestamp}.{ext}`
- Command: `php artisan storage:link` (already executed)

## Testing Checklist

### ✅ Manual Testing
1. **Profile Update**
   - [ ] Update name
   - [ ] Update email (verify email verification flow)
   - [ ] Update phone
   - [ ] Update position
   - [ ] Update scientific field
   - [ ] Verify all fields save correctly

2. **Avatar Upload**
   - [ ] Upload valid JPEG/PNG (under 2MB)
   - [ ] Test file type validation (try .gif, .bmp)
   - [ ] Test file size validation (try >2MB)
   - [ ] Verify preview before upload
   - [ ] Verify avatar displays after upload
   - [ ] Test cancel preview functionality

3. **Avatar Delete**
   - [ ] Delete uploaded avatar
   - [ ] Verify initials fallback appears
   - [ ] Verify OAuth avatar cannot be deleted
   - [ ] Check old file is removed from storage

4. **User/Profil Redirect**
   - [ ] Navigate to `/user/profil`
   - [ ] Verify redirects to `/settings/profile`
   - [ ] Verify breadcrumbs update correctly

5. **Edge Cases**
   - [ ] Upload avatar without changing profile fields
   - [ ] Change profile fields without touching avatar
   - [ ] Test with user who has no scientific field set
   - [ ] Test with user who has OAuth avatar (Google login)

### ✅ Automated Testing
```bash
# Run type checking
npm run types

# Run linting
npm run lint

# Run PHP tests (if profile tests exist)
php artisan test --filter Profile
```

## Known Limitations

1. **OAuth Avatars**: Cannot be deleted (only locally uploaded avatars)
2. **Avatar History**: Old avatars are deleted, no version history
3. **File Types**: Limited to JPEG, PNG, JPG (no GIF, WebP, SVG)
4. **Scientific Field**: Dropdown shows all active fields (no pagination if >100 items)

## Future Enhancements

### Potential Improvements
1. **Avatar Cropping**: Add image cropper before upload
2. **Avatar Compression**: Automatically optimize uploaded images
3. **Activity Log**: Show recent profile changes
4. **Journal Statistics**: Display managed journals count in profile view
5. **Export Profile**: PDF export of profile information
6. **Two-Factor Auth**: Add 2FA toggle in settings
7. **Notification Preferences**: Email/SMS notification settings

## Security Considerations

✅ **Implemented**:
- File type validation (MIME type check)
- File size limit (2MB)
- Authorization via UserPolicy
- Old avatar cleanup (no orphaned files)
- CSRF protection (Laravel default)
- SQL injection protection (Eloquent ORM)

⚠️ **Recommendations**:
- Consider implementing rate limiting for avatar uploads
- Add virus scanning for uploaded files (production)
- Implement Content Security Policy headers
- Add audit log for profile changes

## Support & Troubleshooting

### Common Issues

**Issue**: Avatar upload fails with 500 error
- **Solution**: Check storage permissions: `chmod -R 775 storage/app/public`
- **Solution**: Verify symbolic link: `php artisan storage:link`

**Issue**: Avatar not displaying after upload
- **Solution**: Clear browser cache
- **Solution**: Check `APP_URL` in `.env` matches actual URL

**Issue**: Scientific field dropdown empty
- **Solution**: Verify `scientific_fields` table has active records
- **Solution**: Run seeder: `php artisan db:seed --class=ScientificFieldSeeder`

**Issue**: Profile update fails validation
- **Solution**: Check browser console for error details
- **Solution**: Verify all required fields are filled

## Related Documentation

- [User Model](../../app/Models/User.php) - User model with relationships
- [UserPolicy](../../app/Policies/UserPolicy.php) - Authorization rules
- [Settings Routes](../../routes/settings.php) - Settings area routes
- [User Routes](../../routes/web.php#L399-401) - User role routes

## Changelog

### v1.0.0 - February 14, 2026
- ✅ Initial implementation of profile management
- ✅ Avatar upload/delete functionality
- ✅ Enhanced profile fields (phone, position, scientific field)
- ✅ User/Profil redirect to settings
- ✅ TypeScript type definitions
- ✅ Toast notifications for user feedback
- ✅ Responsive UI with card layout

---

**Implemented by**: GitHub Copilot
**Date**: February 14, 2026
**Status**: ✅ Complete - Ready for Testing
