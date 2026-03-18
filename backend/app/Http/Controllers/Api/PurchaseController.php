<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Purchase\StorePurchaseRequest;
use App\Http\Resources\PurchaseResource;
use App\Models\Customer;
use App\Models\Purchase;
use App\Services\Contracts\PurchaseServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PurchaseController extends Controller
{
    public function __construct(
        private readonly PurchaseServiceInterface $purchaseService
    ) {}

    public function forCustomer(Request $request, Customer $customer): AnonymousResourceCollection
    {
        $this->authorize('view', $customer);

        $purchases = $this->purchaseService->listForCustomer(
            $customer,
            (int) ($request->per_page ?? 15)
        );

        return PurchaseResource::collection($purchases);
    }

    public function store(StorePurchaseRequest $request, Customer $customer): PurchaseResource
    {
        $this->authorize('create', Purchase::class);
        $this->authorize('view', $customer);

        $purchase = $this->purchaseService->record($customer, $request->validated(), $request->user());

        return new PurchaseResource($purchase);
    }
}
