<?php

namespace Fruitcake\Cors;

use Closure;

class HandleCors
{
    public function handle($request, Closure $next)
    {
        // Minimal stub to satisfy Intelephense
        return $next($request);
    }
}