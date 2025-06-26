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
            $table->foreignId('activity_id')->nullable('true')->constrained();
            $table->timestamp('checkin_time')->nullable('false')->useCurrent();
            $table->timestamp('checkout_time')->nullable('true');
            $table->string('other_activity')->nullable('true');
            $table->text('reason')->nullable('true');
            $table->string('job_id')->nullable();
            $table->string('timezone')->default('UTC');
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
