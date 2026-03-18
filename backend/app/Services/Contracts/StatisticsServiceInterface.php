<?php

namespace App\Services\Contracts;

interface StatisticsServiceInterface
{
    public function getSummary(): array;

    public function getTopCustomers(int $limit = 10): array;

    public function getPurchaseTrend(int $months = 6): array;
}
