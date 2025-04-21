<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'Superadmin', 'guard_name' => 'web'],
            ['name' => 'Admin1', 'guard_name' => 'web'],
            ['name' => 'Admin2', 'guard_name' => 'web'],
            ['name' => 'Admin3', 'guard_name' => 'web'],
            // ['name' => 'Student', 'guard_name' => 'web']
        ];

        Role::insert($roles);

        foreach (config('constants.MASTER_TYPE_ARRAY') as $masterType) {
            Permission::create(['name' => $masterType . ' create']);
            Permission::create(['name' => $masterType . ' edit']);
            Permission::create(['name' => $masterType . ' delete']);


            if ($masterType == 'bookings') {
                Permission::create(['name' => $masterType . ' confirm']);
            }

            Role::findByName('Superadmin')->givePermissionTo([$masterType . ' create', $masterType . ' edit', $masterType . ' delete']);

            if ($masterType == 'checkin') {
                Role::findByName('Admin1')->givePermissionTo([$masterType . ' create', $masterType . ' edit', $masterType . ' delete']);
            }

            if ($masterType == 'bookings') {
                Role::findByName('Superadmin')->givePermissionTo([$masterType . ' confirm']);
                Role::findByName('Admin2')->givePermissionTo([$masterType . ' create', $masterType . ' edit', $masterType . ' delete', $masterType . ' confirm']);
            }

            if ($masterType == 'counsels') {
                Role::findByName('Admin3')->givePermissionTo([$masterType . ' create', $masterType . ' edit', $masterType . ' delete']);
            }
        }
    }
}
