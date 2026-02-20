<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckSessionTimeout
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $timeout = config('session.lifetime') * 60; // seconds
            $lastActivity = session('last_activity_time');

            if ($lastActivity && (time() - $lastActivity) > $timeout) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return redirect('/login')->withErrors(['error' => 'You have been logged out due to inactivity.']);
            }

            session(['last_activity_time' => time()]);
        }

        return $next($request);
    }
}