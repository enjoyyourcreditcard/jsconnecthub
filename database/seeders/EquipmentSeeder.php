<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cca;
use App\Models\Equipment;

class EquipmentSeeder extends Seeder
{
    public function run(): void
    {
        $map = [
            'Computer Club' => [
                ['name' => 'Laptop A', 'code' => 'LAP-A', 'quantity' => 3],
                ['name' => 'Keyboard Set', 'code' => 'KEY-SET', 'quantity' => 5],
            ],
            'Photography Club' => [
                ['name' => 'DSLR A', 'code' => 'DSLR-A', 'quantity' => 2],
                ['name' => 'Tripod A', 'code' => 'TRI-A', 'quantity' => 4],
            ],
            'Robotics Club' => [
                ['name' => 'Robot Kit A', 'code' => 'ROB-A', 'quantity' => 2],
            ],
        ];

        foreach ($map as $ccaName => $items) {
            $cca = Cca::where('name', $ccaName)->first();
            if (!$cca) continue;
            foreach ($items as $item) {
                Equipment::firstOrCreate(
                    ['cca_id' => $cca->id, 'name' => $item['name']],
                    [
                        'code' => $item['code'] ?? null,
                        'quantity' => $item['quantity'] ?? 1,
                        'active' => true,
                    ]
                );
            }
        }
    }
}
