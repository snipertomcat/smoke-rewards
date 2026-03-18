<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('recorded_by')->constrained('users')->restrictOnDelete();
            $table->decimal('amount', 10, 2);
            $table->unsignedInteger('points_earned')->default(0);
            $table->string('notes')->nullable();
            $table->timestamp('purchased_at');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'customer_id']);
            $table->index(['tenant_id', 'purchased_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
