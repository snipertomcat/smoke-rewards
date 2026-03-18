<?php

namespace App\Http\Requests\PointTransaction;

use Illuminate\Foundation\Http\FormRequest;

class AdjustPointsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'points' => ['required', 'integer', 'not_in:0'],
            'type' => ['required', 'string', 'in:manual_adjust,redemption'],
            'notes' => ['required', 'string', 'max:500'],
        ];
    }
}
