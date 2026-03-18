<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\Contracts\CustomerServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    public function __construct(
        private readonly CustomerServiceInterface $customerService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Customer::class);

        $customers = $this->customerService->list($request->only(['search', 'per_page']));

        return CustomerResource::collection($customers);
    }

    public function store(StoreCustomerRequest $request): CustomerResource
    {
        $this->authorize('create', Customer::class);

        $customer = $this->customerService->register($request->validated(), $request->user());

        return new CustomerResource($customer);
    }

    public function show(Customer $customer): CustomerResource
    {
        $this->authorize('view', $customer);

        $customer->load(['purchases' => fn ($q) => $q->latest('purchased_at')->limit(10)->with('recordedBy:id,name'), 'pointTransactions' => fn ($q) => $q->latest()->limit(10)->with('recordedBy:id,name')]);

        return new CustomerResource($customer);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): CustomerResource
    {
        $this->authorize('update', $customer);

        $updated = $this->customerService->update($customer, $request->validated());

        return new CustomerResource($updated);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $this->authorize('delete', $customer);

        $this->customerService->delete($customer);

        return response()->json(null, 204);
    }

    public function lookupByRfid(string $rfidUid): CustomerResource|JsonResponse
    {
        $customer = $this->customerService->findByRfid($rfidUid);

        if (! $customer) {
            return response()->json(['message' => 'No customer found with this RFID card.'], 404);
        }

        $this->authorize('view', $customer);

        return new CustomerResource($customer);
    }
}
