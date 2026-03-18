<?php

namespace App\Repositories;

use App\Models\Customer;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerRepository implements CustomerRepositoryInterface
{
    public function paginate(int $perPage = 20, array $filters = []): LengthAwarePaginator
    {
        $query = Customer::query()->latest();

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('rfid_uid', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function findById(int $id): Customer
    {
        return Customer::findOrFail($id);
    }

    public function findByRfid(string $rfidUid): ?Customer
    {
        return Customer::where('rfid_uid', $rfidUid)->first();
    }

    public function create(array $data): Customer
    {
        return Customer::create($data);
    }

    public function update(Customer $customer, array $data): Customer
    {
        $customer->update($data);

        return $customer->fresh();
    }

    public function delete(Customer $customer): void
    {
        $customer->delete();
    }
}
