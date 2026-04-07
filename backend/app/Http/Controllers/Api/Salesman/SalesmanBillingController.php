<?php

namespace App\Http\Controllers\Api\Salesman;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class SalesmanBillingController extends Controller
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * List all subscriptions for tenants, optionally filtered by tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Subscription::with(['tenant:id,name,slug', 'createdBy:id,name'])
            ->withCount('transactions')
            ->orderByDesc('created_at');

        if ($request->tenant_id) {
            $query->where('tenant_id', $request->tenant_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $subscriptions = $query->paginate((int) ($request->per_page ?? 20));

        return response()->json($subscriptions);
    }

    /**
     * Create a new subscription for a tenant.
     * Expects: tenant_id, plan_name, amount, payment_method_id
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tenant_id'         => ['required', 'integer', 'exists:tenants,id'],
            'plan_name'         => ['required', 'string', 'max:255'],
            'amount'            => ['required', 'numeric', 'min:0.50'],
            'payment_method_id' => ['required', 'string'],
        ]);

        $tenant = Tenant::findOrFail($data['tenant_id']);

        // Create or retrieve Stripe customer for this tenant
        if (! $tenant->stripe_customer_id) {
            $customer = $this->stripe->customers->create([
                'name'  => $tenant->name,
                'email' => $tenant->email ?? null,
                'metadata' => ['tenant_id' => $tenant->id],
            ]);
            $tenant->update(['stripe_customer_id' => $customer->id]);
        } else {
            $customer = $this->stripe->customers->retrieve($tenant->stripe_customer_id);
        }

        // Attach payment method to customer and set as default
        $this->stripe->paymentMethods->attach($data['payment_method_id'], [
            'customer' => $customer->id,
        ]);

        $this->stripe->customers->update($customer->id, [
            'invoice_settings' => ['default_payment_method' => $data['payment_method_id']],
        ]);

        // Create a Stripe product for this plan, then reference it in price_data
        $product = $this->stripe->products->create([
            'name'     => $data['plan_name'],
            'metadata' => ['tenant_id' => $tenant->id],
        ]);

        // Create subscription using the product ID
        $stripeSubscription = $this->stripe->subscriptions->create([
            'customer' => $customer->id,
            'items'    => [[
                'price_data' => [
                    'currency'    => 'usd',
                    'unit_amount' => (int) round($data['amount'] * 100),
                    'recurring'   => ['interval' => 'month'],
                    'product'     => $product->id,
                ],
            ]],
            'default_payment_method' => $data['payment_method_id'],
            'payment_behavior'       => 'default_incomplete',
            'payment_settings'       => ['save_default_payment_method' => 'on_subscription'],
            'expand'                 => ['latest_invoice.payment_intent'],
        ]);

        // Store subscription locally
        $subscription = Subscription::create([
            'tenant_id'              => $tenant->id,
            'created_by'             => $request->user()->id,
            'stripe_subscription_id' => $stripeSubscription->id,
            'stripe_customer_id'     => $customer->id,
            'plan_name'              => $data['plan_name'],
            'amount'                 => $data['amount'],
            'status'                 => $stripeSubscription->status,
            'current_period_start'   => $stripeSubscription->current_period_start ? now()->createFromTimestamp($stripeSubscription->current_period_start) : null,
            'current_period_end'     => $stripeSubscription->current_period_end ? now()->createFromTimestamp($stripeSubscription->current_period_end) : null,
        ]);

        // Create initial transaction record
        $invoice = $stripeSubscription->latest_invoice;
        if ($invoice) {
            BillingTransaction::create([
                'tenant_id'               => $tenant->id,
                'subscription_id'         => $subscription->id,
                'stripe_invoice_id'       => $invoice->id,
                'stripe_payment_intent_id' => $invoice->payment_intent?->id,
                'amount'                  => $data['amount'],
                'currency'                => 'usd',
                'status'                  => 'pending',
                'description'             => "Subscription: {$data['plan_name']}",
            ]);
        }

        $clientSecret = $invoice?->payment_intent?->client_secret;

        return response()->json([
            'data' => $subscription->load(['tenant:id,name', 'createdBy:id,name']),
            'client_secret' => $clientSecret,
        ], 201);
    }

    /**
     * Get a single subscription.
     */
    public function show(int $id): JsonResponse
    {
        $subscription = Subscription::with(['tenant:id,name,slug', 'createdBy:id,name'])
            ->withCount('transactions')
            ->findOrFail($id);

        return response()->json(['data' => $subscription]);
    }

    /**
     * Cancel a subscription.
     */
    public function cancel(int $id): JsonResponse
    {
        $subscription = Subscription::findOrFail($id);

        if ($subscription->stripe_subscription_id) {
            $this->stripe->subscriptions->cancel($subscription->stripe_subscription_id);
        }

        $subscription->update([
            'status'      => 'canceled',
            'canceled_at' => now(),
        ]);

        return response()->json(['data' => $subscription->fresh(['tenant:id,name'])]);
    }

    /**
     * Confirm payment after 3DS (called by frontend after stripe.confirmCardPayment).
     */
    public function confirmPayment(Request $request, int $id): JsonResponse
    {
        $subscription = Subscription::findOrFail($id);

        if (! $subscription->stripe_subscription_id) {
            return response()->json(['message' => 'No Stripe subscription found.'], 422);
        }

        $stripeSubscription = $this->stripe->subscriptions->retrieve(
            $subscription->stripe_subscription_id,
            ['expand' => ['latest_invoice.payment_intent']]
        );

        $subscription->update(['status' => $stripeSubscription->status]);

        // Update related transaction
        $invoice = $stripeSubscription->latest_invoice;
        if ($invoice && $invoice->payment_intent) {
            $piStatus = $invoice->payment_intent->status;
            $txStatus = $piStatus === 'succeeded' ? 'paid' : ($piStatus === 'canceled' ? 'failed' : 'pending');

            BillingTransaction::where('subscription_id', $subscription->id)
                ->where('status', 'pending')
                ->update([
                    'status'       => $txStatus,
                    'processed_at' => $txStatus === 'paid' ? now() : null,
                ]);
        }

        return response()->json(['data' => $subscription->fresh(['tenant:id,name'])]);
    }

    /**
     * Charge a one-time fee (setup, training, etc.) — not subscription-based.
     * Expects: tenant_id, description, amount, payment_method_id
     */
    public function chargeOnce(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tenant_id'         => ['required', 'integer', 'exists:tenants,id'],
            'description'       => ['required', 'string', 'max:255'],
            'amount'            => ['required', 'numeric', 'min:0.50'],
            'payment_method_id' => ['required', 'string'],
        ]);

        $tenant = Tenant::findOrFail($data['tenant_id']);

        // Create or retrieve Stripe customer
        if (! $tenant->stripe_customer_id) {
            $customer = $this->stripe->customers->create([
                'name'     => $tenant->name,
                'email'    => $tenant->email ?? null,
                'metadata' => ['tenant_id' => $tenant->id],
            ]);
            $tenant->update(['stripe_customer_id' => $customer->id]);
        } else {
            $customer = $this->stripe->customers->retrieve($tenant->stripe_customer_id);
        }

        // Create and confirm a one-time PaymentIntent
        $paymentIntent = $this->stripe->paymentIntents->create([
            'amount'               => (int) round($data['amount'] * 100),
            'currency'             => 'usd',
            'customer'             => $customer->id,
            'payment_method'       => $data['payment_method_id'],
            'payment_method_types' => ['card'],
            'description'          => $data['description'],
            'confirm'              => true,
        ]);

        $status = match ($paymentIntent->status) {
            'succeeded'        => 'paid',
            'requires_action'  => 'pending',
            default            => 'failed',
        };

        $transaction = BillingTransaction::create([
            'tenant_id'               => $tenant->id,
            'subscription_id'         => null,
            'stripe_payment_intent_id' => $paymentIntent->id,
            'amount'                  => $data['amount'],
            'currency'                => 'usd',
            'status'                  => $status,
            'description'             => $data['description'],
            'processed_at'            => $status === 'paid' ? now() : null,
        ]);

        return response()->json([
            'data'          => $transaction->load('tenant:id,name'),
            'client_secret' => $paymentIntent->status === 'requires_action'
                ? $paymentIntent->client_secret
                : null,
        ], 201);
    }

    /**
     * All billing transactions for salesman's scope.
     */
    public function transactions(Request $request): JsonResponse
    {
        $query = BillingTransaction::with(['tenant:id,name', 'subscription:id,plan_name,amount'])
            ->orderByDesc('created_at');

        if ($request->tenant_id) {
            $query->where('tenant_id', $request->tenant_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $transactions = $query->paginate((int) ($request->per_page ?? 20));

        return response()->json($transactions);
    }

    /**
     * Billing stats for the salesman dashboard.
     */
    public function stats(): JsonResponse
    {
        $activeSubscriptions = Subscription::where('status', 'active')->count();
        $mrr = Subscription::where('status', 'active')->sum('amount');
        $totalRevenue = BillingTransaction::where('status', 'paid')->sum('amount');
        $revenueThisMonth = BillingTransaction::where('status', 'paid')
            ->whereMonth('processed_at', now()->month)
            ->whereYear('processed_at', now()->year)
            ->sum('amount');
        $failedThisMonth = BillingTransaction::where('status', 'failed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return response()->json([
            'data' => [
                'active_subscriptions' => $activeSubscriptions,
                'mrr'                  => (string) $mrr,
                'total_revenue'        => (string) $totalRevenue,
                'revenue_this_month'   => (string) $revenueThisMonth,
                'failed_this_month'    => $failedThisMonth,
            ],
        ]);
    }
}
