<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class TwoFactorService
{
    public function generateAndSend(User $user): void
    {
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->two_factor_code = bcrypt($code);
        $user->two_factor_expires_at = Carbon::now()->addMinutes(10);
        $user->save();

        Mail::send('emails.two-factor-code', ['code' => $code, 'user' => $user], function ($mail) use ($user) {
            $mail->to($user->email)
                 ->subject('Your One-Time Login Code');
        });
    }

    public function verify(User $user, string $inputCode): bool
    {
        if (!$user->two_factor_code || !$user->two_factor_expires_at) {
            return false;
        }

        if (Carbon::now()->gt($user->two_factor_expires_at)) {
            return false; // expired
        }

        if (!password_verify($inputCode, $user->two_factor_code)) {
            return false;
        }

        // Clear code and mark as verified
        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->{'2fa_verified_at'} = Carbon::now();
        $user->save();

        return true;
    }

    public function hasVerifiedBefore(User $user): bool
    {
        return !is_null($user->{'2fa_verified_at'});
    }
}