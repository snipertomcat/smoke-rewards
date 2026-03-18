<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->tenant) {
            return response()->json([
                'message' => 'No shop is associated with your account.',
            ], 403);
        }

        if ($user && ! $user->tenant->is_active) {
            return response()->json([
                'message' => 'Your account has been suspended. Please contact support.',
            ], 403);
        }

        return $next($request);
    }
}
