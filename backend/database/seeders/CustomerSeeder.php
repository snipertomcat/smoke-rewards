<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $firstNames = [
            'James', 'Maria', 'Tyler', 'Aisha', 'Derek', 'Sonia', 'Kevin', 'Natasha',
            'Brian', 'Leila', 'Carlos', 'Amber', 'Trevor', 'Yuki', 'Brandon', 'Rosa',
            'Malik', 'Jessica', 'Omar', 'Chelsea',
        ];

        $lastNames = [
            'Thompson', 'Rivera', 'Johnson', 'Patel', 'Williams', 'Kim', 'Davis',
            'Martinez', 'Brown', 'Chen', 'Wilson', 'Nguyen', 'Taylor', 'Singh',
            'Anderson', 'Lopez', 'Garcia', 'Robinson', 'Clark', 'Hall',
        ];

        foreach (Tenant::all() as $tenant) {
            $staff = User::where('tenant_id', $tenant->id)->get();

            foreach (range(1, 20) as $i) {
                $firstName = $firstNames[($i - 1) % count($firstNames)];
                $lastName  = $lastNames[($i - 1) % count($lastNames)];
                $slug      = strtolower($firstName . '.' . $lastName);

                Customer::create([
                    'tenant_id'     => $tenant->id,
                    'registered_by' => $staff->random()->id,
                    'first_name'    => $firstName,
                    'last_name'     => $lastName,
                    'email'         => $slug . '@example.com',
                    'phone'         => '555-' . str_pad((string) ($tenant->id * 100 + $i), 4, '0', STR_PAD_LEFT),
                    'rfid_uid'      => strtoupper(bin2hex(random_bytes(4))),
                    'points_balance' => 0,
                    'last_visit_at' => null,
                ]);
            }
        }
    }
}
