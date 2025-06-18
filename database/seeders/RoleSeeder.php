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
            Permission::create(['name' => $masterType . ' view']);
            Permission::create(['name' => $masterType . ' create']);
            Permission::create(['name' => $masterType . ' edit']);
            Permission::create(['name' => $masterType . ' delete']);

            if ($masterType == 'bookings') {
                Permission::create(['name' => $masterType . ' confirm']);
            }

            $superadminPermissions = [
                $masterType . ' view',
                $masterType . ' create',
                $masterType . ' edit',
                $masterType . ' delete',
            ];
            if ($masterType == 'bookings') {
                $superadminPermissions[] = $masterType . ' confirm';
            }
            Role::findByName('Superadmin')->givePermissionTo($superadminPermissions);
        }

        Permission::create(['name' => 'dashboard view']);
        Permission::create(['name' => 'dashboard-checkin view']);
        Permission::create(['name' => 'dashboard-bookings view']);
        Permission::create(['name' => 'dashboard-counsels view']);

        Role::findByName('Superadmin')->givePermissionTo([
            'dashboard view'
        ]);

        Role::findByName('Admin1')->givePermissionTo([
            'activities view',
            'activities create',
            'activities edit',
            'activities delete',
            'checkin view',
            'checkin create',
            'checkin edit',
            'checkin delete',
            'dashboard-checkin view',
        ]);

        Role::findByName('Admin2')->givePermissionTo([
            'facilities view',
            'facilities create',
            'facilities edit',
            'facilities delete',
            'bookings view',
            'bookings create',
            'bookings edit',
            'bookings delete',
            'bookings confirm',
            'dashboard-bookings view',
            'blocked_dates view',
            'blocked_dates create',
            'blocked_dates edit',
            'blocked_dates delete',
        ]);

        Role::findByName('Admin3')->givePermissionTo([
            'support_strategies view',
            'support_strategies create',
            'support_strategies edit',
            'support_strategies delete',
            'questions view',
            'questions create',
            'questions edit',
            'questions delete',
            'radio_options view',
            'radio_options create',
            'radio_options edit',
            'radio_options delete',
            'counsels view',
            'counsels create',
            'counsels edit',
            'counsels delete',
            'dashboard-counsels view',
        ]);
    }
}
