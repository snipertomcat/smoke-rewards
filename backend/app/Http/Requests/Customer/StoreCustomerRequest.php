<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;

        return [
            'first_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('customers')->where('tenant_id', $tenantId)->whereNull('deleted_at'),
            ],
            'phone' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('customers')->where('tenant_id', $tenantId)->whereNull('deleted_at'),
            ],
            'rfid_uid' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('customers')->where('tenant_id', $tenantId)->whereNull('deleted_at'),
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if (empty($this->email) && empty($this->phone)) {
                $v->errors()->add('contact', 'Either an email or phone number is required.');
            }
        });
    }
}
