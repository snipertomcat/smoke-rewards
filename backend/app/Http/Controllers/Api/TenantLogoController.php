<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TenantLogoController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpeg,png,gif,webp,svg', 'max:2048'],
        ]);

        $tenant = $request->user()->tenant;

        // Delete old logo if present
        if ($tenant->logo_url) {
            $oldPath = ltrim(str_replace('/storage/', '', $tenant->logo_url), '/');
            Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('logo')->store("logos/{$tenant->id}", 'public');
        $url  = '/storage/' . $path;

        $tenant->update(['logo_url' => $url]);

        return response()->json(['logo_url' => $url]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $tenant = $request->user()->tenant;

        if ($tenant->logo_url) {
            $oldPath = ltrim(str_replace('/storage/', '', $tenant->logo_url), '/');
            Storage::disk('public')->delete($oldPath);
            $tenant->update(['logo_url' => null]);
        }

        return response()->json(['logo_url' => null]);
    }
}
