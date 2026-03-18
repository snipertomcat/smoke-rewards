<?php

return [
    /*
     * Default number of points awarded per dollar spent.
     * Tenants may override this via their settings JSON column.
     */
    'points_per_dollar' => (int) env('REWARDS_POINTS_PER_DOLLAR', 1),

    /*
     * Minimum points required for a redemption transaction.
     */
    'min_redemption_points' => (int) env('REWARDS_MIN_REDEMPTION_POINTS', 100),
];
