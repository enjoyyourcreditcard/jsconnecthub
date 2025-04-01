<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $facilities = [
            ['name' => 'Classrooms'],
            ['name' => 'Library'],
            ['name' => 'Science Laboratories'],
            ['name' => 'Computer Labs']
        ];

        Facility::insert($facilities);
    }
}
