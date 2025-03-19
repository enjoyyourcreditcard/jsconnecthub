<?php

namespace Database\Seeders;

use App\Models\DataClass;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ClassSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $seeds = [
            1 => [
                '1A',
                '1B'
            ],
            2 => [
                '2A',
                '2B'
            ],
            3 => [
                '3A',
                '3B'
            ],
            4 => [
                '4A',
                '4B'
            ]
        ];

        foreach ($seeds as $level_id => $levels) {
            foreach ($levels as $name) {
                DataClass::create([
                    'level_id'  => $level_id,
                    'name'      => $name
                ]);
            }
        }
    }
}
