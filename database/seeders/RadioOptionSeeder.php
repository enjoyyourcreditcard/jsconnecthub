<?php

namespace Database\Seeders;

use App\Models\RadioOption;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class RadioOptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $radioOptions = [
            ['question_id' => 4, 'text' => '2'],
            ['question_id' => 4, 'text' => '3'],
            ['question_id' => 4, 'text' => '4'],
        ];

        RadioOption::insert($radioOptions);
    }
}
