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
        
        Level::create([
            'name'=>'Primary 1'
        ]);
        Level::create([
            'name'=>'Primary 2'
        ]);
        Level::create([
            'name'=>'Primary 3'
        ]);
        Level::create([
            'name'=>'Primary 4'
        ]);
    }
}
