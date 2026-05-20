<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class OutputController extends Controller
{
    /**
     * Store a newly created HKI/Patent output in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeHKI(Request $request)
    {
        $validated = $request->validate([
            'judul_luaran' => 'required|string|max:255',
            'tahun_capaian' => 'required|integer|min:1900|max:' . (date('Y') + 5),
            'penulis_atau_pencipta' => 'required|string',
            'nomor_paten' => 'required|string|max:100',
            'tautan_publikasi' => 'nullable|url',
            'file_sertifikat_atau_cover' => 'required|file|mimes:pdf,jpg,png,jpeg|max:5120',
        ], [
            'judul_luaran.required' => 'Judul luaran wajib diisi.',
            'tahun_capaian.required' => 'Tahun capaian wajib diisi.',
            'penulis_atau_pencipta.required' => 'Penulis atau pencipta wajib diisi.',
            'nomor_paten.required' => 'Nomor paten wajib diisi.',
            'file_sertifikat_atau_cover.required' => 'File sertifikat atau cover wajib diunggah.',
            'file_sertifikat_atau_cover.mimes' => 'File sertifikat atau cover harus berupa PDF, JPG, PNG, atau JPEG.',
            'file_sertifikat_atau_cover.max' => 'Ukuran file sertifikat atau cover maksimal 5MB.',
            'tautan_publikasi.url' => 'Tautan publikasi harus berupa URL yang valid.',
        ]);

        try {
            $filePath = null;
            if ($request->hasFile('file_sertifikat_atau_cover')) {
                $filePath = $request->file('file_sertifikat_atau_cover')->store('luaran/hki', 'public');
            }

            // Integrasi dinamis dengan model database (jika model sudah diimplementasikan oleh tim lain)
            if (class_exists('App\Models\Output')) {
                $outputClass = 'App\Models\Output';
                $outputClass::create(array_merge($validated, [
                    'jenis_luaran' => 'HKI',
                    'file_sertifikat_atau_cover' => $filePath,
                    'status_verifikasi' => 'Menunggu_Verifikasi',
                ]));
            } elseif (class_exists('App\Models\Hki')) {
                $hkiClass = 'App\Models\Hki';
                $hkiClass::create(array_merge($validated, [
                    'file_sertifikat_atau_cover' => $filePath,
                ]));
            }

            return redirect()->back()->with([
                'success' => 'Data HKI berhasil disimpan.',
                'data' => array_merge($validated, ['file_path' => $filePath])
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing HKI: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Terjadi kesalahan saat menyimpan data HKI: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created Book/Module output in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeBook(Request $request)
    {
        $validated = $request->validate([
            'judul_luaran' => 'required|string|max:255',
            'tahun_capaian' => 'required|integer|min:1900|max:' . (date('Y') + 5),
            'penulis_atau_pencipta' => 'required|string',
            'isbn' => 'required|string|max:50',
            'tautan_publikasi' => 'nullable|url',
            'file_sertifikat_atau_cover' => 'required|file|mimes:pdf,jpg,png,jpeg|max:5120',
        ], [
            'judul_luaran.required' => 'Judul luaran wajib diisi.',
            'tahun_capaian.required' => 'Tahun capaian wajib diisi.',
            'penulis_atau_pencipta.required' => 'Penulis atau pencipta wajib diisi.',
            'isbn.required' => 'ISBN wajib diisi.',
            'file_sertifikat_atau_cover.required' => 'File sertifikat atau cover wajib diunggah.',
            'file_sertifikat_atau_cover.mimes' => 'File sertifikat atau cover harus berupa PDF, JPG, PNG, atau JPEG.',
            'file_sertifikat_atau_cover.max' => 'Ukuran file sertifikat atau cover maksimal 5MB.',
            'tautan_publikasi.url' => 'Tautan publikasi harus berupa URL yang valid.',
        ]);

        try {
            $filePath = null;
            if ($request->hasFile('file_sertifikat_atau_cover')) {
                $filePath = $request->file('file_sertifikat_atau_cover')->store('luaran/buku', 'public');
            }

            // Integrasi dinamis dengan model database (jika model sudah diimplementasikan oleh tim lain)
            if (class_exists('App\Models\Output')) {
                $outputClass = 'App\Models\Output';
                $outputClass::create(array_merge($validated, [
                    'jenis_luaran' => 'Buku',
                    'file_sertifikat_atau_cover' => $filePath,
                    'status_verifikasi' => 'Menunggu_Verifikasi',
                ]));
            } elseif (class_exists('App\Models\Book')) {
                $bookClass = 'App\Models\Book';
                $bookClass::create(array_merge($validated, [
                    'file_sertifikat_atau_cover' => $filePath,
                ]));
            }

            return redirect()->back()->with([
                'success' => 'Data Buku berhasil disimpan.',
                'data' => array_merge($validated, ['file_path' => $filePath])
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing Book: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Terjadi kesalahan saat menyimpan data Buku: ' . $e->getMessage());
        }
    }
}
