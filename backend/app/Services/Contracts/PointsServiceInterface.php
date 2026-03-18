<?php

namespace App\Services\Contracts;

use App\Models\Customer;
use App\Models\PointTransaction;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PointsServiceInterface
{
    public function listForCustomer(Customer $customer, int $perPage = 20): LengthAwarePaginator;

    public function listForTenant(int $perPage = 25, array $filters = []): LengthAwarePaginator;

    public function earnFromPurchase(Purchase $purchase, User $actor): PointTransaction;

    public function adjust(
        Customer $customer,
        int $points,
        string $type,
        string $notes,
        User $actor
    ): PointTransaction;
}
