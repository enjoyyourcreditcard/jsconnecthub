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

            Role::findByName('Superadmin')->givePermissionTo([$masterType . ' create', $masterType . ' edit', $masterType . ' delete']);
        }

        Role::findByName('Admin1')->givePermissionTo(['checkin' . ' create', 'checkin' . ' edit', 'checkin' . ' delete']);
    }
}
