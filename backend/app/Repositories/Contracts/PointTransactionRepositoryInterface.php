<?php

namespace App\Repositories\Contracts;

use App\Models\Customer;
use App\Models\PointTransaction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PointTransactionRepositoryInterface
{
    public function forCustomer(Customer $customer, int $perPage = 20): LengthAwarePaginator;

    public function forTenant(int $perPage = 25, array $filters = []): LengthAwarePaginator;

    public function create(array $data): PointTransaction;

    /**
     * Atomically update the customer's points_balance by a delta (positive or negative).
     * Returns the new balance.
     */
    public function adjustCustomerBalance(int $customerId, int $delta): int;
}
