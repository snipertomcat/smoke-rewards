<?php

namespace App\Console\Commands;

use App\Models\BillingTransaction;
use App\Models\Customer;
use App\Models\PointTransaction;
use App\Models\Purchase;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ResetDemoData extends Command
{
    protected $signature = 'app:reset-demo {--force : Skip confirmation prompt}';

    protected $description = 'Purge all shops, customers, transactions, and billing data — keeps super_admin and salesman accounts intact';

    public function handle(): int
    {
        if (! $this->option('force')) {
            $this->warn('This will permanently delete:');
            $this->line('  • All smoke shops (tenants)');
            $this->line('  • All customers');
            $this->line('  • All purchases and point transactions');
            $this->line('  • All subscriptions and billing transactions');
            $this->line('  • All admin and staff user accounts');
            $this->newLine();
            $this->line('The following will be <comment>kept</comment>:');
            $this->line('  • super_admin accounts');
            $this->line('  • salesman accounts');
            $this->newLine();

            if (! $this->confirm('Are you sure you want to reset all demo data?')) {
                $this->info('Aborted.');
                return self::SUCCESS;
            }
        }

        $this->info('Resetting demo data…');

        DB::transaction(function () {
            // Billing
            $billing = BillingTransaction::count();
            BillingTransaction::query()->forceDelete();
            $this->line("  ✓ Deleted {$billing} billing transaction(s)");

            $subs = Subscription::withTrashed()->count();
            Subscription::withTrashed()->forceDelete();
            $this->line("  ✓ Deleted {$subs} subscription(s)");

            // Rewards data
            $pt = PointTransaction::withoutGlobalScopes()->count();
            PointTransaction::withoutGlobalScopes()->forceDelete();
            $this->line("  ✓ Deleted {$pt} point transaction(s)");

            $purchases = Purchase::withoutGlobalScopes()->count();
            Purchase::withoutGlobalScopes()->forceDelete();
            $this->line("  ✓ Deleted {$purchases} purchase(s)");

            $customers = Customer::withoutGlobalScopes()->count();
            Customer::withoutGlobalScopes()->forceDelete();
            $this->line("  ✓ Deleted {$customers} customer(s)");

            // Revoke tokens for shop-level users before deleting them
            $shopUsers = User::withTrashed()
                ->whereNotIn('role', ['super_admin', 'salesman'])
                ->get();

            foreach ($shopUsers as $user) {
                $user->tokens()->delete();
            }

            $userCount = $shopUsers->count();
            User::withTrashed()
                ->whereNotIn('role', ['super_admin', 'salesman'])
                ->forceDelete();
            $this->line("  ✓ Deleted {$userCount} shop user(s) (admin/staff)");

            // Tenants last (all FK dependents already gone)
            $tenants = Tenant::withTrashed()->count();
            Tenant::withTrashed()->forceDelete();
            $this->line("  ✓ Deleted {$tenants} tenant(s)");
        });

        $this->newLine();
        $this->info('Done. All stats are now at zero.');
        $this->line('super_admin and salesman accounts were not touched.');

        return self::SUCCESS;
    }
}
