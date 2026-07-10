<?php

/** @author KHANSA KAMILAH LICTJELITA */
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserBankController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:100',
            'account_number' => 'required|string|max:50',
            'account_name' => 'required|string|max:150',
        ]);

        $user = Auth::user();
        
        $user->update([
            'bank_name' => $validated['bank_name'],
            'account_number' => $validated['account_number'],
            'account_name' => $validated['account_name'],
        ]);
        
        return back()->with('success', 'Data rekening bank berhasil disinkronisasi.');
    }
}
