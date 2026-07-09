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
