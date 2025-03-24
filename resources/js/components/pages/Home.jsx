import React, { useEffect, useRef, useState } from "react";
import { setToastMessage } from "../store/global-slice";
import { useDispatch, useSelector } from "react-redux";
import { getRecords, createRecord } from "../store/global-slice";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Badge } from "primereact/badge";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { OverlayPanel } from "primereact/overlaypanel";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { DateTime } from "luxon";
import Header from "../shared/layout/Header";

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
    const [levelId, setLevelId] = useState(null);
    const [classId, setClassId] = useState(null);
    const [studentId, setStudentId] = useState(null);
    const [activityId, setActivityId] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [editableActivity, setEditableActivity] = useState("");
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

    const handleToQuest = () => {
        if (studentId) {
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
            if (result) {
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
                    const checkinTime = DateTime.fromISO(ongoingCheckin.checkin_time, { zone: "utc" }).setZone(userTimezone);
                    setTimer(
                        Math.floor(now.diff(checkinTime, "seconds").seconds)
                    );
                    startTimer(
                        ongoingCheckin.activity?.name ||
                            ongoingCheckin.other_activity
                    );
                }
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

    const stopTimer = () => {
        clearInterval(timerInterval);
        setTimerInterval(null);
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
            console.error("Invalid date:", utcDate);
            return "";
        }
        return dt.setZone(userTimezone).toFormat("dd MMMM yyyy, HH:mm:ss z");
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
                console.log(response.checkin_time);
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
                startTimer(selectedActivity?.name || editableActivity);
                dispatch(
                    setToastMessage({
                        severity: "success",
                        summary: "Checked In",
                        detail: "You have started your quest!",
                    })
                );
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
                stopTimer();
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
                            ? `Early checkout recorded. Reason: ${earlyReason}`
                            : "You have completed your quest!",
                    })
                );
                setEarlyReason("");
                overlayRef.current.hide();
            })
            .catch((err) => {
                setError(err.message || "Check-out failed");
            })
            .finally(() => {
                setLoading(false);
            });
    };

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
                                            className={`p-1 sm:p-2 ${
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
                                    className="p-1 sm:p-2"
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
                                                className={`p-1 sm:p-2 ${
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
                                    className="p-1 sm:p-2"
                                />
                                <Button
                                    label="Next"
                                    icon="pi pi-arrow-right"
                                    iconPos="right"
                                    onClick={() =>
                                        stepperRef.current.nextCallback()
                                    }
                                    disabled={!classId}
                                    className="p-1 sm:p-2"
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
                                                className={`p-1 sm:p-2 ${
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
                                    className="p-1 sm:p-2"
                                />
                                <Button
                                    label="Next"
                                    icon="pi pi-arrow-right"
                                    iconPos="right"
                                    onClick={() => {
                                        handleToQuest();
                                        stepperRef.current.nextCallback();
                                    }}
                                    disabled={!studentId}
                                    className="p-1 sm:p-2"
                                />
                            </div>
                        </StepperPanel>
                        <StepperPanel header="Quest">
                            <div className="flex flex-col h-full">
                                <div className="flex-grow grid grid-cols-1 justify-start items-center gap-2">
                                    {studentId ? (
                                        <>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-5 flex-grow flex flex-wrap justify-start items-center">
                                                <div>
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
                                                    ". This is your quest log
                                                    today (Timezone:{" "}
                                                    {userTimezone}):
                                                </div>
                                            </div>
                                            <div className="flex-grow grid grid-cols-1 gap-2">
                                                <Accordion>
                                                    {questLog.map((quest) => (
                                                        <AccordionTab
                                                            key={quest.id}
                                                            header={
                                                                <div className="flex items-center gap-2">
                                                                    <span>
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
                                                                        </strong>
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
                                                    ))}
                                                </Accordion>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {isCheckedIn ? (
                                                        <Button
                                                            label={`${
                                                                selectedActivity?.name ||
                                                                editableActivity
                                                            } - ${formatTime(
                                                                timer
                                                            )}`}
                                                            icon="pi pi-spin pi-spinner"
                                                            disabled
                                                            className="w-full mt-1 p-1 sm:p-2 text-xs sm:text-sm md:text-base"
                                                        />
                                                    ) : (
                                                        <Dropdown
                                                            editable
                                                            showClear
                                                            value={
                                                                selectedActivity
                                                            }
                                                            options={activities}
                                                            onChange={(e) => {
                                                                setSelectedActivity(
                                                                    e.value
                                                                );
                                                                setActivityId(
                                                                    e.value
                                                                        ?.id ||
                                                                        null
                                                                );
                                                                setEditableActivity(
                                                                    e.value ||
                                                                        ""
                                                                );
                                                            }}
                                                            optionLabel="name"
                                                            filter
                                                            placeholder="Pick or create your quest!"
                                                            className="w-full mt-1"
                                                            itemTemplate={(
                                                                option
                                                            ) => (
                                                                <div className="max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
                                                                    <span className="font-bold text-wrap">
                                                                        {
                                                                            option.name
                                                                        }
                                                                    </span>
                                                                    <br />
                                                                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-600 text-wrap">
                                                                        {
                                                                            option.description
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                            valueTemplate={(
                                                                option
                                                            ) =>
                                                                option ? (
                                                                    <div className="max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
                                                                        <span className="font-bold text-wrap">
                                                                            {
                                                                                option.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    "Pick or create your quest!"
                                                                )
                                                            }
                                                        />
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
                                                            loading
                                                        }
                                                        className="p-1 sm:p-2"
                                                    />
                                                </div>
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
                                    disabled={isCheckedIn}
                                    className="p-1 sm:p-2"
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
                            <OverlayPanel ref={overlayRef} showCloseIcon>
                                <div className="flex flex-col gap-4">
                                    <h3>Confirm Check Out</h3>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            inputId="earlyCheckout"
                                            checked={isEarlyCheckout}
                                            onChange={(e) =>
                                                setIsEarlyCheckout(e.checked)
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
                                                setEarlyReason(e.target.value)
                                            }
                                            rows={3}
                                            placeholder="Reason for early checkout"
                                            className="w-full"
                                        />
                                    )}
                                    <Button
                                        label="Confirm"
                                        onClick={() =>
                                            confirmPopup({
                                                target: overlayRef.current.getElement(),
                                                message: `Are you sure you want to check out${
                                                    isEarlyCheckout
                                                        ? " early"
                                                        : ""
                                                }?`,
                                                icon: "pi pi-exclamation-triangle",
                                                accept: () => handleCheckout(),
                                                reject: () => {
                                                    dispatch(
                                                        setToastMessage({
                                                            severity: "warn",
                                                            summary:
                                                                "Action Cancelled",
                                                            detail: "You stayed checked in.",
                                                        })
                                                    );
                                                    overlayRef.current.hide();
                                                },
                                            })
                                        }
                                        className="p-1 sm:p-2"
                                        disabled={
                                            isEarlyCheckout &&
                                            !earlyReason.trim()
                                        }
                                    />
                                </div>
                            </OverlayPanel>
                        </StepperPanel>
                    </Stepper>
                </Card>
            </div>
        </div>
    );
}

export default Home;
