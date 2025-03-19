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
        $names = [
            'Dariusz Symanski',
            'Justyn Dąbrowski',
            'Walentyna Maciejewska',
            'Szczęsny Maciejewski'
        ];

        foreach ($names as $name) {
            Student::create(['name' => $name]);
        }
    }
}
