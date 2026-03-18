<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Purchase;
use App\Models\User;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use App\Services\Contracts\PointsServiceInterface;
use App\Services\Contracts\PurchaseServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PurchaseService implements PurchaseServiceInterface
{
    public function __construct(
        private readonly PurchaseRepositoryInterface $purchaseRepository,
        private readonly PointsServiceInterface $pointsService
    ) {}

    public function listForCustomer(Customer $customer, int $perPage = 15): LengthAwarePaginator
    {
        return $this->purchaseRepository->forCustomer($customer, $perPage);
    }

    public function record(Customer $customer, array $data, User $actor): Purchase
    {
        return DB::transaction(function () use ($customer, $data, $actor) {
            $pointsPerDollar = $actor->tenant->getPointsPerDollar();
            $pointsEarned = (int) floor((float) $data['amount'] * $pointsPerDollar);

            $purchase = $this->purchaseRepository->create([
                'tenant_id' => $customer->tenant_id,
                'customer_id' => $customer->id,
                'recorded_by' => $actor->id,
                'amount' => $data['amount'],
                'points_earned' => $pointsEarned,
                'notes' => $data['notes'] ?? null,
                'purchased_at' => $data['purchased_at'] ?? now(),
            ]);

            // Refresh customer for accurate balance before the earn call
            $customer->refresh();

            if ($pointsEarned > 0) {
                $this->pointsService->earnFromPurchase($purchase, $actor);
            }

            // Update last visit timestamp
            $customer->update(['last_visit_at' => $purchase->purchased_at]);

            return $purchase->load('recordedBy:id,name');
        });
    }
}
