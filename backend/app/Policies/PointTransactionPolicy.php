<?php

namespace App\Policies;

use App\Models\PointTransaction;
use App\Models\User;

class PointTransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function view(User $user, PointTransaction $transaction): bool
    {
        return $user->tenant_id === $transaction->tenant_id;
    }
}
