<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'amount' => $this->amount,
            'points_earned' => $this->points_earned,
            'notes' => $this->notes,
            'purchased_at' => $this->purchased_at->toISOString(),
            'recorded_by' => $this->whenLoaded('recordedBy', fn () => [
                'id' => $this->recordedBy->id,
                'name' => $this->recordedBy->name,
            ]),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
