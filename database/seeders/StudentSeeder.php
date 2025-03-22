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
            ['name' => 'Aaron Tan', 'data_class_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Li Jia Wei', 'data_class_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Nurul Aisyah', 'data_class_id' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Benjamin Lee', 'data_class_id' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Chen Yi Xin', 'data_class_id' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Siti Nur Hidayah', 'data_class_id' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Daniel Ong', 'data_class_id' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Xiao Mei', 'data_class_id' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Rahul Kumar', 'data_class_id' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Ethan Lim', 'data_class_id' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Mei Ling Chua', 'data_class_id' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Aisha bte Rahman', 'data_class_id' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Chloe Goh', 'data_class_id' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Jasmine Tan', 'data_class_id' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Kevin Lee', 'data_class_id' => 8, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Xiaolin Wong', 'data_class_id' => 8, 'created_at' => now(), 'updated_at' => now()]
        ];

        Student::insert($students);
    }
}
