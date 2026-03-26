<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        /** @var User $user */
        $user = Auth::user();
        $user->load('tenant:id,name,slug,logo_url,settings');

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => array_merge($this->serializeUser($user), ['token' => $token]),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('tenant:id,name,slug,logo_url,settings');

        return response()->json($this->serializeUser($user));
    }

    private function serializeUser(User $user): array
    {
        return [
            'id'     => $user->id,
            'name'   => $user->name,
            'email'  => $user->email,
            'role'   => $user->role,
            'tenant' => $user->tenant ? [
                'id'       => $user->tenant->id,
                'name'     => $user->tenant->name,
                'slug'     => $user->tenant->slug,
                'logo_url' => $user->tenant->logo_url,
                'settings' => $user->tenant->settings,
            ] : null,
        ];
    }
}
