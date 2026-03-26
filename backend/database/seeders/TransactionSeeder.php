<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Purchase;
use App\Models\PointTransaction;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Tenant::with('customers')->get() as $tenant) {
            $staff          = User::where('tenant_id', $tenant->id)->get();
            $pointsPerDollar = (int) ($tenant->settings['points_per_dollar'] ?? 1);
            $minRedemption   = (int) ($tenant->settings['min_redemption_points'] ?? 100);

            foreach ($tenant->customers as $customer) {
                $balance       = 0;
                $purchaseCount = rand(4, 14);
                $lastVisit     = null;

                // Spread visits randomly over the last 12 months
                $dates = collect(range(1, $purchaseCount))
                    ->map(fn () => Carbon::now()->subDays(rand(1, 365)))
                    ->sort()
                    ->values();

                foreach ($dates as $date) {
                    $amount       = round(rand(500, 15000) / 100, 2); // $5–$150
                    $pointsEarned = (int) floor($amount * $pointsPerDollar);
                    $balance     += $pointsEarned;
                    $lastVisit    = $date;
                    $recorder     = $staff->random();

                    $purchase = Purchase::create([
                        'tenant_id'   => $tenant->id,
                        'customer_id' => $customer->id,
                        'recorded_by' => $recorder->id,
                        'amount'      => $amount,
                        'points_earned' => $pointsEarned,
                        'notes'       => null,
                        'purchased_at' => $date->format('Y-m-d H:i:s'),
                    ]);

                    PointTransaction::create([
                        'tenant_id'    => $tenant->id,
                        'customer_id'  => $customer->id,
                        'recorded_by'  => $recorder->id,
                        'points'       => $pointsEarned,
                        'balance_after' => $balance,
                        'type'         => 'purchase_earn',
                        'source_type'  => Purchase::class,
                        'source_id'    => $purchase->id,
                        'notes'        => null,
                        'created_at'   => $date,
                        'updated_at'   => $date,
                    ]);
                }

                // Redeem if the customer accumulated enough and visited enough times
                if ($balance >= $minRedemption && $purchaseCount >= 5 && rand(0, 2) > 0) {
                    $redeem    = (int) floor($balance / $minRedemption) * $minRedemption;
                    $balance  -= $redeem;
                    $redeemAt  = $lastVisit ?? Carbon::now()->subDays(rand(1, 30));
                    $recorder  = $staff->random();

                    PointTransaction::create([
                        'tenant_id'    => $tenant->id,
                        'customer_id'  => $customer->id,
                        'recorded_by'  => $recorder->id,
                        'points'       => -$redeem,
                        'balance_after' => $balance,
                        'type'         => 'redemption',
                        'source_type'  => null,
                        'source_id'    => null,
                        'notes'        => 'In-store reward redemption',
                        'created_at'   => $redeemAt,
                        'updated_at'   => $redeemAt,
                    ]);
                }

                $customer->update([
                    'points_balance' => $balance,
                    'last_visit_at'  => $lastVisit,
                ]);
            }
        }
    }
}
