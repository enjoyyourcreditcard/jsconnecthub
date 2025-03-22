<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $seeds = [
            1 => [
                'Aaron Tan',
                'Li Jia Wei'
            ],
            2 => [
                'Nurul Aisyah',
                'Benjamin Lee'
            ],
            3 => [
                'Chen Yi Xin',
                'Siti Nur Hidayah'
            ],
            4 => [
                'Daniel Ong',
                'Xiao Mei'
            ],
            5 => [
                'Rahul Kumar',
                'Ethan Lim'
            ],
            6 => [
                'Mei Ling Chua',
                'Aisha bte Rahman'
            ],
            7 => [
                'Chloe Goh',
                'Jasmine Tan'
            ],
            8 => [
                'Kevin Lee',
                'Xiaolin Wong'
            ]
        ];

        foreach ($seeds as $classId => $names) {
            foreach ($names as $name) {
                Student::create([
                    'data_class_id'  => $classId,
                    'name'      => $name
                ]);
            }
        }
    }
}
