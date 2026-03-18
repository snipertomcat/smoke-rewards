<?php

namespace App\Services;

use App\Repositories\Contracts\StatisticsRepositoryInterface;
use App\Services\Contracts\StatisticsServiceInterface;

class StatisticsService implements StatisticsServiceInterface
{
    public function __construct(
        private readonly StatisticsRepositoryInterface $statisticsRepository
    ) {}

    public function getSummary(): array
    {
        return [
            'total_customers' => $this->statisticsRepository->getTotalCustomers(),
            'total_points_issued' => $this->statisticsRepository->getTotalPointsIssued(),
            'total_points_outstanding' => $this->statisticsRepository->getTotalPointsOutstanding(),
            'purchases_this_month' => $this->statisticsRepository->getPurchasesThisMonth(),
            'revenue_this_month' => $this->statisticsRepository->getRevenueThisMonth(),
        ];
    }

    public function getTopCustomers(int $limit = 10): array
    {
        return $this->statisticsRepository->getTopCustomers($limit)->toArray();
    }

    public function getPurchaseTrend(int $months = 6): array
    {
        return $this->statisticsRepository->getPurchaseTrend($months)->toArray();
    }
}
