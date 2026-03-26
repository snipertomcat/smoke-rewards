<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = [
            [
                'name'      => 'Cloud Nine Smoke Shop',
                'slug'      => 'cloud-nine',
                'email'     => 'admin@cloudnine.com',
                'is_active' => true,
                'settings'  => [
                    'points_per_dollar'      => 2,
                    'min_redemption_points'  => 100,
                    'points_to_dollar_ratio' => 0.01,
                ],
            ],
            [
                'name'      => 'Puff Palace',
                'slug'      => 'puff-palace',
                'email'     => 'admin@puffpalace.com',
                'is_active' => true,
                'settings'  => [
                    'points_per_dollar'      => 1,
                    'min_redemption_points'  => 200,
                    'points_to_dollar_ratio' => 0.02,
                ],
            ],
            [
                'name'      => 'The Vape Den',
                'slug'      => 'vape-den',
                'email'     => 'admin@vapeden.com',
                'is_active' => true,
                'settings'  => [
                    'points_per_dollar'      => 3,
                    'min_redemption_points'  => 150,
                    'points_to_dollar_ratio' => 0.01,
                ],
            ],
        ];

        foreach ($tenants as $data) {
            Tenant::create($data);
        }
    }
}
