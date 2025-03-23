import React, { useEffect, useRef, useState } from "react";
import { setToastMessage } from "../store/global-slice";
import { useDispatch, useSelector } from "react-redux";
import { getRecords, createRecord } from "../store/global-slice";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import Header from "../shared/layout/Header";

function Home() {
    const stepperRef = useRef(null);
    const toast = useRef(null);
    const dispatch = useDispatch();
    const {
        class: { data: classes = [], endPoints: classEndPoints },
        levels: { data: levels = [], endPoints: levelEndPoints },
        students: { data: students = [], endPoints: studentEndPoints },
        activities: { data: activities = [], endPoints: activityEndPoints },
        checkin: { data: checkin = [], endPoints: checkinEndPoints },
    } = useSelector((state) => state.global);
    const [levelId, setLevelId] = useState(null);
    const [classId, setClassId] = useState(null);
    const [studentId, setStudentId] = useState(null);
    const [activityId, setActivityId] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);

    useEffect(() => {
        dispatch(
            getRecords({
                type: "class",
                endPoint: classEndPoints.collection,
                key: "data",
            })
        );
        dispatch(
            getRecords({
                type: "levels",
                endPoint: levelEndPoints.collection,
                key: "data",
            })
        );
        dispatch(
            getRecords({
                type: "students",
                endPoint: studentEndPoints.collection,
                key: "data",
            })
        );
        dispatch(
            getRecords({
                type: "activities",
                endPoint: activityEndPoints.collection,
                key: "data",
            })
        );
    }, [dispatch]);

    return (
        <div>
            <Header />
            <div className="min-h-screen flex justify-center items-center px-4">
                <Card className="w-11/12 sm:w-11/12 md:w-10/12 xl:w-1/2">
                    <Toast ref={toast} />
                    <ConfirmPopup />
                    <Stepper ref={stepperRef} className="w-full" linear>
                        <StepperPanel header="Realm">
                            <div className="flex flex-col h-full">
                                <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-y-auto p-3">
                                    {levels.map((level) => (
                                        <Button
                                            key={level.id}
                                            label={level.name}
                                            onClick={() => setLevelId(level.id)}
                                            className={` p-1 sm:p-2 ${
                                                levelId === level.id
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-200"
                                            }`}
                                            icon={
                                                levelId === level.id
                                                    ? "pi pi-check"
                                                    : null
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex pt-4 justify-end">
                                <Button
                                    label="Next"
                                    icon="pi pi-arrow-right"
                                    iconPos="right"
                                    onClick={() =>
                                        stepperRef.current.nextCallback()
                                    }
                                    disabled={!levelId}
                                    className=" p-1 sm:p-2"
                                />
                            </div>
                        </StepperPanel>
                        <StepperPanel header="Class">
                            <div className="flex flex-col h-full">
                                <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-y-auto">
                                    {classes
                                        .filter((c) => c.level_id === levelId)
                                        .map((cls) => (
                                            <Button
                                                key={cls.id}
                                                label={cls.name}
                                                onClick={() =>
                                                    setClassId(cls.id)
                                                }
                                                className={` p-1 sm:p-2 ${
                                                    classId === cls.id
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-gray-200"
                                                }`}
                                                icon={
                                                    classId === cls.id
                                                        ? "pi pi-check"
                                                        : null
                                                }
                                            />
                                        ))}
                                </div>
                            </div>
                            <div className="flex pt-4 justify-between">
                                <Button
                                    label="Back"
                                    severity="secondary"
                                    icon="pi pi-arrow-left"
                                    onClick={() =>
                                        stepperRef.current.prevCallback()
                                    }
                                    className=" p-1 sm:p-2"
                                />
                                <Button
                                    label="Next"
                                    icon="pi pi-arrow-right"
                                    iconPos="right"
                                    onClick={() =>
                                        stepperRef.current.nextCallback()
                                    }
                                    disabled={!classId}
                                    className=" p-1 sm:p-2"
                                />
                            </div>
                        </StepperPanel>
                        <StepperPanel header="Character">
                            <div className="flex flex-col h-full">
                                <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-y-auto">
                                    {students
                                        .filter((s) => s.class_id === classId)
                                        .map((student) => (
                                            <Button
                                                key={student.id}
                                                label={student.name}
                                                onClick={() =>
                                                    setStudentId(student.id)
                                                }
                                                className={` p-1 sm:p-2 ${
                                                    studentId === student.id
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-gray-200"
                                                }`}
                                                icon={
                                                    studentId === student.id
                                                        ? "pi pi-check"
                                                        : null
                                                }
                                            />
                                        ))}
                                </div>
                            </div>
                            <div className="flex pt-4 justify-between">
                                <Button
                                    label="Back"
                                    severity="secondary"
                                    icon="pi pi-arrow-left"
                                    onClick={() =>
                                        stepperRef.current.prevCallback()
                                    }
                                    className=" p-1 sm:p-2"
                                />
                                <Button
                                    label="Next"
                                    icon="pi pi-arrow-right"
                                    iconPos="right"
                                    onClick={() =>
                                        stepperRef.current.nextCallback()
                                    }
                                    disabled={!studentId}
                                    className=" p-1 sm:p-2"
                                />
                            </div>
                        </StepperPanel>
                        <StepperPanel header="Quest">
                            <div className="flex flex-col h-full">
                                <div className="flex-grow grid grid-cols-1 justify-start items-center gap-2">
                                    {studentId ? (
                                        <>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-5 flex-grow flex flex-wrap justify-start items-center">
                                                <span>
                                                    Hi "
                                                    {
                                                        students.find(
                                                            (s) =>
                                                                s.id ===
                                                                studentId
                                                        )?.name
                                                    }
                                                    " from class "
                                                    {
                                                        classes.find(
                                                            (c) =>
                                                                c.id === classId
                                                        )?.name
                                                    }
                                                    " level "
                                                    {
                                                        levels.find(
                                                            (l) =>
                                                                l.id === levelId
                                                        )?.name
                                                    }
                                                    ".
                                                </span>
                                            </div>
                                            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <Dropdown
                                                    editable
                                                    value={selectedActivity}
                                                    options={activities}
                                                    onChange={(e) => {
                                                        setSelectedActivity(
                                                            e.value
                                                        );
                                                        setActivityId(
                                                            e.value.id
                                                        );
                                                    }}
                                                    optionLabel="name"
                                                    filter
                                                    placeholder="Pick or create your quest!"
                                                    className="w-full mt-1 "
                                                    itemTemplate={(option) => (
                                                        <div className="max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
                                                            <span className="font-bold text-wrap">
                                                                {option.name}
                                                            </span>
                                                            <br />
                                                            <span className="text-[10px] sm:text-xs md:text-sm text-gray-600 text-wrap">
                                                                {
                                                                    option.description
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                    valueTemplate={(option) =>
                                                        option ? (
                                                            <div className="max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
                                                                <span className="font-bold text-wrap">
                                                                    {
                                                                        option.name
                                                                    }
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            "Pick your quest!"
                                                        )
                                                    }
                                                />
                                                <Button
                                                    label="Check In"
                                                    icon="pi pi-sign-in"
                                                    iconPos="right"
                                                    className=" p-1 sm:p-2"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        "Your Quest"
                                    )}
                                </div>
                            </div>
                            <div className="flex pt-2 sm:pt-4 justify-start">
                                <Button
                                    label="Back"
                                    severity="secondary"
                                    icon="pi pi-arrow-left"
                                    onClick={(event) =>
                                        confirmPopup({
                                            target: event.currentTarget,
                                            message:
                                                "Are you sure you want to go back?",
                                            icon: "pi pi-exclamation-triangle",
                                            accept: () => {
                                                dispatch(
                                                    setToastMessage({
                                                        severity: "info",
                                                        summary:
                                                            "Stay focus kiddo.",
                                                        detail: "Moved back to Character step",
                                                    })
                                                );
                                                stepperRef.current.prevCallback();
                                            },
                                            reject: () => {
                                                dispatch(
                                                    setToastMessage({
                                                        severity: "info",
                                                        summary:
                                                            "Nice stay focus on your quest.",
                                                        detail: "Stayed on Quest step",
                                                    })
                                                );
                                            },
                                        })
                                    }
                                    className=" p-1 sm:p-2"
                                />
                            </div>
                        </StepperPanel>
                    </Stepper>
                </Card>
            </div>
        </div>
    );
}

export default Home;
