<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TwoFactorAuthController extends Controller
{
    public function __construct(protected TwoFactorService $twoFactorService) {}

    public function show()
    {
        return Inertia::render('Auth/TwoFactorVerify');
    }

    public function verify(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();

        if (!$this->twoFactorService->verify($user, $request->code)) {
            return back()->withErrors(['code' => 'Invalid or expired code. Please try again.']);
        }

        $request->session()->put('2fa_passed', true);

        return redirect()->intended('/dashboard');
    }

    public function resend(Request $request)
    {
        $user = $request->user();
        $this->twoFactorService->generateAndSend($user);

        return back()->with('status', 'A new code has been sent to your email.');
    }
}