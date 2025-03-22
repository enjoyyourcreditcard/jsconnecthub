<?php

return [
    'MASTER_TYPE_ARRAY' => [
        'USER_MASTER_TYPE' => 'users',
        'ROLE_MASTER_TYPE' => 'roles',
        'LEVEL_MASTER_TYPE' => 'levels',
        'CLASS_MASTER_TYPE' => 'class',
        'STUDENT_MASTER_TYPE' => 'students',
        'ACTIVITY_MASTER_TYPE' => 'activities',
        'ROLE_MASTER_TYPE' => 'roles',
        'CHECKIN_MASTER_TYPE' => 'checkin'
    ],

    'MASTER_VALIDATION_ARRAY' => [
        'LEVEL_MASTER_VALIDATION' => [
            'name' => 'string|required'
        ],
        'CLASS_MASTER_VALIDATION' =>
        [
            'name' => 'string|required',
            'level_id' => 'integer|required'
        ],
        'STUDENT_MASTER_VALIDATION' =>
        [
            'class_id'  => ['required', 'exists:class,id'],
            'name'          => ['required', 'string', 'max:100'],
        ],
        'ACTIVITY_MASTER_VALIDATION' =>
        [
            'name'          => ['required', 'string', 'max:250'],
            'description'   => ['nullable', 'string'],
        ],
        'ROLE_MASTER_VALIDATION' =>
        [
            'name'          => ['required', 'string', 'unique:roles'],
            'guard_name'    => ['nullable', 'string'],
        ],
        'CHECKIN_MASTER_VALIDATION' =>
        [
            'student_id'        => ['required', 'exists:students,id'],
            'activity_id'       => ['nullable', 'required_without:other_activity', 'exists:activities,id'],
            'other_activity'    => ['nullable', 'required_without:activity_id', 'string', 'max:250']
        ],
    ],

    'MASTER_ROLE_ARRAY' => [
        1 => 'admin',
        2 => 'student'
    ],

];
