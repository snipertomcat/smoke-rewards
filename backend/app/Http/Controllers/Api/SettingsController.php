<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $tenant = $request->user()->tenant;

        return response()->json([
            'data' => [
                'points_per_dollar'      => $tenant->getPointsPerDollar(),
                'min_redemption_points'  => $tenant->getMinRedemptionPoints(),
                'points_to_dollar_ratio' => (float) ($tenant->settings['points_to_dollar_ratio'] ?? 0.20),
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'points_per_dollar'      => ['required', 'integer', 'min:1'],
            'min_redemption_points'  => ['required', 'integer', 'min:1'],
            'points_to_dollar_ratio' => ['required', 'numeric', 'min:0.01'],
        ]);

        $tenant = $request->user()->tenant;

        $tenant->update([
            'settings' => array_merge($tenant->settings ?? [], [
                'points_per_dollar'      => (int)   $data['points_per_dollar'],
                'min_redemption_points'  => (int)   $data['min_redemption_points'],
                'points_to_dollar_ratio' => (float) $data['points_to_dollar_ratio'],
            ]),
        ]);

        return response()->json([
            'data' => [
                'points_per_dollar'      => (int)   $data['points_per_dollar'],
                'min_redemption_points'  => (int)   $data['min_redemption_points'],
                'points_to_dollar_ratio' => (float) $data['points_to_dollar_ratio'],
            ],
        ]);
    }
}
