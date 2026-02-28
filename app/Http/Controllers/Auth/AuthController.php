<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Services\TwoFactorService;
use App\Services\AuditLogService;

class AuthController extends Controller
{
    public function index()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            // Log failed login attempt
            AuditLogService::log('login_failed', null, null, [
                'email' => $request->email,
            ]);

            return back()->withErrors(['error' => 'Invalid credentials.']);
        }

        $request->session()->regenerate();

        $user = Auth::user();
        $twoFactorService = app(TwoFactorService::class);

        if (!$twoFactorService->hasVerifiedBefore($user)) {
            $twoFactorService->generateAndSend($user);

            // Log that 2FA was triggered
            AuditLogService::log('2fa_triggered');

            return redirect()->route('2fa.show');
        }

        // Log successful login
        AuditLogService::log('login');

        return redirect()->intended('/dashboard');
    }

   public function logout(Request $request)
{
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/login');
}
}