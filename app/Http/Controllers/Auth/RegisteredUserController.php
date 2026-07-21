<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        // Get active universities for dropdown (with 1-hour cache)
        $universities = Cache::remember('universities.active.registration', 3600, function () {
            return University::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'short_name', 'code']);
        });

        return Inertia::render('auth/register', [
            'universities' => $universities,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'university_id' => 'required|exists:universities,id',
            'role_type' => 'required|in:lppm,user',
            'position' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        // Determine role_id based on selection
        if ($request->role_type === 'lppm') {
            // LPPM registration - role will be assigned by Dikti after approval
            $roleId = null;
        } else {
            // Regular User registration
            $roleId = DB::table('roles')->where('name', Role::USER)->value('id');

            if (! $roleId) {
                return back()->withErrors([
                    'role_type' => 'Role configuration error. Please contact administrator.',
                ]);
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $roleId,
            'university_id' => $request->university_id,
            'position' => $request->position,
            'phone' => $request->phone,
            'approval_status' => 'pending', // All new registrations start as pending
            'is_active' => false, // Will be activated after approval
        ]);

        event(new Registered($user));

        // Send notifications based on role type
        if ($request->role_type === 'lppm') {
            // Notify Dikti (Super Admin) for LPPM approval
            $diktiAdmins = User::whereHas('role', function ($q) {
                $q->where('name', Role::SUPER_ADMIN);
            })->get();

            foreach ($diktiAdmins as $admin) {
                // TODO: Send notification - NewLPPMRegistrationNotification
                // $admin->notify(new NewLPPMRegistrationNotification($user));
            }
        } else {
            // Notify LPPM admins from the same university for User approval
            $lppmAdmins = User::where('university_id', $request->university_id)
                ->whereHas('role', function ($q) {
                    $q->where('name', Role::ADMIN_KAMPUS);
                })
                ->where('is_active', true)
                ->get();

            foreach ($lppmAdmins as $admin) {
                // TODO: Send notification - NewUserRegistrationNotification
                // $admin->notify(new NewUserRegistrationNotification($user));
            }
        }

        // Don't auto-login - user must wait for approval
        return redirect()->route('login')->with('status', 'Pendaftaran berhasil! Akun Anda menunggu persetujuan dari admin. Anda akan menerima email setelah akun disetujui.');
    }
}
