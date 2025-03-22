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
        $students = [
            ['name' => 'Aaron Tan', 'class_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Li Jia Wei', 'class_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Nurul Aisyah', 'class_id' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Benjamin Lee', 'class_id' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Chen Yi Xin', 'class_id' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Siti Nur Hidayah', 'class_id' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Daniel Ong', 'class_id' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Xiao Mei', 'class_id' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Rahul Kumar', 'class_id' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Ethan Lim', 'class_id' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Mei Ling Chua', 'class_id' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Aisha bte Rahman', 'class_id' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Chloe Goh', 'class_id' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Jasmine Tan', 'class_id' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Kevin Lee', 'class_id' => 8, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Xiaolin Wong', 'class_id' => 8, 'created_at' => now(), 'updated_at' => now()]
        ];

        Student::insert($students);
    }
}
