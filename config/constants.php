<?php

return [
    'MASTER_TYPE_ARRAY' => [
        'USER_MASTER_TYPE' => 'users',
        'ROLE_MASTER_TYPE' => 'roles',
        'LEVEL_MASTER_TYPE' => 'levels',
        'CLASS_MASTER_TYPE' => 'class',
        'STUDENT_MASTER_TYPE' => 'students',
        'ACTIVITY_MASTER_TYPE' => 'activity'
    ],

    'MASTER_VALIDATION_ARRAY'=>[
        'LEVEL_MASTER_VALIDATION'=>[
            'name'=>'string|required'
        ],
        'CLASS_MASTER_VALIDATION'=>
        [
            'name'=>'string|required',
            'level_id'=>'integer|required'
        ],
        'STUDENT_MASTER_VALIDATION'=>
        [
            'name'=>'string|required',
            'class_id'=>'integer|required'
        ],
        'ACTIVITY_MASTER_VALIDATION'=>[
            'name'=>'string|required'
        ],
    ],

    'MASTER_ROLE_ARRAY' => [
        1 => 'admin',
        2 => 'student'
    ],

];
