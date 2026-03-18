<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $customers = Customer::withoutGlobalScopes()
            ->with('tenant:id,name')
            ->when($request->search, function ($q, $s) {
                $q->where(function ($q) use ($s) {
                    $q->where('first_name', 'like', "%{$s}%")
                      ->orWhere('last_name', 'like', "%{$s}%")
                      ->orWhere('email', 'like', "%{$s}%")
                      ->orWhere('phone', 'like', "%{$s}%");
                });
            })
            ->when($request->tenant_id, fn ($q, $id) => $q->where('tenant_id', $id))
            ->orderByDesc('created_at')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json($customers);
    }

    public function show(int $id): JsonResponse
    {
        $customer = Customer::withoutGlobalScopes()
            ->with(['tenant:id,name', 'purchases' => fn ($q) => $q->latest('purchased_at')->limit(10)])
            ->findOrFail($id);

        return response()->json(['data' => $customer]);
    }

    public function destroy(int $id): JsonResponse
    {
        $customer = Customer::withoutGlobalScopes()->findOrFail($id);
        $customer->delete();

        return response()->json(null, 204);
    }
}
