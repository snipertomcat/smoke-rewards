<?php

namespace App\Services\Contracts;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CustomerServiceInterface
{
    public function list(array $filters = []): LengthAwarePaginator;

    public function register(array $data, User $actor): Customer;

    public function update(Customer $customer, array $data): Customer;

    public function delete(Customer $customer): void;

    public function findByRfid(string $rfidUid): ?Customer;
}
