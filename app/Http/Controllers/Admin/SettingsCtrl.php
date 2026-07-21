<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsCtrl extends Controller
{
    /**
     * Dapatkan pengaturan sistem dari file JSON.
     */
    private function getSettings(): array
    {
        if (Storage::disk('local')->exists('settings.json')) {
            return json_decode(Storage::disk('local')->get('settings.json'), true) ?? [
                'app_name' => config('app.name'),
                'app_logo' => null,
            ];
        }

        return [
            'app_name' => config('app.name'),
            'app_logo' => null,
        ];
    }

    /**
     * Tampilkan halaman pengaturan profil sistem.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => $this->getSettings(),
        ]);
    }

    /**
     * Simpan pembaruan profil sistem (Nama App & Logo).
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'app_name' => 'required|string|max:255',
            'app_logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
        ]);

        $settings = $this->getSettings();
        $settings['app_name'] = $request->app_name;

        if ($request->hasFile('app_logo')) {
            // Hapus logo lama jika ada
            if (! empty($settings['app_logo']) && Storage::disk('public')->exists($settings['app_logo'])) {
                Storage::disk('public')->delete($settings['app_logo']);
            }

            $path = $request->file('app_logo')->store('settings', 'public');
            $settings['app_logo'] = $path;
        }

        Storage::disk('local')->put('settings.json', json_encode($settings, JSON_PRETTY_PRINT));

        return back()->with('success', 'Profil sistem berhasil diperbarui.');
    }
}
