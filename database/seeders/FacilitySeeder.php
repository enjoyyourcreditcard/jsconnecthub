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
            [
                'name' => 'Classrooms',
                'parent_id' => null
            ], [
                'name' => 'A01',
                'parent_id' => 1
            ], [
                'name' => 'A02',
                'parent_id' => 1
            ], [
                'name' => 'B01',
                'parent_id' => 1
            ], [
                'name' => 'B02',
                'parent_id' => 1
            ], [
                'name' => 'Library',
                'parent_id' => null
            ], [
                'name' => 'Science Laboratories',
                'parent_id' => null
            ], [
                'name' => 'Computer Labs',
                'parent_id' => null
            ],
        ];

        Facility::insert($facilities);
    }
}
