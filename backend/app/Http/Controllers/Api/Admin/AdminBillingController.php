<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBillingController extends Controller
{
    /**
     * List all subscriptions system-wide.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Subscription::with(['tenant:id,name,slug', 'createdBy:id,name'])
            ->withCount('transactions')
            ->orderByDesc('created_at');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->whereHas('tenant', fn ($q) => $q->where('name', 'like', "%{$request->search}%"));
        }

        $subscriptions = $query->paginate((int) ($request->per_page ?? 20));

        return response()->json($subscriptions);
    }

    /**
     * All billing transactions system-wide.
     */
    public function transactions(Request $request): JsonResponse
    {
        $query = BillingTransaction::with(['tenant:id,name', 'subscription:id,plan_name,amount'])
            ->orderByDesc('created_at');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->tenant_id) {
            $query->where('tenant_id', $request->tenant_id);
        }

        if ($request->search) {
            $query->whereHas('tenant', fn ($q) => $q->where('name', 'like', "%{$request->search}%"));
        }

        $transactions = $query->paginate((int) ($request->per_page ?? 20));

        return response()->json($transactions);
    }

    /**
     * Billing stats for admin dashboard.
     */
    public function stats(): JsonResponse
    {
        $activeSubscriptions = Subscription::where('status', 'active')->count();
        $totalSubscriptions  = Subscription::count();
        $mrr                 = Subscription::where('status', 'active')->sum('amount');
        $totalRevenue        = BillingTransaction::where('status', 'paid')->sum('amount');
        $revenueThisMonth    = BillingTransaction::where('status', 'paid')
            ->whereMonth('processed_at', now()->month)
            ->whereYear('processed_at', now()->year)
            ->sum('amount');
        $failedPayments      = BillingTransaction::where('status', 'failed')->count();
        $canceledThisMonth   = Subscription::where('status', 'canceled')
            ->whereMonth('canceled_at', now()->month)
            ->whereYear('canceled_at', now()->year)
            ->count();

        return response()->json([
            'data' => [
                'active_subscriptions' => $activeSubscriptions,
                'total_subscriptions'  => $totalSubscriptions,
                'mrr'                  => (string) $mrr,
                'total_revenue'        => (string) $totalRevenue,
                'revenue_this_month'   => (string) $revenueThisMonth,
                'failed_payments'      => $failedPayments,
                'canceled_this_month'  => $canceledThisMonth,
            ],
        ]);
    }
}
