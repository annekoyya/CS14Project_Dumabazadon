<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Inertia\Inertia;

class ForgotPasswordController extends Controller
{
    public function show()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function send(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $user = User::where('email', $request->email)->first();

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->two_factor_code       = Hash::make($otp);
        $user->two_factor_expires_at = now()->addMinutes(10);
        $user->save();

        // Send OTP email
        Mail::send('emails.forgot-password-otp', [
            'name' => $user->name,
            'otp'  => $otp,
        ], function ($mail) use ($user) {
            $mail->to($user->email)->subject('Password Reset OTP - Barangay Profiling System');
        });

        session(['reset_email' => $user->email]);

        return redirect()->route('forgot-password.verify');
    }

    public function showVerify()
    {
        if (!session('reset_email')) {
            return redirect()->route('forgot-password');
        }
        return Inertia::render('Auth/ForgotPasswordVerify', [
            'email' => session('reset_email'),
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate(['otp' => 'required|string|size:6']);

        $email = session('reset_email');
        if (!$email) return redirect()->route('forgot-password');

        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($request->otp, $user->two_factor_code)) {
            return back()->withErrors(['otp' => 'Invalid or expired OTP code.']);
        }

        if (now()->greaterThan($user->two_factor_expires_at)) {
            return back()->withErrors(['otp' => 'OTP has expired. Please request a new one.']);
        }

        session(['reset_verified' => true]);

        return redirect()->route('forgot-password.reset');
    }

    public function showReset()
    {
        if (!session('reset_email') || !session('reset_verified')) {
            return redirect()->route('forgot-password');
        }
        return Inertia::render('Auth/ForgotPasswordReset');
    }

    public function reset(Request $request)
    {
        $request->validate([
            'password' => [
                'required', 'string', 'min:8', 'confirmed',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*#?&]/',
            ],
        ], [
            'password.regex' => 'Password must include an uppercase letter, a number, and a special character.',
        ]);

        $email = session('reset_email');
        if (!$email || !session('reset_verified')) {
            return redirect()->route('forgot-password');
        }

        $user = User::where('email', $email)->first();

        if (Hash::check($request->password, $user->password)) {
            return back()->withErrors(['password' => 'New password cannot be the same as your old password.']);
        }

        $user->password              = Hash::make($request->password);
        $user->two_factor_code       = null;
        $user->two_factor_expires_at = null;
        $user->must_change_password  = false;
        $user->save();

        session()->forget(['reset_email', 'reset_verified']);

        return redirect()->route('login')->with('success', 'Password reset successfully. Please log in.');
    }
}