<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PointTransaction\AdjustPointsRequest;
use App\Http\Resources\PointTransactionResource;
use App\Models\Customer;
use App\Services\Contracts\PointsServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use InvalidArgumentException;

class PointTransactionController extends Controller
{
    public function __construct(
        private readonly PointsServiceInterface $pointsService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $transactions = $this->pointsService->listForTenant(
            (int) ($request->per_page ?? 25),
            $request->only(['type', 'search'])
        );

        return PointTransactionResource::collection($transactions);
    }

    public function forCustomer(Request $request, Customer $customer): AnonymousResourceCollection
    {
        $this->authorize('view', $customer);

        $transactions = $this->pointsService->listForCustomer(
            $customer,
            (int) ($request->per_page ?? 20)
        );

        return PointTransactionResource::collection($transactions);
    }

    public function adjust(AdjustPointsRequest $request, Customer $customer): PointTransactionResource
    {
        $this->authorize('update', $customer);

        try {
            $transaction = $this->pointsService->adjust(
                $customer,
                $request->integer('points'),
                $request->string('type'),
                $request->string('notes'),
                $request->user()
            );
        } catch (InvalidArgumentException $e) {
            abort(422, $e->getMessage());
        }

        return new PointTransactionResource($transaction->load('recordedBy:id,name'));
    }
}
