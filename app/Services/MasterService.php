<?php

namespace App\Services;

use App\Models\Level;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Str;

class MasterService
{
    protected $modelMap = [
        'users' => \App\Models\User::class,
        'levels' => \App\Models\Level::class,
        'class' => \App\Models\DataClass::class,
        'students' => \App\Models\Student::class,
        'activities' => \App\Models\Activity::class,
        'roles' => \Spatie\Permission\Models\Role::class,
        'checkin' => \App\Models\Checkin::class

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
        $q = $this->getModel($type);
        if ($type === config('constants.MASTER_TYPE_ARRAY.LEVEL_MASTER_TYPE')) {
            $q->with('classes');
        }
        if ($type === config('constants.MASTER_TYPE_ARRAY.CLASS_MASTER_TYPE')) {
            $q->with('level');
        }
        if ($type === config('constants.MASTER_TYPE_ARRAY.STUDENT_MASTER_TYPE')) {
            $q->with('class.level');
        }
        if ($type === config('constants.MASTER_TYPE_ARRAY.CHECKIN_MASTER_TYPE')) {
            $q->with(['student.class.level', 'activity']);
        }
        return $q->get();
    }

    public function getById($type, $id)
    {
        return $this->getModel($type)->find($id);
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
