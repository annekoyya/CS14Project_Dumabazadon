<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\Auth;


class ChangePasswordController extends Controller
{
    public function show()
    {
        $forced = Auth::user()->must_change_password;
        return Inertia::render('Auth/ChangePassword', ['forced' => $forced]);
    }

    public function update(Request $request)
    {
        $user   = $request->user();
        $forced = $user->must_change_password;

        $rules = [
            'password' => [
                'required', 'string', 'min:8', 'confirmed',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*#?&]/',
            ],
        ];

        // Only require current_password for voluntary changes
        if (!$forced) {
            $rules['current_password'] = 'required|string';
        }

        $request->validate($rules, [
            'password.regex' => 'Password must include an uppercase letter, a number, and a special character.',
        ]);

        // Verify current password for voluntary changes
        if (!$forced && !Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        // Prevent reusing same password
        if (Hash::check($request->password, $user->password)) {
            return back()->withErrors(['password' => 'New password cannot be the same as your current password.']);
        }

        $user->password             = Hash::make($request->password);
        $user->must_change_password = false;
        $user->save();

        AuditLogService::log('password_changed', 'User', $user->id);

        $redirectTo = $user->role === 'superadmin' ? '/superadmin/admins' : '/dashboard';

        return redirect($redirectTo)->with('success', 'Password changed successfully.');
    }
}