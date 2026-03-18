<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetTenantScope
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($user = $request->user()) {
            app()->instance('current.tenant.id', $user->tenant_id);
        }

        return $next($request);
    }
}
