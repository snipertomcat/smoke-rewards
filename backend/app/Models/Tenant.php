<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'email',
        'logo_url',
        'stripe_customer_id',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->where('status', 'active')->latest();
    }

    /**
     * Get the points-per-dollar setting for this tenant,
     * falling back to the global config value.
     */
    public function getPointsPerDollar(): int
    {
        return (int) ($this->settings['points_per_dollar'] ?? config('rewards.points_per_dollar'));
    }

    /**
     * Get the minimum redemption points threshold for this tenant.
     */
    public function getMinRedemptionPoints(): int
    {
        return (int) ($this->settings['min_redemption_points'] ?? config('rewards.min_redemption_points'));
    }
}
