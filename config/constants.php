<?php

return [
    'MASTER_TYPE_ARRAY' => [
        'ROLE_MASTER_TYPE' => 'roles',
        'LEVEL_MASTER_TYPE' => 'levels',
        'CLASS_MASTER_TYPE' => 'class',
        'CHECKIN_MASTER_TYPE' => 'checkin'
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
        'CHECKIN_MASTER_VALIDATION'=>
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
