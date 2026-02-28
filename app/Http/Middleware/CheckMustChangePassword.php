<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckMustChangePassword
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        if ($user->must_change_password) {
            // Allow only the change-password routes through
            if (!$request->routeIs('password.change') && !$request->routeIs('password.update')) {
                return redirect()->route('password.change');
            }
        }

        return $next($request);
    }
}