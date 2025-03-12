<?php

namespace App\Services;

use Illuminate\Support\Str;

class MasterService
{
    protected $modelMap = [
        // 'roles' => \App\Models\Role::class,
        // 'users' => \App\Models\User::class,
    ];

    protected function getModel($type)
    {
        $class = $this->modelMap[$type] ?? null;
        if (!$class || !class_exists($class)) {
            throw new \Exception("Invalid type: $type");
        }
        return new $class;
    }

    public function getAll($type)
    {
        return $this->getModel($type)->all();
    }

    public function getById($type, $id)
    {
        return $this->getModel($type)->findOrFail($id);
    }

    public function create($type, array $data)
    {
        return $this->getModel($type)->create($data);
    }

    public function update($type, $id, array $data)
    {
        $model = $this->getModel($type)->findOrFail($id);
        $model->update($data);
        return $model;
    }

    public function delete($type, $id)
    {
        $model = $this->getModel($type)->findOrFail($id);
        $model->delete();
    }
}
