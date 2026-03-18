<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\PointTransaction;
use App\Models\Purchase;
use App\Models\User;
use App\Repositories\Contracts\PointTransactionRepositoryInterface;
use App\Services\Contracts\PointsServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PointsService implements PointsServiceInterface
{
    public function __construct(
        private readonly PointTransactionRepositoryInterface $transactionRepository
    ) {}

    public function listForCustomer(Customer $customer, int $perPage = 20): LengthAwarePaginator
    {
        return $this->transactionRepository->forCustomer($customer, $perPage);
    }

    public function listForTenant(int $perPage = 25, array $filters = []): LengthAwarePaginator
    {
        return $this->transactionRepository->forTenant($perPage, $filters);
    }

    public function earnFromPurchase(Purchase $purchase, User $actor): PointTransaction
    {
        return DB::transaction(function () use ($purchase, $actor) {
            $newBalance = $this->transactionRepository->adjustCustomerBalance(
                $purchase->customer_id,
                $purchase->points_earned
            );

            return $this->transactionRepository->create([
                'tenant_id' => $purchase->tenant_id,
                'customer_id' => $purchase->customer_id,
                'recorded_by' => $actor->id,
                'points' => $purchase->points_earned,
                'balance_after' => $newBalance,
                'type' => 'purchase_earn',
                'source_type' => Purchase::class,
                'source_id' => $purchase->id,
                'notes' => "Earned from purchase #{$purchase->id}",
            ]);
        });
    }

    public function adjust(
        Customer $customer,
        int $points,
        string $type,
        string $notes,
        User $actor
    ): PointTransaction {
        if ($points === 0) {
            throw new InvalidArgumentException('Point adjustment cannot be zero.');
        }

        if ($points < 0 && $customer->points_balance < abs($points)) {
            throw new InvalidArgumentException(
                "Insufficient points balance. Customer has {$customer->points_balance} points."
            );
        }

        return DB::transaction(function () use ($customer, $points, $type, $notes, $actor) {
            $newBalance = $this->transactionRepository->adjustCustomerBalance($customer->id, $points);

            return $this->transactionRepository->create([
                'tenant_id' => $customer->tenant_id,
                'customer_id' => $customer->id,
                'recorded_by' => $actor->id,
                'points' => $points,
                'balance_after' => $newBalance,
                'type' => $type,
                'notes' => $notes,
            ]);
        });
    }
}
