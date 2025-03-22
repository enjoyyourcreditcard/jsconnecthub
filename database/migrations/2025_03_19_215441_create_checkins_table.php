<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('checkins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained();
            $table->timestamp('checkin_time')->nullable('false')->useCurrent();
            $table->timestamp('checkout_time')->nullable('true');
            // $table->json('activities')->nullable();
            $table->text('reason')->nullable('true');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checkins');
    }
};
