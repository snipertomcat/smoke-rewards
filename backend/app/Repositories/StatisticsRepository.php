<?php

namespace App\Repositories;

use App\Models\Customer;
use App\Models\PointTransaction;
use App\Models\Purchase;
use App\Repositories\Contracts\StatisticsRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StatisticsRepository implements StatisticsRepositoryInterface
{
    public function getTotalCustomers(): int
    {
        return Customer::count();
    }

    public function getTotalPointsIssued(): int
    {
        return (int) PointTransaction::where('points', '>', 0)->sum('points');
    }

    public function getTotalPointsOutstanding(): int
    {
        return (int) Customer::sum('points_balance');
    }

    public function getPurchasesThisMonth(): int
    {
        return Purchase::whereBetween('purchased_at', [
            now()->startOfMonth(),
            now()->endOfMonth(),
        ])->count();
    }

    public function getRevenueThisMonth(): string
    {
        return number_format(
            (float) Purchase::whereBetween('purchased_at', [
                now()->startOfMonth(),
                now()->endOfMonth(),
            ])->sum('amount'),
            2,
            '.',
            ''
        );
    }

    public function getTopCustomers(int $limit = 10): Collection
    {
        return Customer::orderByDesc('points_balance')
            ->limit($limit)
            ->get(['id', 'first_name', 'last_name', 'email', 'phone', 'points_balance']);
    }

    public function getPurchaseTrend(int $months = 6): Collection
    {
        $tenantId = app('current.tenant.id');

        return collect(
            DB::select(
                "SELECT
                    DATE_FORMAT(purchased_at, '%Y-%m') AS month,
                    COUNT(*) AS purchase_count,
                    SUM(amount) AS revenue,
                    SUM(points_earned) AS points_issued
                 FROM purchases
                 WHERE tenant_id = ?
                   AND deleted_at IS NULL
                   AND purchased_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
                 GROUP BY month
                 ORDER BY month ASC",
                [$tenantId, $months]
            )
        );
    }
}
