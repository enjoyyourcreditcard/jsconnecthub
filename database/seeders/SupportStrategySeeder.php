<?php

namespace Database\Seeders;

use App\Models\SupportStrategy;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class SupportStrategySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $supportStrategies = [
            ['name' => 'Perspective'],
            ['name' => 'Solution'],
            ['name' => 'Listening Ear']
        ];

        SupportStrategy::insert($supportStrategies);
    }
}
