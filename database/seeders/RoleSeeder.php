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
        ];

        Role::insert($roles);

        $masterTypes = config('constants.MASTER_TYPE_ARRAY');

        foreach ($masterTypes as $masterType) {
            // Permission::create(['name' => $masterType . ' view']);
            Permission::create(['name' => $masterType . ' create']);
            Permission::create(['name' => $masterType . ' edit']);
            Permission::create(['name' => $masterType . ' delete']);

            if ($masterType == 'bookings') {
                Permission::create(['name' => $masterType . ' confirm']);
            }

            $superadminPermissions = [
                // $masterType . ' view',
                $masterType . ' create',
                $masterType . ' edit',
                $masterType . ' delete',
            ];
            if ($masterType == 'bookings') {
                $superadminPermissions[] = $masterType . ' confirm';
            }
            Role::findByName('Superadmin')->givePermissionTo($superadminPermissions);
        }

        Role::findByName('Admin1')->givePermissionTo([
            // 'checkin view',
            'checkin create',
            'checkin edit',
            'checkin delete',
            // 'students view',
            // 'activities view',
        ]);

        Role::findByName('Admin2')->givePermissionTo([
            // 'bookings view',
            'bookings create',
            'bookings edit',
            'bookings delete',
            'bookings confirm',
            // 'students view',
            // 'facilities view',
        ]);

        Role::findByName('Admin3')->givePermissionTo([
            // 'counsels view',
            'counsels create',
            'counsels edit',
            'counsels delete',
            // 'students view',
        ]);
    }
}
