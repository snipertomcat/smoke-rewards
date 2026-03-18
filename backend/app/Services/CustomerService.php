<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\User;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use App\Services\Contracts\CustomerServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerService implements CustomerServiceInterface
{
    public function __construct(
        private readonly CustomerRepositoryInterface $customerRepository
    ) {}

    public function list(array $filters = []): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 20);

        return $this->customerRepository->paginate($perPage, $filters);
    }

    public function register(array $data, User $actor): Customer
    {
        return $this->customerRepository->create([
            'tenant_id'     => $actor->tenant_id,
            'registered_by' => $actor->id,
            'first_name'    => $data['first_name'] ?? null,
            'last_name'     => $data['last_name'] ?? null,
            'email'         => $data['email'] ?? null,
            'phone'         => $data['phone'] ?? null,
            'rfid_uid'      => $data['rfid_uid'] ?? null,
        ]);
    }

    public function update(Customer $customer, array $data): Customer
    {
        return $this->customerRepository->update($customer, $data);
    }

    public function delete(Customer $customer): void
    {
        $this->customerRepository->delete($customer);
    }

    public function findByRfid(string $rfidUid): ?Customer
    {
        return $this->customerRepository->findByRfid($rfidUid);
    }
}
