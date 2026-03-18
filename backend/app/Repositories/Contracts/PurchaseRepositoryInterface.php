<?php

namespace App\Repositories\Contracts;

use App\Models\Customer;
use App\Models\Purchase;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PurchaseRepositoryInterface
{
    public function forCustomer(Customer $customer, int $perPage = 15): LengthAwarePaginator;

    public function create(array $data): Purchase;
}
