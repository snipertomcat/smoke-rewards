<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTenantController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenants = Tenant::withCount(['customers' => fn ($q) => $q->withoutGlobalScopes()])
            ->withCount(['users'])
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json($tenants);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'slug'     => ['required', 'string', 'max:100', 'unique:tenants,slug', 'alpha_dash'],
            'email'    => ['nullable', 'email', 'max:255'],
            'settings' => ['nullable', 'array'],
            'settings.points_per_dollar'     => ['nullable', 'integer', 'min:1'],
            'settings.min_redemption_points' => ['nullable', 'integer', 'min:1'],
        ]);

        $data['settings'] = array_merge([
            'points_per_dollar'      => 1,
            'min_redemption_points'  => 100,
            'points_to_dollar_ratio' => 0.20,
        ], $data['settings'] ?? []);

        $tenant = Tenant::create(array_merge($data, ['is_active' => true]));

        return response()->json(['data' => $tenant], 201);
    }

    public function show(Tenant $tenant): JsonResponse
    {
        $tenant->loadCount(['customers' => fn ($q) => $q->withoutGlobalScopes()]);
        $tenant->loadCount('users');

        return response()->json(['data' => $tenant]);
    }

    public function update(Request $request, Tenant $tenant): JsonResponse
    {
        $data = $request->validate([
            'name'      => ['sometimes', 'string', 'max:255'],
            'email'     => ['nullable', 'email', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
            'settings'  => ['nullable', 'array'],
            'settings.points_per_dollar'     => ['nullable', 'integer', 'min:1'],
            'settings.min_redemption_points' => ['nullable', 'integer', 'min:1'],
        ]);

        $tenant->update($data);

        return response()->json(['data' => $tenant->fresh()]);
    }

    public function destroy(Tenant $tenant): JsonResponse
    {
        $tenant->delete();

        return response()->json(null, 204);
    }
}
