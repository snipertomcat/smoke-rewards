<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\PointTransaction;
use App\Models\Purchase;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'total_tenants'            => Tenant::count(),
                'active_tenants'           => Tenant::where('is_active', true)->count(),
                'total_customers'          => Customer::withoutGlobalScopes()->count(),
                'total_users'              => User::where('role', '!=', 'super_admin')->count(),
                'total_purchases'          => Purchase::withoutGlobalScopes()->count(),
                'total_revenue'            => (string) Purchase::withoutGlobalScopes()->sum('amount'),
                'total_points_issued'      => (int) PointTransaction::withoutGlobalScopes()
                                                ->where('points', '>', 0)->sum('points'),
                'total_points_outstanding' => (int) Customer::withoutGlobalScopes()->sum('points_balance'),
                'purchases_this_month'     => Purchase::withoutGlobalScopes()
                                                ->whereMonth('purchased_at', now()->month)
                                                ->whereYear('purchased_at', now()->year)
                                                ->count(),
                'revenue_this_month'       => (string) Purchase::withoutGlobalScopes()
                                                ->whereMonth('purchased_at', now()->month)
                                                ->whereYear('purchased_at', now()->year)
                                                ->sum('amount'),
            ],
        ]);
    }

    public function purchaseTrend(Request $request): JsonResponse
    {
        $months = min((int) ($request->months ?? 6), 24);

        $trend = Purchase::withoutGlobalScopes()
            ->select(
                DB::raw('DATE_FORMAT(purchased_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(amount) as revenue')
            )
            ->where('purchased_at', '>=', now()->subMonths($months)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json(['data' => $trend]);
    }

    public function topTenants(Request $request): JsonResponse
    {
        $limit = min((int) ($request->limit ?? 10), 50);

        $tenants = Tenant::withCount(['customers' => fn ($q) => $q->withoutGlobalScopes()])
            ->withSum(['purchases' => fn ($q) => $q->withoutGlobalScopes()], 'amount')
            ->orderByDesc('purchases_sum_amount')
            ->limit($limit)
            ->get(['id', 'name', 'slug', 'is_active']);

        return response()->json(['data' => $tenants]);
    }

    public function recentActivity(): JsonResponse
    {
        $purchases = Purchase::withoutGlobalScopes()
            ->with(['customer:id,first_name,last_name', 'tenant:id,name'])
            ->latest('purchased_at')
            ->limit(20)
            ->get(['id', 'tenant_id', 'customer_id', 'amount', 'points_earned', 'purchased_at']);

        return response()->json(['data' => $purchases]);
    }
}
