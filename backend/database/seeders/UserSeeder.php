<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Super admin (no tenant)
        User::create([
            'tenant_id' => null,
            'name'      => 'Super Admin',
            'email'     => 'superadmin@smokerewards.com',
            'password'  => Hash::make('password'),
            'role'      => 'super_admin',
        ]);

        $staffNames = [
            'cloud-nine'  => [['Marcus Webb', 'marcus@cloud-nine.com'], ['Priya Nair', 'priya@cloud-nine.com']],
            'puff-palace' => [['Jordan Lee', 'jordan@puff-palace.com'], ['Tanya Brooks', 'tanya@puff-palace.com']],
            'vape-den'    => [['Diego Reyes', 'diego@vape-den.com'], ['Chloe Park', 'chloe@vape-den.com']],
        ];

        foreach (Tenant::all() as $tenant) {
            // Admin
            User::create([
                'tenant_id' => $tenant->id,
                'name'      => 'Admin — ' . $tenant->name,
                'email'     => 'admin@' . $tenant->slug . '.com',
                'password'  => Hash::make('password'),
                'role'      => 'admin',
            ]);

            // Staff
            foreach ($staffNames[$tenant->slug] ?? [] as [$name, $email]) {
                User::create([
                    'tenant_id' => $tenant->id,
                    'name'      => $name,
                    'email'     => $email,
                    'password'  => Hash::make('password'),
                    'role'      => 'staff',
                ]);
            }
        }
    }
}
