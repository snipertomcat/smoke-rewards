<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'rfid_uid' => $this->rfid_uid,
            'points_balance' => $this->points_balance,
            'last_visit_at' => $this->last_visit_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'purchases' => PurchaseResource::collection($this->whenLoaded('purchases')),
            'point_transactions' => PointTransactionResource::collection($this->whenLoaded('pointTransactions')),
        ];
    }
}
