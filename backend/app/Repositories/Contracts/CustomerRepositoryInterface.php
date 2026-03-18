<?php

namespace App\Repositories\Contracts;

use App\Models\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CustomerRepositoryInterface
{
    public function paginate(int $perPage = 20, array $filters = []): LengthAwarePaginator;

    public function findById(int $id): Customer;

    public function findByRfid(string $rfidUid): ?Customer;

    public function create(array $data): Customer;

    public function update(Customer $customer, array $data): Customer;

    public function delete(Customer $customer): void;
}
