<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'created_by',
        'stripe_subscription_id',
        'stripe_customer_id',
        'plan_name',
        'amount',
        'currency',
        'status',
        'current_period_start',
        'current_period_end',
        'canceled_at',
    ];

    protected $casts = [
        'amount'               => 'decimal:2',
        'current_period_start' => 'datetime',
        'current_period_end'   => 'datetime',
        'canceled_at'          => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(BillingTransaction::class);
    }
}
