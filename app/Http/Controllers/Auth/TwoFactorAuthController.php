<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwoFactorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TwoFactorAuthController extends Controller
{
    public function __construct(protected TwoFactorService $twoFactorService) {}

    public function show()
    {
        return Inertia::render('Auth/TwoFactorVerify');
    }

    // ...existing code...

public function verify(Request $request)
{
    $request->validate(['code' => 'required|digits:6']);

    $user = Auth::user();
    assert($user instanceof User);

    // Use the service which correctly uses password_verify() against the bcrypt hash
    if (!$this->twoFactorService->verify($user, $request->code)) {
        return back()->withErrors(['code' => 'Invalid or expired code. Please try again.']);
    }

    // 2FA verified — redirect based on role and password status
    if ($user->role === 'superadmin') {
        return redirect('/superadmin/admins');
    }

    if ($user->must_change_password) {
        return redirect('/password/change');
    }

    return redirect('/dashboard');
}

    public function resend(Request $request)
    {
        $user = $request->user();
        $this->twoFactorService->generateAndSend($user);

        return back()->with('status', 'A new code has been sent to your email.');
    }
}