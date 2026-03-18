<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Contracts\StatisticsServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatisticsController extends Controller
{
    public function __construct(
        private readonly StatisticsServiceInterface $statisticsService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->statisticsService->getSummary(),
        ]);
    }

    public function topCustomers(Request $request): JsonResponse
    {
        $limit = (int) ($request->limit ?? 10);

        return response()->json([
            'data' => $this->statisticsService->getTopCustomers($limit),
        ]);
    }

    public function purchaseTrend(Request $request): JsonResponse
    {
        $months = (int) ($request->months ?? 6);

        return response()->json([
            'data' => $this->statisticsService->getPurchaseTrend($months),
        ]);
    }
}
