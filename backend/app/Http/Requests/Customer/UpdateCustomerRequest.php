<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;
        $customerId = $this->route('customer')->id;

        return [
            'first_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('customers')
                    ->where('tenant_id', $tenantId)
                    ->ignore($customerId)
                    ->whereNull('deleted_at'),
            ],
            'phone' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('customers')
                    ->where('tenant_id', $tenantId)
                    ->ignore($customerId)
                    ->whereNull('deleted_at'),
            ],
            'rfid_uid' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('customers')
                    ->where('tenant_id', $tenantId)
                    ->ignore($customerId)
                    ->whereNull('deleted_at'),
            ],
        ];
    }
}
