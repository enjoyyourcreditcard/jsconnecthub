<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cca;

class CcaSeeder extends Seeder
{
    public function run(): void
    {
        $ccas = [
            ['name' => 'Computer Club', 'description' => 'ICT and computing activities', 'active' => true],
            ['name' => 'Photography Club', 'description' => 'Photography and media', 'active' => true],
            ['name' => 'Robotics Club', 'description' => 'Robotics and engineering', 'active' => true],
        ];

        foreach ($ccas as $cca) {
            Cca::firstOrCreate(['name' => $cca['name']], $cca);
        }
    }
}
