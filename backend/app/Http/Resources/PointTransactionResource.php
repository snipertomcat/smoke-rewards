<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PointTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'points' => $this->points,
            'balance_after' => $this->balance_after,
            'type' => $this->type,
            'notes' => $this->notes,
            'customer' => $this->whenLoaded('customer', fn () => [
                'id'         => $this->customer->id,
                'first_name' => $this->customer->first_name,
                'last_name'  => $this->customer->last_name,
            ]),
            'recorded_by' => $this->whenLoaded('recordedBy', fn () => [
                'id' => $this->recordedBy->id,
                'name' => $this->recordedBy->name,
            ]),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
