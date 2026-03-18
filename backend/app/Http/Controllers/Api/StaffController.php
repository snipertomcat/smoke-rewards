<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\PointTransaction;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;

class StaffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $staff = User::where('tenant_id', $tenantId)
            ->where('role', '!=', 'super_admin')
            ->when($request->search, fn ($q, $s) =>
                $q->where(fn ($q) => $q->where('name', 'like', "%{$s}%")
                                       ->orWhere('email', 'like', "%{$s}%"))
            )
            ->orderBy('name')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json($staff);
    }

    public function stats(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $staffList = User::where('tenant_id', $tenantId)
            ->where('role', '!=', 'super_admin')
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        $staffIds = $staffList->pluck('id');

        // Customers registered per staff member
        $customersRegistered = Customer::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->whereIn('registered_by', $staffIds)
            ->select('registered_by', DB::raw('COUNT(*) as count'))
            ->groupBy('registered_by')
            ->pluck('count', 'registered_by');

        // Purchases recorded per staff member
        $purchasesRecorded = Purchase::where('tenant_id', $tenantId)
            ->whereIn('recorded_by', $staffIds)
            ->select('recorded_by',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(amount) as revenue'),
                DB::raw('MAX(purchased_at) as last_sale')
            )
            ->groupBy('recorded_by')
            ->get()
            ->keyBy('recorded_by');

        // Point adjustments/redemptions per staff member
        $adjustments = PointTransaction::where('tenant_id', $tenantId)
            ->whereIn('recorded_by', $staffIds)
            ->whereIn('type', ['manual_adjust', 'redemption'])
            ->select('recorded_by', DB::raw('COUNT(*) as count'))
            ->groupBy('recorded_by')
            ->pluck('count', 'recorded_by');

        $data = $staffList->map(function (User $user) use (
            $customersRegistered,
            $purchasesRecorded,
            $adjustments
        ) {
            $purchase = $purchasesRecorded->get($user->id);

            return [
                'id'                   => $user->id,
                'name'                 => $user->name,
                'email'                => $user->email,
                'role'                 => $user->role,
                'created_at'           => $user->created_at->toISOString(),
                'customers_registered' => (int) ($customersRegistered[$user->id] ?? 0),
                'purchases_recorded'   => (int) ($purchase?->count ?? 0),
                'revenue_recorded'     => (string) ($purchase?->revenue ?? '0.00'),
                'adjustments_recorded' => (int) ($adjustments[$user->id] ?? 0),
                'last_sale_at'         => $purchase?->last_sale,
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::min(8)],
            'role'     => ['required', 'in:admin,staff'],
        ]);

        $user = User::create([
            'tenant_id' => $request->user()->tenant_id,
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => $data['password'],
            'role'      => $data['role'],
        ]);

        return response()->json(['data' => $user], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $user = User::where('tenant_id', $tenantId)
            ->where('role', '!=', 'super_admin')
            ->findOrFail($id);

        $data = $request->validate([
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['sometimes', Password::min(8)],
            'role'     => ['sometimes', 'in:admin,staff'],
        ]);

        $user->update($data);

        return response()->json(['data' => $user->fresh()]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        // Prevent self-deletion
        if ($request->user()->id === $id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user = User::where('tenant_id', $tenantId)
            ->where('role', '!=', 'super_admin')
            ->findOrFail($id);

        $user->delete();

        return response()->json(null, 204);
    }
}
