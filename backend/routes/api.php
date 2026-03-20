<?php

use App\Http\Controllers\Api\Admin\AdminCustomerController;
use App\Http\Controllers\Api\Admin\AdminStatsController;
use App\Http\Controllers\Api\Admin\AdminTenantController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\PointTransactionController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\StatisticsController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\TenantLogoController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Middleware\EnsureIsAdmin;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\EnsureTenantIsActive;
use App\Http\Middleware\SetTenantScope;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public
    Route::post('/login', [AuthController::class, 'login']);

    // Shared auth (logout + me work for all roles)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // Super-admin routes
    Route::middleware(['auth:sanctum', EnsureSuperAdmin::class])
        ->prefix('admin')
        ->group(function () {
            // System stats
            Route::get('stats', [AdminStatsController::class, 'index']);
            Route::get('stats/purchase-trend', [AdminStatsController::class, 'purchaseTrend']);
            Route::get('stats/top-tenants', [AdminStatsController::class, 'topTenants']);
            Route::get('stats/recent-activity', [AdminStatsController::class, 'recentActivity']);

            // Tenants (shops)
            Route::apiResource('tenants', AdminTenantController::class);

            // Customers (cross-tenant)
            Route::get('customers', [AdminCustomerController::class, 'index']);
            Route::get('customers/{id}', [AdminCustomerController::class, 'show']);
            Route::delete('customers/{id}', [AdminCustomerController::class, 'destroy']);

            // Users
            Route::get('users', [AdminUserController::class, 'index']);
            Route::post('users', [AdminUserController::class, 'store']);
            Route::delete('users/{id}', [AdminUserController::class, 'destroy']);
        });

    // Tenant-scoped protected routes
    Route::middleware(['auth:sanctum', SetTenantScope::class, EnsureTenantIsActive::class])
        ->group(function () {
            // RFID lookup (before apiResource to avoid route conflicts)
            Route::get('customers/lookup/{rfid_uid}', [CustomerController::class, 'lookupByRfid']);

            // Customers
            Route::apiResource('customers', CustomerController::class);

            // Per-customer sub-resources
            Route::get('customers/{customer}/purchases', [PurchaseController::class, 'forCustomer']);
            Route::post('customers/{customer}/purchases', [PurchaseController::class, 'store']);
            Route::get('customers/{customer}/transactions', [PointTransactionController::class, 'forCustomer']);
            Route::post('customers/{customer}/points/adjust', [PointTransactionController::class, 'adjust']);

            // Rewards settings (view for all, update for admins only)
            Route::get('settings', [SettingsController::class, 'show']);
            Route::put('settings', [SettingsController::class, 'update'])->middleware(EnsureIsAdmin::class);

            // Logo (admin only)
            Route::post('tenant/logo', [TenantLogoController::class, 'store'])->middleware(EnsureIsAdmin::class);
            Route::delete('tenant/logo', [TenantLogoController::class, 'destroy'])->middleware(EnsureIsAdmin::class);

            // Store-wide transaction history
            Route::get('transactions', [PointTransactionController::class, 'index']);

            // Staff management (admin only)
            Route::middleware(EnsureIsAdmin::class)->group(function () {
                Route::get('staff', [StaffController::class, 'index']);
                Route::get('staff/stats', [StaffController::class, 'stats']);
                Route::post('staff', [StaffController::class, 'store']);
                Route::put('staff/{id}', [StaffController::class, 'update']);
                Route::delete('staff/{id}', [StaffController::class, 'destroy']);
            });

            // Statistics
            Route::get('statistics', [StatisticsController::class, 'index']);
            Route::get('statistics/top-customers', [StatisticsController::class, 'topCustomers']);
            Route::get('statistics/purchase-trend', [StatisticsController::class, 'purchaseTrend']);
        });
});
