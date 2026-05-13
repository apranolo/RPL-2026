<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsCtrl extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings/Profile');
    }

    public function update(Request $request)
    {
        // Placeholder for updating application settings (Logo, App Name, etc.)
        return back()->with('success', 'Settings updated successfully.');
    }
}
