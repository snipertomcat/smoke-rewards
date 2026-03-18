<?php

namespace App\Repositories;

use App\Models\Customer;
use App\Models\Purchase;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PurchaseRepository implements PurchaseRepositoryInterface
{
    public function forCustomer(Customer $customer, int $perPage = 15): LengthAwarePaginator
    {
        return Purchase::where('customer_id', $customer->id)
            ->with('recordedBy:id,name')
            ->latest('purchased_at')
            ->paginate($perPage);
    }

    public function create(array $data): Purchase
    {
        return Purchase::create($data);
    }
}
