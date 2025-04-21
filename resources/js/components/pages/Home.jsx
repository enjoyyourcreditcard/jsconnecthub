import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getRecords,
    createRecord,
    setToastMessage,
} from "../store/global-slice";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Badge } from "primereact/badge";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { OverlayPanel } from "primereact/overlaypanel";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { DateTime } from "luxon";
import Header from "../shared/layout/Header";
import "../../../css/home.css";

function Home() {
    const toast = useRef(null);
    const stepperRef = useRef(null);
    const overlayRef = useRef(null);
    const dispatch = useDispatch();
    const {
        class: { data: classes = [], endPoints: classEndPoints },
        levels: { data: levels = [], endPoints: levelEndPoints },
        students: { data: students = [], endPoints: studentEndPoints },
        activities: { data: activities = [], endPoints: activityEndPoints },
        checkin: { data: checkin = [], endPoints: checkinEndPoints },
    } = useSelector((state) => state.global);
    const [activeButton, setActiveButton] = useState(null);
    const [showCard, setShowCard] = useState(false);
    const [levelId, setLevelId] = useState(null);
    const [classId, setClassId] = useState(null);
    const [studentId, setStudentId] = useState(null);
    const [activityId, setActivityId] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [editableActivity, setEditableActivity] = useState("");
    const [showCustomActivityInput, setShowCustomActivityInput] =
        useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [timer, setTimer] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);
    const [isEarlyCheckout, setIsEarlyCheckout] = useState(false);
    const [earlyReason, setEarlyReason] = useState("");
    const [questLog, setQuestLog] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [userTimezone, setUserTimezone] = useState(null);

    useEffect(() => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setUserTimezone(timezone);
    }, []);

    useEffect(() => {
        if (showCard) {
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
        }
    }, [dispatch, showCard]);

    const handleToQuest = () => {
        if (studentId && activeButton === "activities") {
            fetchCheckinsByStudent();
        }
    };

    const fetchCheckinsByStudent = () => {
        dispatch(
            getRecords({
                type: "checkin",
                endPoint: `${checkinEndPoints.collection}?student_id=${studentId}&time=today`,
                key: "data",
            })
        ).then((result) => {
            if (result.length) {
                const checkins = result;
                setQuestLog(
                    checkins.map((checkin) => ({
                        id: checkin.id,
                        activityName:
                            checkin.activity?.name || checkin.other_activity,
                        status: checkin.checkout_time
                            ? checkin.reason
                                ? "Finished (Early)"
                                : "Finished"
                            : "Ongoing",
                        checkInTime: checkin.checkin_time,
                        checkOutTime: checkin.checkout_time || null,
                        earlyReason: checkin.reason || null,
                    }))
                );
                const ongoingCheckin = checkins.find(
                    (c) => !c.checkout_time && c.student_id === studentId
                );
                if (ongoingCheckin) {
                    setIsCheckedIn(true);
                    setSelectedActivity(
                        activities.find(
                            (a) => a.id === ongoingCheckin.activity_id
                        ) || {
                            name: ongoingCheckin.other_activity,
                        }
                    );
                    setActivityId(ongoingCheckin.activity_id);
                    setEditableActivity(
                        ongoingCheckin.other_activity ||
                            ongoingCheckin.activity?.name
                    );

                    const now = DateTime.now().setZone(userTimezone);
                    const checkinTime = DateTime.fromISO(
                        ongoingCheckin.checkin_time,
                        { zone: "utc" }
                    ).setZone(userTimezone);
                    setTimer(
                        Math.floor(now.diff(checkinTime, "seconds").seconds)
                    );
                    startTimer();
                } else {
                    setIsCheckedIn(false);
                }
            } else {
                dispatch(
                    setToastMessage({
                        severity: "info",
                        summary:
                            "Hi " +
                            students.find((s) => s.id === studentId)?.name,
                        detail: "Ready for your first quest today?",
                    })
                );
            }
        });
    };

    const startTimer = () => {
        if (timerInterval) clearInterval(timerInterval);
        const interval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
        setTimerInterval(interval);
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const formatDateToLocal = (utcDate) => {
        if (!utcDate || !userTimezone) return "";
        const dt = DateTime.fromISO(utcDate, { zone: "utc" });
        if (!dt.isValid) {
            return "";
        }
        return dt.setZone(userTimezone).toFormat("dd MMMM yyyy, HH:mm:ss z");
    };

    const resetState = () => {
        setShowCard(false);
        setActiveButton(null);
        setQuestLog([]);
        setLevelId(null);
        setClassId(null);
        setStudentId(null);
        setActivityId(null);
        setSelectedActivity(null);
        setEditableActivity("");
        setShowCustomActivityInput(false);
        setIsCheckedIn(false);
        setTimer(0);
        setIsEarlyCheckout(false);
        setEarlyReason("");
        setError("");
    };

    const handleCheckin = () => {
        setLoading(true);
        setError("");
        const checkinData = {
            student_id: studentId,
            activity_id: activityId ? selectedActivity?.id : null,
            other_activity: activityId ? null : editableActivity,
        };
        dispatch(
            createRecord({
                type: "checkin",
                endPoint: checkinEndPoints.checkin,
                data: checkinData,
                returnData: true,
            })
        )
            .then((response) => {
                const result = response;
                const newCheckin = {
                    id: result.id || Date.now(),
                    student_id: studentId,
                    activity_id: activityId ? selectedActivity?.id : null,
                    checkin_time: result.checkin_time,
                    checkout_time: null,
                    other_activity: activityId ? null : editableActivity,
                    reason: null,
                };
                setQuestLog((prev) => [
                    ...prev,
                    {
                        id: newCheckin.id,
                        activityName: activityId
                            ? selectedActivity?.name
                            : editableActivity,
                        status: "Ongoing",
                        checkInTime: newCheckin.checkin_time,
                        checkOutTime: null,
                        earlyReason: null,
                    },
                ]);
                setIsCheckedIn(true);
                setTimer(0);
                // startTimer();
                dispatch(
                    setToastMessage({
                        severity: "success",
                        summary: "Checked In",
                        detail: "You have started your quest! Returning to Launch Pad.",
                    })
                );
                setShowCustomActivityInput(false);
                resetState();
            })
            .catch((err) => {
                setError(err.message || "Check-in failed");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleCheckout = () => {
        setLoading(true);
        setError("");
        const checkoutData = {
            student_id: studentId,
            reason: isEarlyCheckout ? earlyReason : null,
        };
        dispatch(
            createRecord({
                type: "checkin",
                endPoint: checkinEndPoints.checkout,
                data: checkoutData,
                returnData: true,
            })
        )
            .then((response) => {
                const result = response;
                const updatedCheckin = {
                    student_id: studentId,
                    checkout_time: result.checkout_time,
                    reason: isEarlyCheckout ? earlyReason : null,
                };
                // stopTimer();
                setQuestLog((prev) =>
                    prev.map((quest) =>
                        quest.id === result.id
                            ? {
                                  ...quest,
                                  status: isEarlyCheckout
                                      ? "Finished (Early)"
                                      : "Finished",
                                  checkOutTime: updatedCheckin.checkout_time,
                                  earlyReason: isEarlyCheckout
                                      ? earlyReason
                                      : null,
                              }
                            : quest
                    )
                );
                setIsCheckedIn(false);
                setTimer(0);
                setSelectedActivity(null);
                setActivityId(null);
                setEditableActivity("");
                setIsEarlyCheckout(false);
                dispatch(
                    setToastMessage({
                        severity: "info",
                        summary: "Checked Out",
                        detail: isEarlyCheckout
                            ? `Early checkout recorded. Reason: ${earlyReason}. Returning to Launch Pad.`
                            : "You have completed your quest! Returning to Launch Pad.",
                    })
                );
                setEarlyReason("");
                overlayRef.current.hide();
                resetState();
            })
            .catch((err) => {
                setError(err.message || "Check-out failed");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleBack = () => {
        resetState();
        dispatch(
            setToastMessage({
                severity: "info",
                summary: "Returned to Launch Pad",
                detail: "Select an option to continue.",
            })
        );
    };

    return (
        <div>
            <Header />
            <div
                className={`home-container ${
                    !showCard ? "with-background" : ""
                }`}
            >
                {!showCard && (
                    <>
                        <h4 className="launch-pad-title">The Launch Pad</h4>
                        <div className="card-container">
                            <div className="grid md:grid-cols-3 gap-4">
                                <Button
                                    label="Activities"
                                    onClick={() => {
                                        setActiveButton("activities");
                                        setShowCard(true);
                                    }}
                                />
                                <Button
                                    label="Ask Ms Vi"
                                    onClick={() => {
                                        setActiveButton("msvi");
                                        setShowCard(true);
                                    }}
                                />
                                <Button
                                    label="Facilities"
                                    onClick={() => {
                                        setActiveButton("facilities");
                                        setShowCard(true);
                                    }}
                                />
                            </div>
                            <div className="grid md:grid-cols-2 sm:w-1/2 sm:m-auto gap-4">
                                <Button
                                    label="JSEILPR"
                                    onClick={() =>
                                        window.open(
                                            "https://jseilpr.com/",
                                            "_blank"
                                        )
                                    }
                                />
                                <Button label="Another Link" />
                            </div>
                        </div>
                    </>
                )}
                {showCard && (
                    <div className="card-container">
                        <Button
                            icon="pi pi-arrow-left"
                            rounded
                            onClick={handleBack}
                            style={{
                                position: "relative",
                            }}
                        />
                        <Card>
                            <Toast ref={toast} />
                            <ConfirmPopup />
                            <Stepper ref={stepperRef} className="w-full" linear>
                                <StepperPanel header="Level">
                                    <div className="flex flex-col h-full">
                                        <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-y-auto max-h-32">
                                            {levels.map((level) => (
                                                <Button
                                                    key={level.id}
                                                    label={level.name}
                                                    onClick={() =>
                                                        setLevelId(level.id)
                                                    }
                                                    className={`${
                                                        levelId === level.id
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-gray-200"
                                                    }`}
                                                    size="small"
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
                                            size="small"
                                            onClick={() =>
                                                stepperRef.current.nextCallback()
                                            }
                                            disabled={!levelId}
                                        />
                                    </div>
                                </StepperPanel>
                                <StepperPanel header="Class">
                                    <div className="flex flex-col h-full">
                                        <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-y-auto max-h-32">
                                            {classes
                                                .filter(
                                                    (c) =>
                                                        c.level_id === levelId
                                                )
                                                .map((cls) => (
                                                    <Button
                                                        key={cls.id}
                                                        label={cls.name}
                                                        onClick={() =>
                                                            setClassId(cls.id)
                                                        }
                                                        className={`${
                                                            classId === cls.id
                                                                ? "bg-blue-500 text-white"
                                                                : "bg-gray-200"
                                                        }`}
                                                        size="small"
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
                                            size="small"
                                            onClick={() =>
                                                stepperRef.current.prevCallback()
                                            }
                                        />
                                        <Button
                                            label="Next"
                                            icon="pi pi-arrow-right"
                                            iconPos="right"
                                            size="small"
                                            onClick={() =>
                                                stepperRef.current.nextCallback()
                                            }
                                            disabled={!classId}
                                        />
                                    </div>
                                </StepperPanel>
                                <StepperPanel header="Character">
                                    <div className="flex flex-col h-full">
                                        <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-y-auto max-h-32">
                                            {students
                                                .filter(
                                                    (s) =>
                                                        s.class_id === classId
                                                )
                                                .map((student) => (
                                                    <Button
                                                        key={student.id}
                                                        label={student.name}
                                                        onClick={() =>
                                                            setStudentId(
                                                                student.id
                                                            )
                                                        }
                                                        className={`${
                                                            studentId ===
                                                            student.id
                                                                ? "bg-blue-500 text-white"
                                                                : "bg-gray-200"
                                                        }`}
                                                        size="small"
                                                        icon={
                                                            studentId ===
                                                            student.id
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
                                            size="small"
                                            onClick={() =>
                                                stepperRef.current.prevCallback()
                                            }
                                        />
                                        <Button
                                            label="Next"
                                            icon="pi pi-arrow-right"
                                            iconPos="right"
                                            size="small"
                                            onClick={() => {
                                                handleToQuest();
                                                stepperRef.current.nextCallback();
                                            }}
                                            disabled={!studentId}
                                        />
                                    </div>
                                </StepperPanel>
                                {activeButton === "activities" && (
                                    <StepperPanel header="Activities">
                                        <div className="flex flex-col h-full">
                                            <div className="flex-grow grid grid-cols-1 items-center gap-2">
                                                {studentId ? (
                                                    <>
                                                        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-5 flex-grow flex flex-wrap items-center max-h-48 overflow-y-auto">
                                                            <div className="justify-start mb-4">
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
                                                                            c.id ===
                                                                            classId
                                                                    )?.name
                                                                }
                                                                " level "
                                                                {
                                                                    levels.find(
                                                                        (l) =>
                                                                            l.id ===
                                                                            levelId
                                                                    )?.name
                                                                }
                                                                ". This is your
                                                                activities log
                                                                today (Timezone:{" "}
                                                                {userTimezone}
                                                                ):
                                                            </div>
                                                            <Accordion className="w-full">
                                                                {questLog.map(
                                                                    (quest) => (
                                                                        <AccordionTab
                                                                            key={
                                                                                quest.id
                                                                            }
                                                                            header={
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="truncate max-w-[100px] inline-block">
                                                                                        {
                                                                                            quest.activityName
                                                                                        }
                                                                                    </span>
                                                                                    <Badge
                                                                                        value={
                                                                                            quest.status
                                                                                        }
                                                                                        severity={
                                                                                            quest.status ===
                                                                                            "Ongoing"
                                                                                                ? "info"
                                                                                                : quest.status ===
                                                                                                  "Finished"
                                                                                                ? "success"
                                                                                                : "warning"
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            }
                                                                        >
                                                                            <div className="flex flex-col gap-2">
                                                                                <p>
                                                                                    <strong>
                                                                                        Activity:
                                                                                    </strong>{" "}
                                                                                    {
                                                                                        quest.activityName
                                                                                    }
                                                                                </p>
                                                                                <p>
                                                                                    <strong>
                                                                                        Check-In
                                                                                        Time:
                                                                                    </strong>{" "}
                                                                                    {formatDateToLocal(
                                                                                        quest.checkInTime
                                                                                    )}
                                                                                </p>
                                                                                {quest.checkOutTime && (
                                                                                    <p>
                                                                                        <strong>
                                                                                            Check-Out
                                                                                            Time:
                                                                                        </strong>{" "}
                                                                                        {formatDateToLocal(
                                                                                            quest.checkOutTime
                                                                                        )}
                                                                                    </p>
                                                                                )}
                                                                                {quest.status ===
                                                                                    "Finished (Early)" && (
                                                                                    <p>
                                                                                        <strong>
                                                                                            Reason:
                                                                                        </strong>{" "}
                                                                                        {
                                                                                            quest.earlyReason
                                                                                        }
                                                                                    </p>
                                                                                )}
                                                                                <p>
                                                                                    <strong>
                                                                                        Duration:
                                                                                    </strong>{" "}
                                                                                    {quest.checkOutTime
                                                                                        ? formatTime(
                                                                                              Math.floor(
                                                                                                  (new Date(
                                                                                                      quest.checkOutTime
                                                                                                  ) -
                                                                                                      new Date(
                                                                                                          quest.checkInTime
                                                                                                      )) /
                                                                                                      1000
                                                                                              )
                                                                                          )
                                                                                        : formatTime(
                                                                                              timer
                                                                                          )}
                                                                                </p>
                                                                            </div>
                                                                        </AccordionTab>
                                                                    )
                                                                )}
                                                            </Accordion>
                                                        </div>
                                                        {!isCheckedIn && (
                                                            <div>
                                                                <p>
                                                                    Please
                                                                    select your
                                                                    activity for
                                                                    today.
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div className="flex-grow grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                                {!isCheckedIn && (
                                                                    <>
                                                                        {activities.map(
                                                                            (
                                                                                activity
                                                                            ) => (
                                                                                <Button
                                                                                    key={
                                                                                        activity.id
                                                                                    }
                                                                                    label={
                                                                                        activity.name
                                                                                    }
                                                                                    onClick={() => {
                                                                                        setActivityId(
                                                                                            activity.id
                                                                                        );
                                                                                        setSelectedActivity(
                                                                                            activity
                                                                                        );
                                                                                        setEditableActivity(
                                                                                            ""
                                                                                        );
                                                                                        setShowCustomActivityInput(
                                                                                            false
                                                                                        );
                                                                                    }}
                                                                                    className={`${
                                                                                        activityId ===
                                                                                        activity.id
                                                                                            ? "bg-blue-500 text-white"
                                                                                            : "bg-gray-200"
                                                                                    }`}
                                                                                    size="small"
                                                                                    icon={
                                                                                        activityId ===
                                                                                        activity.id
                                                                                            ? "pi pi-check"
                                                                                            : null
                                                                                    }
                                                                                />
                                                                            )
                                                                        )}
                                                                        <Button
                                                                            label={
                                                                                showCustomActivityInput
                                                                                    ? "Cancel Custom Activity"
                                                                                    : "Other Activity"
                                                                            }
                                                                            onClick={() => {
                                                                                setShowCustomActivityInput(
                                                                                    !showCustomActivityInput
                                                                                );
                                                                                setActivityId(
                                                                                    null
                                                                                );
                                                                                setSelectedActivity(
                                                                                    null
                                                                                );
                                                                                setEditableActivity(
                                                                                    ""
                                                                                );
                                                                            }}
                                                                            className="bg-gray-200"
                                                                            size="small"
                                                                            icon={
                                                                                showCustomActivityInput
                                                                                    ? "pi pi-times"
                                                                                    : "pi pi-plus"
                                                                            }
                                                                        />
                                                                    </>
                                                                )}
                                                            </div>
                                                            {showCustomActivityInput &&
                                                                !isCheckedIn && (
                                                                    <div className="mt-1">
                                                                        <InputText
                                                                            value={
                                                                                editableActivity
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                setEditableActivity(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                );
                                                                                setSelectedActivity(
                                                                                    {
                                                                                        name: e
                                                                                            .target
                                                                                            .value,
                                                                                    }
                                                                                );
                                                                            }}
                                                                            placeholder="Enter other activity"
                                                                            className="w-full"
                                                                        />
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    "Your Activity"
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex pt-2 sm:pt-4 justify-between">
                                            <Button
                                                label="Back"
                                                severity="secondary"
                                                icon="pi pi-arrow-left"
                                                size="small"
                                                onClick={(event) =>
                                                    confirmPopup({
                                                        target: event.currentTarget,
                                                        message:
                                                            "Are you sure you want to go back?",
                                                        icon: "pi pi-exclamation-triangle",
                                                        accept: () => {
                                                            dispatch(
                                                                setToastMessage(
                                                                    {
                                                                        severity:
                                                                            "info",
                                                                        summary:
                                                                            "Stay focus kiddo.",
                                                                        detail: "Moved back to Character step",
                                                                    }
                                                                )
                                                            );
                                                            stepperRef.current.prevCallback();
                                                            setQuestLog([]);
                                                        },
                                                        reject: () => {
                                                            dispatch(
                                                                setToastMessage(
                                                                    {
                                                                        severity:
                                                                            "info",
                                                                        summary:
                                                                            "Nice stay focus on your activity.",
                                                                        detail: "Stayed on Activities step",
                                                                    }
                                                                )
                                                            );
                                                        },
                                                    })
                                                }
                                            />
                                            {error && (
                                                <p
                                                    style={{
                                                        color: "red",
                                                        marginLeft: "1rem",
                                                    }}
                                                >
                                                    {error}
                                                </p>
                                            )}
                                            <Button
                                                label={
                                                    isCheckedIn
                                                        ? "Check Out"
                                                        : "Check In"
                                                }
                                                icon={
                                                    isCheckedIn
                                                        ? "pi pi-sign-out"
                                                        : "pi pi-sign-in"
                                                }
                                                iconPos="right"
                                                severity={
                                                    isCheckedIn
                                                        ? "warning"
                                                        : undefined
                                                }
                                                size="small"
                                                onClick={(event) => {
                                                    if (!isCheckedIn) {
                                                        confirmPopup({
                                                            target: event.currentTarget,
                                                            message:
                                                                "Are you sure you want to check in?",
                                                            icon: "pi pi-exclamation-triangle",
                                                            accept: () =>
                                                                handleCheckin(),
                                                            reject: () => {
                                                                dispatch(
                                                                    setToastMessage(
                                                                        {
                                                                            severity:
                                                                                "warn",
                                                                            summary:
                                                                                "Action Cancelled",
                                                                            detail: "You stayed checked out.",
                                                                        }
                                                                    )
                                                                );
                                                            },
                                                        });
                                                    } else {
                                                        overlayRef.current.toggle(
                                                            event
                                                        );
                                                    }
                                                }}
                                                disabled={
                                                    (!selectedActivity &&
                                                        !isCheckedIn) ||
                                                    (!editableActivity &&
                                                        showCustomActivityInput) ||
                                                    loading
                                                }
                                            />
                                        </div>
                                        <OverlayPanel
                                            ref={overlayRef}
                                            showCloseIcon
                                        >
                                            <div className="flex flex-col gap-4">
                                                <h3>Confirm Check Out</h3>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        inputId="earlyCheckout"
                                                        checked={
                                                            isEarlyCheckout
                                                        }
                                                        onChange={(e) =>
                                                            setIsEarlyCheckout(
                                                                e.checked
                                                            )
                                                        }
                                                    />
                                                    <label htmlFor="earlyCheckout">
                                                        Early Checkout?
                                                    </label>
                                                </div>
                                                {isEarlyCheckout && (
                                                    <InputTextarea
                                                        value={earlyReason}
                                                        onChange={(e) =>
                                                            setEarlyReason(
                                                                e.target.value
                                                            )
                                                        }
                                                        rows={3}
                                                        placeholder="Reason for early checkout"
                                                        className="w-full"
                                                    />
                                                )}
                                                <Button
                                                    label="Confirm"
                                                    size="small"
                                                    onClick={() =>
                                                        confirmPopup({
                                                            target: overlayRef.current.getElement(),
                                                            message: `Are you sure you want to check out${
                                                                isEarlyCheckout
                                                                    ? " early"
                                                                    : ""
                                                            }?`,
                                                            icon: "pi pi-exclamation-triangle",
                                                            accept: () =>
                                                                handleCheckout(),
                                                            reject: () => {
                                                                dispatch(
                                                                    setToastMessage(
                                                                        {
                                                                            severity:
                                                                                "warn",
                                                                            summary:
                                                                                "Action Cancelled",
                                                                            detail: "You stayed checked in.",
                                                                        }
                                                                    )
                                                                );
                                                                overlayRef.current.hide();
                                                            },
                                                        })
                                                    }
                                                    disabled={
                                                        isEarlyCheckout &&
                                                        !earlyReason.trim()
                                                    }
                                                />
                                            </div>
                                        </OverlayPanel>
                                    </StepperPanel>
                                )}
                                {activeButton === "msvi" && (
                                    <StepperPanel header="Ask Ms Vi">
                                        <div className="flex flex-col h-full">
                                            <div className="flex-grow grid grid-cols-1 justify-start items-center gap-2">
                                                <p>
                                                    Ask Ms Vi content goes here.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex pt-2 sm:pt-4 justify-start">
                                            <Button
                                                label="Back"
                                                severity="secondary"
                                                icon="pi pi-arrow-left"
                                                size="small"
                                                onClick={(event) =>
                                                    confirmPopup({
                                                        target: event.currentTarget,
                                                        message:
                                                            "Are you sure you want to go back?",
                                                        icon: "pi pi-exclamation-triangle",
                                                        accept: () => {
                                                            dispatch(
                                                                setToastMessage(
                                                                    {
                                                                        severity:
                                                                            "info",
                                                                        summary:
                                                                            "See you again.",
                                                                        detail: "Moved back to Character step",
                                                                    }
                                                                )
                                                            );
                                                            stepperRef.current.prevCallback();
                                                            setQuestLog([]);
                                                        },
                                                        reject: () => {
                                                            dispatch(
                                                                setToastMessage(
                                                                    {
                                                                        severity:
                                                                            "info",
                                                                        summary:
                                                                            "Tell me, whats your problem.",
                                                                        detail: "Stayed on Ask Ms Vi step",
                                                                    }
                                                                )
                                                            );
                                                        },
                                                    })
                                                }
                                            />
                                            {error && (
                                                <p
                                                    style={{
                                                        color: "red",
                                                        marginLeft: "1rem",
                                                    }}
                                                >
                                                    {error}
                                                </p>
                                            )}
                                        </div>
                                    </StepperPanel>
                                )}
                                {activeButton === "facilities" && (
                                    <StepperPanel header="Facilities Booking">
                                        <div className="flex flex-col h-full">
                                            <div className="flex-grow grid grid-cols-1 justify-start items-center gap-2">
                                                <p>
                                                    Facilities Booking content
                                                    goes here.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex pt-2 sm:pt-4 justify-start">
                                            <Button
                                                label="Back"
                                                severity="secondary"
                                                icon="pi pi-arrow-left"
                                                size="small"
                                                onClick={(event) =>
                                                    confirmPopup({
                                                        target: event.currentTarget,
                                                        message:
                                                            "Are you sure you want to go back?",
                                                        icon: "pi pi-exclamation-triangle",
                                                        accept: () => {
                                                            dispatch(
                                                                setToastMessage(
                                                                    {
                                                                        severity:
                                                                            "info",
                                                                        summary:
                                                                            "See you again.",
                                                                        detail: "Moved back to Character step",
                                                                    }
                                                                )
                                                            );
                                                            stepperRef.current.prevCallback();
                                                            setQuestLog([]);
                                                        },
                                                        reject: () => {
                                                            dispatch(
                                                                setToastMessage(
                                                                    {
                                                                        severity:
                                                                            "info",
                                                                        summary:
                                                                            "What facility you want?",
                                                                        detail: "Stayed on Facilities step",
                                                                    }
                                                                )
                                                            );
                                                        },
                                                    })
                                                }
                                            />
                                            {error && (
                                                <p
                                                    style={{
                                                        color: "red",
                                                        marginLeft: "1rem",
                                                    }}
                                                >
                                                    {error}
                                                </p>
                                            )}
                                        </div>
                                    </StepperPanel>
                                )}
                            </Stepper>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
