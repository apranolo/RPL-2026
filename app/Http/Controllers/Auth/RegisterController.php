<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisterController extends Controller
{
    /**
     * Handle an incoming registration request (Author default).
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'university_id' => 'required|exists:universities,id',
            'position' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        // Automatically assign User role (Author default)
        $roleId = DB::table('roles')->where('name', Role::USER)->value('id');

        if (! $roleId) {
            return back()->withErrors([
                'email' => 'Role configuration error. Please contact administrator.',
            ]);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $roleId,
            'university_id' => $request->university_id,
            'position' => $request->position,
            'phone' => $request->phone,
            'approval_status' => 'pending', // Starts as pending
            'is_active' => false, // Will be activated after approval
        ]);

        // Attach User role to pivot table
        $user->roles()->attach($roleId, [
            'assigned_at' => now(),
        ]);

        event(new Registered($user));

        return redirect()->route('login')->with('status', 'Registrasi berhasil. Akun Anda (sebagai Author) sedang menunggu persetujuan dari Admin Kampus.');
    }
}
