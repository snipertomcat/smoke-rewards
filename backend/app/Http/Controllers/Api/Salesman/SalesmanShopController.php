<?php

namespace App\Http\Controllers\Api\Salesman;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class SalesmanShopController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenants = Tenant::withCount(['customers' => fn ($q) => $q->withoutGlobalScopes()])
            ->withCount(['users'])
            ->withSum(['purchases' => fn ($q) => $q->withoutGlobalScopes()], 'amount')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json($tenants);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                           => ['required', 'string', 'max:255'],
            'slug'                           => ['required', 'string', 'max:100', 'unique:tenants,slug', 'alpha_dash'],
            'email'                          => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'                       => ['required', Password::min(8)],
            'settings'                       => ['nullable', 'array'],
            'settings.points_per_dollar'     => ['nullable', 'integer', 'min:1'],
            'settings.min_redemption_points' => ['nullable', 'integer', 'min:1'],
        ]);

        $data['settings'] = array_merge([
            'points_per_dollar'      => 1,
            'min_redemption_points'  => 100,
            'points_to_dollar_ratio' => 0.20,
        ], $data['settings'] ?? []);

        $tenant = Tenant::create([
            'name'      => $data['name'],
            'slug'      => $data['slug'],
            'email'     => $data['email'],
            'is_active' => true,
            'settings'  => $data['settings'],
        ]);

        User::create([
            'tenant_id' => $tenant->id,
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => $data['password'],
            'role'      => 'admin',
        ]);

        $tenant->loadCount(['customers' => fn ($q) => $q->withoutGlobalScopes()]);
        $tenant->loadCount('users');

        return response()->json(['data' => $tenant], 201);
    }

    public function show(int $id): JsonResponse
    {
        $tenant = Tenant::withCount(['customers' => fn ($q) => $q->withoutGlobalScopes()])
            ->withCount('users')
            ->with(['users' => fn ($q) => $q->where('role', 'admin')
                ->select('id', 'tenant_id', 'name', 'email', 'role', 'created_at')])
            ->findOrFail($id);

        return response()->json(['data' => $tenant]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);

        $data = $request->validate([
            'name'                           => ['sometimes', 'string', 'max:255'],
            'email'                          => ['nullable', 'email', 'max:255'],
            'is_active'                      => ['sometimes', 'boolean'],
            'settings'                       => ['nullable', 'array'],
            'settings.points_per_dollar'     => ['nullable', 'integer', 'min:1'],
            'settings.min_redemption_points' => ['nullable', 'integer', 'min:1'],
        ]);

        $tenant->update($data);

        return response()->json(['data' => $tenant->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->delete();

        return response()->json(null, 204);
    }

    public function updatePassword(Request $request, int $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);

        $data = $request->validate([
            'password'              => ['required', Password::min(8), 'confirmed'],
            'password_confirmation' => ['required'],
        ]);

        $tenant->users()->where('role', 'admin')->each(function (User $user) use ($data) {
            $user->update(['password' => Hash::make($data['password'])]);
        });

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
