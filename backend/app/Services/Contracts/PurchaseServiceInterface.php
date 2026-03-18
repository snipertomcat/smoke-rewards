<?php

namespace App\Services\Contracts;

use App\Models\Customer;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PurchaseServiceInterface
{
    public function listForCustomer(Customer $customer, int $perPage = 15): LengthAwarePaginator;

    public function record(Customer $customer, array $data, User $actor): Purchase;
}
