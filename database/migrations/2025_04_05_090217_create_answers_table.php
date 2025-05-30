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
        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('result_id')->constrained();
            $table->foreignId('question_id')->constrained();
            $table->foreignId('radio_option_id')->nullable('true')->constrained()->comment('only necessary if the question is in radio form');
            $table->text('text')->nullable('true')->comment('only necessary if the question is in text form');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('answers');
    }
};
