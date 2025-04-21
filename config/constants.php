<?php

return [
    'MASTER_TYPE_ARRAY' => [
        'ROLE_MASTER_TYPE'              => 'roles',
        'PERMISSION_MASTER_TYPE'        => 'permissions',
        'USER_MASTER_TYPE'              => 'users',
        'CLASS_MASTER_TYPE'             => 'class',
        'LEVEL_MASTER_TYPE'             => 'levels',
        'STUDENT_MASTER_TYPE'           => 'students',
        'ACTIVITY_MASTER_TYPE'          => 'activities',
        'FACILITY_MASTER_TYPE'          => 'facilities',
        'CHECKIN_MASTER_TYPE'           => 'checkin',
        'BOOKING_MASTER_TYPE'           => 'bookings',
        'COUNSEL_MASTER_TYPE'           => 'counsels',
        'SUPPORT_STRATEGY_MASTER_TYPE'  => 'support-strategies',
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
            'class_id'  => ['required', 'exists:classes,id'],
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
            'other_activity'    => ['nullable', 'required_without:activity_id', 'string', 'max:250'],
            'checkin_time' => ['required', 'date'],
            'checkout_time' => ['nullable', 'date', 'after_or_equal:checkin_time'],
            'reason' => ['nullable', 'string', 'max:255']
        ],
    ],
];
