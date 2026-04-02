<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::withoutTrashed()
            ->with('tenant:id,name')
            ->where('role', '!=', 'super_admin')
            ->when($request->search, function ($q, $s) {
                $q->where(fn ($q) => $q->where('name', 'like', "%{$s}%")
                                       ->orWhere('email', 'like', "%{$s}%"));
            })
            ->when($request->tenant_id, fn ($q, $id) => $q->where('tenant_id', $id))
            ->orderByDesc('created_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $role = $request->input('role');

        $data = $request->validate([
            'tenant_id' => [$role === 'salesman' ? 'nullable' : 'required', 'exists:tenants,id'],
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'unique:users,email'],
            'password'  => ['required', 'string', 'min:8'],
            'role'      => ['required', 'in:admin,staff,salesman'],
        ]);

        $user = User::create($data);
        $user->load('tenant:id,name');

        return response()->json(['data' => $user], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::where('role', '!=', 'super_admin')->findOrFail($id);

        $data = $request->validate([
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', 'unique:users,email,' . $id],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
        ]);

        if (array_key_exists('password', $data) && ! $data['password']) {
            unset($data['password']);
        }

        $user->update($data);
        $user->load('tenant:id,name');

        return response()->json(['data' => $user->fresh(['tenant'])]);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::where('role', '!=', 'super_admin')->findOrFail($id);
        $user->delete();

        return response()->json(null, 204);
    }
}
