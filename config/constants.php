<?php

return [
    'MASTER_TYPE_ARRAY' => [
        'ROLE_MASTER_TYPE' => 'roles',
        'LEVEL_MASTER_TYPE' => 'levels',
        'CLASS_MASTER_TYPE' => 'class'
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
    ],

    'MASTER_ROLE_ARRAY' => [
        1 => 'admin',
        2 => 'student'
    ],

];
