<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        $secret = config('services.stripe.webhook_secret');
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (SignatureVerificationException $e) {
            return response('Invalid signature', 400);
        } catch (\UnexpectedValueException $e) {
            return response('Invalid payload', 400);
        }

        match ($event->type) {
            'invoice.payment_succeeded' => $this->handleInvoicePaid($event->data->object),
            'invoice.payment_failed'    => $this->handleInvoiceFailed($event->data->object),
            'customer.subscription.updated' => $this->handleSubscriptionUpdated($event->data->object),
            'customer.subscription.deleted' => $this->handleSubscriptionDeleted($event->data->object),
            default => null,
        };

        return response('OK', 200);
    }

    private function handleInvoicePaid(object $invoice): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $invoice->subscription)->first();

        if (! $subscription) {
            return;
        }

        // Update or create the transaction record
        BillingTransaction::updateOrCreate(
            ['stripe_invoice_id' => $invoice->id],
            [
                'tenant_id'               => $subscription->tenant_id,
                'subscription_id'         => $subscription->id,
                'stripe_payment_intent_id' => $invoice->payment_intent,
                'amount'                  => $invoice->amount_paid / 100,
                'currency'                => $invoice->currency,
                'status'                  => 'paid',
                'description'             => "Subscription payment: {$subscription->plan_name}",
                'processed_at'            => now(),
            ]
        );

        $subscription->update(['status' => 'active']);
    }

    private function handleInvoiceFailed(object $invoice): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $invoice->subscription)->first();

        if (! $subscription) {
            return;
        }

        BillingTransaction::updateOrCreate(
            ['stripe_invoice_id' => $invoice->id],
            [
                'tenant_id'               => $subscription->tenant_id,
                'subscription_id'         => $subscription->id,
                'stripe_payment_intent_id' => $invoice->payment_intent,
                'amount'                  => $invoice->amount_due / 100,
                'currency'                => $invoice->currency,
                'status'                  => 'failed',
                'description'             => "Failed payment: {$subscription->plan_name}",
            ]
        );

        $subscription->update(['status' => 'past_due']);
    }

    private function handleSubscriptionUpdated(object $stripeSubscription): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();

        if (! $subscription) {
            return;
        }

        $subscription->update([
            'status'               => $stripeSubscription->status,
            'current_period_start' => now()->createFromTimestamp($stripeSubscription->current_period_start),
            'current_period_end'   => now()->createFromTimestamp($stripeSubscription->current_period_end),
        ]);
    }

    private function handleSubscriptionDeleted(object $stripeSubscription): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();

        if (! $subscription) {
            return;
        }

        $subscription->update([
            'status'      => 'canceled',
            'canceled_at' => now(),
        ]);
    }
}
