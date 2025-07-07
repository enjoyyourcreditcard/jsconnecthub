<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdmin = User::create([
            'name'      => 'Superadmin',
            'email'     => 'superadmin@gmail.com',
            'password'  => Hash::make('secret')
        ]);

        $superAdmin->assignRole(Role::findByName('Superadmin'));

        $admin1 = User::create([
            'name'      => 'Admin1',
            'email'     => 'admin1@gmail.com',
            'password'  => Hash::make('secret')
        ]);

        $admin1->assignRole(Role::findByName('Checkin'));

        $admin2 = User::create([
            'name'      => 'Admin2',
            'email'     => 'admin2@gmail.com',
            'password'  => Hash::make('secret')
        ]);

        $admin2->assignRole(Role::findByName('Booking'));

        $admin3 = User::create([
            'name'      => 'Admin3',
            'email'     => 'admin3@gmail.com',
            'password'  => Hash::make('secret')
        ]);

        $admin3->assignRole(Role::findByName('Counsel'));
    }
}
