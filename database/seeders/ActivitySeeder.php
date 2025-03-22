<?php

namespace Database\Seeders;

use App\Models\Activity;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $activities = [
            ['name' => 'Morning Assembly', 'description' => 'Daily morning gathering for announcements and activities.', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Library Visit', 'description' => 'Students visit the library for reading and research.', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Sports Training', 'description' => 'Training session for school sports teams.', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Music Practice', 'description' => 'Practice session for the school band and choir.', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Art Workshop', 'description' => 'Creative session for painting, drawing, and crafting.', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Computer Lab', 'description' => 'Students work on coding and IT-related projects.', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Extracurricular Club', 'description' => 'Various clubs such as science, drama, and debate.', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Field Trip', 'description' => 'Educational visits to museums, parks, or companies.', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Exam Review', 'description' => 'Preparation and discussion for upcoming exams.', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Volunteer Program', 'description' => 'Community service and social responsibility activities.', 'created_at' => now(), 'updated_at' => now()],
        ];

        Activity::insert($activities);
    }
}
