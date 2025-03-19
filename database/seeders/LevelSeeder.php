<?php

namespace Database\Seeders;

use App\Models\Level;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $seeds = [
            'Primary 1',
            'Primary 2',
            'Primary 3',
            'Primary 4'
        ];

        foreach ($seeds as $name) {
            Level::create([
                'name' => $name
            ]);
        }
    }
}
