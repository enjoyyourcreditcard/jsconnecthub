<?php

namespace Database\Seeders;

use App\Models\Question;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = [
            ['support_strategy_id' => 1, 'order' => 1, 'type' => 'text', 'text' => 'What are you struggling with?'],
            ['support_strategy_id' => 1, 'order' => 2, 'type' => 'text', 'text' => 'What are your thought and feelings about the situation you are in?'],
            ['support_strategy_id' => 1, 'order' => 3, 'type' => 'text', 'text' => 'What would you like to know/understand from me?'],
            ['support_strategy_id' => 1, 'order' => 4, 'type' => 'radio', 'text' => '1 + 1 = ...?'],
            ['support_strategy_id' => 2, 'order' => 1, 'type' => 'text', 'text' => 'What are you struggling with?'],
            ['support_strategy_id' => 2, 'order' => 2, 'type' => 'text', 'text' => 'What are some solutions you already have in mind?'],
            ['support_strategy_id' => 2, 'order' => 3, 'type' => 'text', 'text' => 'What is stopping you from carrying out the solutions you have in mind?'],
            ['support_strategy_id' => 3, 'order' => 1, 'type' => 'text', 'text' => 'Share your story :) Describe the situation you are in, your thoughts, your feelings, what are you doing to help yourself?']
        ];

        Question::insert($questions);
    }
}
