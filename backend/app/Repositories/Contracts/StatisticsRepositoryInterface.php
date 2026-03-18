<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface StatisticsRepositoryInterface
{
    public function getTotalCustomers(): int;

    public function getTotalPointsIssued(): int;

    public function getTotalPointsOutstanding(): int;

    public function getPurchasesThisMonth(): int;

    public function getRevenueThisMonth(): string;

    public function getTopCustomers(int $limit = 10): Collection;

    public function getPurchaseTrend(int $months = 6): Collection;
}
