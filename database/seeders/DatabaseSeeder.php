<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Database\Seeders\RoleSeeder;
use Database\Seeders\StudentSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call(RoleSeeder::class);
        $this->call(UserSeeder::class);
        $this->call(StudentSeeder::class);
        $this->call(LevelSeeder::class);
    }
}
