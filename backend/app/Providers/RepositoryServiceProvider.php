<?php

namespace App\Providers;

use App\Repositories\Contracts\CustomerRepositoryInterface;
use App\Repositories\Contracts\PointTransactionRepositoryInterface;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use App\Repositories\Contracts\StatisticsRepositoryInterface;
use App\Repositories\CustomerRepository;
use App\Repositories\PointTransactionRepository;
use App\Repositories\PurchaseRepository;
use App\Repositories\StatisticsRepository;
use App\Services\Contracts\CustomerServiceInterface;
use App\Services\Contracts\PointsServiceInterface;
use App\Services\Contracts\PurchaseServiceInterface;
use App\Services\Contracts\StatisticsServiceInterface;
use App\Services\CustomerService;
use App\Services\PointsService;
use App\Services\PurchaseService;
use App\Services\StatisticsService;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Repositories
        $this->app->bind(CustomerRepositoryInterface::class, CustomerRepository::class);
        $this->app->bind(PurchaseRepositoryInterface::class, PurchaseRepository::class);
        $this->app->bind(PointTransactionRepositoryInterface::class, PointTransactionRepository::class);
        $this->app->bind(StatisticsRepositoryInterface::class, StatisticsRepository::class);

        // Services
        $this->app->bind(CustomerServiceInterface::class, CustomerService::class);
        $this->app->bind(PointsServiceInterface::class, PointsService::class);
        $this->app->bind(PurchaseServiceInterface::class, PurchaseService::class);
        $this->app->bind(StatisticsServiceInterface::class, StatisticsService::class);
    }
}
