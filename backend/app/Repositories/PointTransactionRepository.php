<?php

namespace App\Repositories;

use App\Models\Customer;
use App\Models\PointTransaction;
use App\Repositories\Contracts\PointTransactionRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PointTransactionRepository implements PointTransactionRepositoryInterface
{
    public function forCustomer(Customer $customer, int $perPage = 20): LengthAwarePaginator
    {
        return PointTransaction::where('customer_id', $customer->id)
            ->with('recordedBy:id,name')
            ->latest()
            ->paginate($perPage);
    }

    public function forTenant(int $perPage = 25, array $filters = []): LengthAwarePaginator
    {
        return PointTransaction::with(['customer:id,first_name,last_name', 'recordedBy:id,name'])
            ->when(
                ! empty($filters['type']) && $filters['type'] !== 'all',
                fn ($q) => $q->where('type', $filters['type'])
            )
            ->when(
                ! empty($filters['search']),
                fn ($q) => $q->whereHas('customer', function ($q) use ($filters) {
                    $s = $filters['search'];
                    $q->where('first_name', 'like', "%{$s}%")
                      ->orWhere('last_name', 'like', "%{$s}%")
                      ->orWhere('email', 'like', "%{$s}%");
                })
            )
            ->latest()
            ->paginate($perPage);
    }

    public function create(array $data): PointTransaction
    {
        return PointTransaction::create($data);
    }

    public function adjustCustomerBalance(int $customerId, int $delta): int
    {
        // Use a raw increment/decrement to avoid race conditions.
        // We bypass global scope here because we have the explicit ID.
        DB::table('customers')
            ->where('id', $customerId)
            ->increment('points_balance', $delta);

        return (int) DB::table('customers')
            ->where('id', $customerId)
            ->value('points_balance');
    }
}
