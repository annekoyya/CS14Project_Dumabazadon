<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\TwoFactorService;

class Check2fa
{
    public function __construct(protected TwoFactorService $twoFactorService) {}

    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // Only enforce 2FA if user has never verified before
        $needsVerification = !$this->twoFactorService->hasVerifiedBefore($user)
            && !$request->session()->get('2fa_passed');

        if ($needsVerification) {
            // Don't redirect if already on 2FA routes
            if (!$request->routeIs('2fa.show') && !$request->routeIs('2fa.verify') && !$request->routeIs('2fa.resend')) {
                return redirect()->route('2fa.show');
            }
        }

        return $next($request);
    }
}