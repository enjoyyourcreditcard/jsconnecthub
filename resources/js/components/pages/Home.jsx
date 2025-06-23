import React, { useRef, useEffect, useState } from "react";
// import io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import {
    getRecords,
    createRecord,
    updateRecord,
    setToastMessage,
} from "../store/global-slice";
import { useAuthUser } from "react-auth-kit";
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
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import { DateTime } from "luxon";
import Header from "../shared/layout/Header";
import _ from "lodash"; // Import Lodash
import "../../../css/home.css";

function Home() {
    const auth = useAuthUser();
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
        bookings: { data: bookings = [], endPoints: bookingEndPoints },
        facilities: { data: facilities = [], endPoints: facilityEndPoints },
        support_strategies: {
            data: supportStrategies = [],
            endPoints: strategyEndPoints,
        },
        questions: { data: questions = [], endPoints: questionEndPoints },
        counsels: { data: counsels = [], endPoints: counselEndPoints },
        blocked_dates: {
            data: blockedDate = [],
            endPoints: blockedDateEndPoints,
        },
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
    const [bookingId, setBookingId] = useState(null);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isBooked, setIsBooked] = useState(false);
    const [bookingLog, setBookingLog] = useState([]);
    const [facilityBookings, setFacilityBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [userTimezone, setUserTimezone] = useState(null);
    const [bookingDate, setBookingDate] = useState(null);
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
    const [selectedStrategy, setSelectedStrategy] = useState(null);
    const [answers, setAnswers] = useState({});

    // const socket = io("http://localhost:6001");

    // useEffect(() => {
    //     socket.on("message", (msg) => {
    //         console.log(msg);
    //     });
    //     return () => {
    //         socket.off("message");
    //         socket.disconnect();
    //     };
    // }, []);

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
            dispatch(
                getRecords({
                    type: "facilities",
                    endPoint: facilityEndPoints.collection,
                    key: "data",
                })
            );
            dispatch(
                getRecords({
                    type: "support_strategies",
                    endPoint: strategyEndPoints.collection,
                    key: "data",
                })
            );
            dispatch(
                getRecords({
                    type: "questions",
                    endPoint: questionEndPoints.collection,
                    key: "data",
                })
            );
            dispatch(
                getRecords({
                    type: "blocked_dates",
                    endPoint: blockedDateEndPoints.collection,
                    key: "data",
                })
            );
        }
    }, [dispatch, showCard]);

    const capitalize = (str) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const handleToQuest = () => {
        if (studentId && activeButton === "activities") {
            fetchCheckinsByStudent();
        } else if (studentId && activeButton === "facilities") {
            fetchBookingsByStudent();
        } else if (studentId && activeButton === "msvi") {
            setAnswers({});
            setSelectedStrategy(null);
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

    const fetchBookingsByStudent = () => {
        dispatch(
            getRecords({
                type: "bookings",
                endPoint: `${bookingEndPoints.collection}?student_id=${studentId}&time=today`,
                key: "data",
            })
        ).then((result) => {
            if (result.length) {
                const bookings = result;
                setBookingLog(
                    bookings.map((booking) => ({
                        id: booking.id,
                        facilityName: booking.facility?.name,
                        status: booking.status,
                        startTime: booking.start_time,
                        endTime: booking.end_time,
                    }))
                );
                const activeBooking = bookings.find(
                    (b) =>
                        (b.status === "requested" || b.status === "reserved") &&
                        b.student_id === studentId
                );
                if (activeBooking) {
                    setIsBooked(true);
                    setSelectedFacility(
                        facilities.find(
                            (f) => f.id === activeBooking.facility_id
                        )
                    );
                    setBookingId(activeBooking.id);
                } else {
                    setIsBooked(false);
                }
            } else {
                dispatch(
                    setToastMessage({
                        severity: "info",
                        summary:
                            "Hi " +
                            students.find((s) => s.id === studentId)?.name,
                        detail: "Ready to book a facility today?",
                    })
                );
            }
        });
    };

    const fetchFacilityBookings = (facilityId) => {
        dispatch(
            getRecords({
                type: "bookings",
                endPoint: `${bookingEndPoints.collection}?facility_id=${facilityId}&time=today`,
                key: "data",
            })
        ).then((result) => {
            if (result.length) {
                setFacilityBookings(
                    result
                        .filter((booking) => booking.status === "reserved")
                        .map((booking) => ({
                            id: booking.id,
                            start_time: booking.start_time,
                            end_time: booking.end_time,
                        }))
                );
            } else {
                setFacilityBookings([]);
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

    const formatDateToLocal = (utcDate, format = null) => {
        if (!utcDate || !userTimezone) return "";
        const dt = DateTime.fromISO(utcDate, { zone: "utc" });
        if (!dt.isValid) {
            return "";
        }
        if (format === "time") {
            return dt.setZone(userTimezone).toFormat("HH:mm:ss");
        } else {
            return dt.setZone(userTimezone).toFormat("dd MMMM yyyy, HH:mm:ss");
        }
    };

    const resetState = () => {
        setShowCard(false);
        setActiveButton(null);
        setQuestLog([]);
        setBookingLog([]);
        setFacilityBookings([]);
        setLevelId(null);
        setClassId(null);
        setStudentId(null);
        setActivityId(null);
        setBookingId(null);
        setSelectedActivity(null);
        setSelectedFacility(null);
        setSelectedLocation(null);
        setEditableActivity("");
        setShowCustomActivityInput(false);
        setIsCheckedIn(false);
        setIsBooked(false);
        setTimer(0);
        setIsEarlyCheckout(false);
        setEarlyReason("");
        setError("");
        setBookingDate(null);
        setSelectedTimeSlots([]);
        setSelectedStrategy(null);
        setAnswers({});
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

    const formatDateTimeForMySQL = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return null;
        }
        const pad = (n) => String(n).padStart(2, "0");
        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1);
        const day = pad(date.getUTCDate());
        const hours = pad(date.getUTCHours());
        const minutes = pad(date.getUTCMinutes());
        return `${year}-${month}-${day} ${hours}:${minutes}:00`;
    };

    const handleReserve = () => {
        setLoading(true);
        setError("");

        if (!bookingDate || !selectedTimeSlots.length) {
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Missing Information",
                    detail: "Please select a date and at least one time slot.",
                })
            );
            setLoading(false);
            return;
        }

        const updatedTimeSlots = updateTimeSlots();
        const startTime = updatedTimeSlots[selectedTimeSlots[0]].start;
        const endTime =
            updatedTimeSlots[selectedTimeSlots[selectedTimeSlots.length - 1]]
                .end;

        const bookingData = {
            student_id: studentId,
            facility_id: selectedFacility?.id,
            start_time: formatDateTimeForMySQL(startTime),
            end_time: formatDateTimeForMySQL(endTime),
        };

        if (!bookingData.start_time || !bookingData.end_time) {
            setError("Invalid date/time format");
            setLoading(false);
            return;
        }

        dispatch(
            createRecord({
                type: "bookings",
                endPoint: bookingEndPoints.booking,
                data: bookingData,
                returnData: true,
            })
        )
            .then((response) => {
                const result = response;
                const newBooking = {
                    id: result.id || Date.now(),
                    facilityName: selectedFacility?.name,
                    status: "Requested",
                    startTime: result.start_time,
                    endTime: result.end_time,
                };
                setBookingLog((prev) => [...prev, newBooking]);
                setIsBooked(true);
                setBookingId(result.id);
                dispatch(
                    setToastMessage({
                        severity: "success",
                        summary: "Facility Reserved",
                        detail: `You have reserved ${selectedFacility?.name}! Returning to Launch Pad.`,
                    })
                );
                resetState();
            })
            .catch((err) => {
                console.error("Booking error:", err);
                setError(err.message || "Reservation failed");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleCancelBooking = (bookingId, facilityName) => {
        setLoading(true);
        setError("");
        const cancelData = {
            status: "cancelled",
        };
        dispatch(
            updateRecord({
                type: "bookings",
                endPoint: `${bookingEndPoints.cancel}${bookingId}`,
                data: cancelData,
                returnData: true,
            })
        )
            .then((response) => {
                const result = response;
                setBookingLog((prev) =>
                    prev.map((booking) =>
                        booking.id === result.id
                            ? {
                                  ...booking,
                                  status: "Cancelled",
                              }
                            : booking
                    )
                );
                dispatch(
                    setToastMessage({
                        severity: "info",
                        summary: "Booking Cancelled",
                        detail: `Reservation for ${facilityName} cancelled.`,
                    })
                );
                setIsBooked(false);
                setSelectedFacility(null);
                setBookingId(null);
                fetchBookingsByStudent();
            })
            .catch((err) => {
                setError(err.message || "Cancellation failed");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleAnswerChange = (questionId, value, questionType) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: { value, type: questionType },
        }));
    };

    const validateAnswers = () => {
        if (!selectedStrategy) {
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "No Strategy Selected",
                    detail: "Please select a support strategy.",
                })
            );
            return false;
        }

        const strategyQuestions = questions.filter(
            (q) => q.support_strategy_id === selectedStrategy.id
        );
        for (const question of strategyQuestions) {
            if (
                !answers[question.id] ||
                (question.type === "text" &&
                    answers[question.id].value.trim() === "") ||
                (question.type === "radio" && !answers[question.id].value)
            ) {
                dispatch(
                    setToastMessage({
                        severity: "error",
                        summary: "Incomplete Form",
                        detail: `Please answer the question: ${question.text}`,
                    })
                );
                return false;
            }
        }
        return true;
    };

    const handleSubmitAnswers = () => {
        if (!validateAnswers()) return;

        setLoading(true);
        setError("");
        const counselData = {
            student_id: studentId,
            support_strategy_id: selectedStrategy.id,
            question_id: [],
            answer: [],
        };

        const strategyQuestions = questions
            .filter((q) => q.support_strategy_id === selectedStrategy.id)
            .sort((a, b) => a.order - b.order);

        strategyQuestions.forEach((question) => {
            counselData.question_id.push(question.id);
            const answer = answers[question.id];
            counselData.answer.push(
                answer.type === "text" ? answer.value : parseInt(answer.value)
            );
        });

        dispatch(
            createRecord({
                type: "counsels",
                endPoint: counselEndPoints.submit,
                data: counselData,
                returnData: true,
            })
        )
            .then((response) => {
                dispatch(
                    setToastMessage({
                        severity: "success",
                        summary: "Counsel Submitted",
                        detail: "Your answers have been submitted to Ms Vi! Returning to Launch Pad.",
                    })
                );
                resetState();
            })
            .catch((err) => {
                setError(err.message || "Submission failed");
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

    const timeSlots = [
        { label: "2:00 PM - 2:30 PM", start: null, end: null, index: 0 },
        { label: "2:30 PM - 3:00 PM", start: null, end: null, index: 1 },
        { label: "3:00 PM - 3:30 PM", start: null, end: null, index: 2 },
        { label: "3:30 PM - 4:00 PM", start: null, end: null, index: 3 },
        { label: "4:00 PM - 4:30 PM", start: null, end: null, index: 4 },
        { label: "4:30 PM - 5:00 PM", start: null, end: null, index: 5 },
    ];

    const updateTimeSlots = () => {
        if (!bookingDate) return timeSlots;
        return timeSlots.map((slot, index) => {
            const startHour = 14 + Math.floor(index / 2);
            const startMinute = index % 2 === 0 ? 0 : 30;
            const endHour = startMinute === 30 ? startHour + 1 : startHour;
            const endMinute = startMinute === 30 ? 0 : 30;
            return {
                ...slot,
                start: new Date(
                    bookingDate.getFullYear(),
                    bookingDate.getMonth(),
                    bookingDate.getDate(),
                    startHour,
                    startMinute
                ),
                end: new Date(
                    bookingDate.getFullYear(),
                    bookingDate.getMonth(),
                    bookingDate.getDate(),
                    endHour,
                    endMinute
                ),
            };
        });
    };

    const handleTimeSlotChange = (index) => {
        let newSelectedSlots = [...selectedTimeSlots];
        if (newSelectedSlots.includes(index)) {
            newSelectedSlots = newSelectedSlots.filter((i) => i !== index);
        } else {
            newSelectedSlots.push(index);
            newSelectedSlots.sort((a, b) => a - b);
            if (newSelectedSlots.length > 1) {
                const minIndex = Math.min(...newSelectedSlots);
                const maxIndex = Math.max(...newSelectedSlots);
                newSelectedSlots = Array.from(
                    { length: maxIndex - minIndex + 1 },
                    (_, i) => minIndex + i
                );
            }
        }
        setSelectedTimeSlots(newSelectedSlots);
    };

    return (
        <div>
            <Header />
            <div
                className={`home-container ${
                    // !showCard && auth() === null ? "with-background" : ""
                    auth() === null ? "with-background" : ""
                }`}
            >
                {!showCard && (
                    <div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-9/12 2xl:w-1/2 flex flex-col gap-2 md:gap-6">
                        {auth() === null && (
                            <h4 className="launch-pad-title">The Launch Pad</h4>
                        )}
                        <div className="grid md:grid-cols-3 gap-2 md:gap-6">
                            <Button
                                label="Checkin/Checkout"
                                severity="success"
                                onClick={() => {
                                    setActiveButton("activities");
                                    setShowCard(true);
                                }}
                                className="effected"
                            />
                            <Button
                                label="Facility Reservations"
                                severity="info"
                                onClick={() => {
                                    setActiveButton("facilities");
                                    setShowCard(true);
                                }}
                                className="effected"
                            />
                            <Button
                                label="Ask Ms Vi"
                                severity="warning"
                                onClick={() => {
                                    setActiveButton("msvi");
                                    setShowCard(true);
                                }}
                                className="effected"
                            />
                        </div>
                        {/* <div className="grid md:grid-cols-2 gap-2 md:gap-6 w-full md:w-1/2 sm:m-auto">
                            <Button label="Another Link" className="effected" />
                            <Button
                                label="JSEILPR"
                                severity="secondary"
                                onClick={() =>
                                    window.open(
                                        "https://jseilpr.com/",
                                        "_blank"
                                    )
                                }
                                className="effected"
                            />
                        </div> */}
                    </div>
                )}
                {showCard && (
                    <div className="w-11/12 sm:w-11/12 md:w-10/12 flex flex-col gap-4">
                        <Button
                            icon="pi pi-home"
                            rounded
                            size="small"
                            onClick={handleBack}
                            style={{
                                position: "relative",
                                width: "40px",
                                height: "40px",
                            }}
                        />
                        <Card>
                            <Toast ref={toast} />
                            <ConfirmPopup />
                            <Stepper ref={stepperRef} className="w-full" linear>
                                <StepperPanel header="Level">
                                    <div className="flex flex-col h-full">
                                        <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
                                            {_.chunk(
                                                levels,
                                                window.innerWidth >= 640 ? 3 : 2
                                            ).map((row, rowIndex) => (
                                                <div
                                                    key={rowIndex}
                                                    className="centered-row"
                                                    style={{
                                                        "--num-columns":
                                                            window.innerWidth >=
                                                            640
                                                                ? 3
                                                                : 2,
                                                    }}
                                                >
                                                    {row.map((level) => (
                                                        <Button
                                                            key={level.id}
                                                            label={level.name}
                                                            onClick={() =>
                                                                setLevelId(
                                                                    level.id
                                                                )
                                                            }
                                                            className={`stretch-button ${
                                                                levelId ===
                                                                level.id
                                                                    ? "bg-blue-500 text-white"
                                                                    : "bg-gray-200"
                                                            }`}
                                                            size="small"
                                                            icon={
                                                                levelId ===
                                                                level.id
                                                                    ? "pi pi-check"
                                                                    : null
                                                            }
                                                        />
                                                    ))}
                                                </div>
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
                                        <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
                                            {_.chunk(
                                                classes.filter(
                                                    (c) =>
                                                        c.level_id === levelId
                                                ),
                                                window.innerWidth >= 640 ? 3 : 2
                                            ).map((row, rowIndex) => (
                                                <div
                                                    key={rowIndex}
                                                    className="centered-row"
                                                    style={{
                                                        "--num-columns":
                                                            window.innerWidth >=
                                                            640
                                                                ? 3
                                                                : 2,
                                                    }}
                                                >
                                                    {row.map((cls) => (
                                                        <Button
                                                            key={cls.id}
                                                            label={cls.name}
                                                            onClick={() =>
                                                                setClassId(
                                                                    cls.id
                                                                )
                                                            }
                                                            className={`stretch-button ${
                                                                classId ===
                                                                cls.id
                                                                    ? "bg-blue-500 text-white"
                                                                    : "bg-gray-200"
                                                            }`}
                                                            size="small"
                                                            icon={
                                                                classId ===
                                                                cls.id
                                                                    ? "pi pi-check"
                                                                    : null
                                                            }
                                                        />
                                                    ))}
                                                </div>
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
                                <StepperPanel header="Name">
                                    <div className="flex flex-col h-full">
                                        <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
                                            {_.chunk(
                                                students.filter(
                                                    (s) =>
                                                        s.class_id === classId
                                                ),
                                                window.innerWidth >= 640 ? 4 : 2
                                            ).map((row, rowIndex) => (
                                                <div
                                                    key={rowIndex}
                                                    className="centered-row"
                                                    style={{
                                                        "--num-columns":
                                                            window.innerWidth >=
                                                            640
                                                                ? 4
                                                                : 2,
                                                    }}
                                                >
                                                    {row.map((student) => (
                                                        <Button
                                                            key={student.id}
                                                            label={student.name}
                                                            onClick={() =>
                                                                setStudentId(
                                                                    student.id
                                                                )
                                                            }
                                                            className={`stretch-button ${
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
                                                        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-5 flex-grow flex flex-wrap items-center max-h-64 overflow-y-auto">
                                                            <div className="justify-start">
                                                                This is your
                                                                activities log
                                                                today (Timezone:{" "}
                                                                {userTimezone}):
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
                                                                                    <span className="truncate max-w-[100px] sm:max-w-[240px] inline-block">
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
                                                        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                                                            {!isCheckedIn && (
                                                                <>
                                                                    {_.chunk(
                                                                        [
                                                                            ...activities,
                                                                            {
                                                                                id: "other",
                                                                                name: showCustomActivityInput
                                                                                    ? "Cancel Custom Activity"
                                                                                    : "Other Activity",
                                                                            },
                                                                        ],
                                                                        window.innerWidth >=
                                                                            640
                                                                            ? 4
                                                                            : 2
                                                                    ).map(
                                                                        (
                                                                            row,
                                                                            rowIndex
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    rowIndex
                                                                                }
                                                                                className="centered-row"
                                                                                style={{
                                                                                    "--num-columns":
                                                                                        window.innerWidth >=
                                                                                        640
                                                                                            ? 4
                                                                                            : 2,
                                                                                }}
                                                                            >
                                                                                {row.map(
                                                                                    (
                                                                                        activity
                                                                                    ) =>
                                                                                        activity.id ===
                                                                                        "other" ? (
                                                                                            <Button
                                                                                                key={
                                                                                                    activity.id
                                                                                                }
                                                                                                label={
                                                                                                    activity.name
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
                                                                                                className="stretch-button bg-gray-200"
                                                                                                size="small"
                                                                                                icon={
                                                                                                    showCustomActivityInput
                                                                                                        ? "pi pi-times"
                                                                                                        : "pi pi-plus"
                                                                                                }
                                                                                            />
                                                                                        ) : (
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
                                                                                                className={`stretch-button ${
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
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </>
                                                            )}
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
                                            <div className="flex-grow grid grid-cols-1 justify-start items-center gap-4">
                                                {studentId ? (
                                                    <>
                                                        <div className="mb-4">
                                                            <h4>
                                                                What Support do
                                                                you need?
                                                            </h4>
                                                        </div>
                                                        <Dropdown
                                                            value={
                                                                selectedStrategy
                                                            }
                                                            options={supportStrategies.map(
                                                                (strategy) => ({
                                                                    label: strategy.name,
                                                                    value: strategy,
                                                                })
                                                            )}
                                                            onChange={(e) =>
                                                                setSelectedStrategy(
                                                                    e.value
                                                                )
                                                            }
                                                            placeholder="Select a support strategy"
                                                            className="w-full"
                                                        />
                                                        {selectedStrategy && (
                                                            <div className="mt-4">
                                                                <h5 className="mb-4 font-bold">
                                                                    Questions
                                                                    for{" "}
                                                                    {
                                                                        selectedStrategy.name
                                                                    }
                                                                </h5>
                                                                <div className="max-h-64 overflow-y-auto">
                                                                    {questions
                                                                        .filter(
                                                                            (
                                                                                q
                                                                            ) =>
                                                                                q.support_strategy_id ===
                                                                                selectedStrategy.id
                                                                        )
                                                                        .sort(
                                                                            (
                                                                                a,
                                                                                b
                                                                            ) =>
                                                                                a.order -
                                                                                b.order
                                                                        )
                                                                        .map(
                                                                            (
                                                                                question
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        question.id
                                                                                    }
                                                                                    className="mb-4"
                                                                                >
                                                                                    <label className="block mb-2 font-semibold">
                                                                                        {
                                                                                            question.text
                                                                                        }
                                                                                        {question.type ===
                                                                                            "radio" && (
                                                                                            <span className="text-sm text-gray-600 ml-2">
                                                                                                (Select
                                                                                                one)
                                                                                            </span>
                                                                                        )}
                                                                                    </label>
                                                                                    {question.type ===
                                                                                    "text" ? (
                                                                                        <InputTextarea
                                                                                            value={
                                                                                                answers[
                                                                                                    question
                                                                                                        .id
                                                                                                ]
                                                                                                    ?.value ||
                                                                                                ""
                                                                                            }
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleAnswerChange(
                                                                                                    question.id,
                                                                                                    e
                                                                                                        .target
                                                                                                        .value,
                                                                                                    "text"
                                                                                                )
                                                                                            }
                                                                                            rows={
                                                                                                2
                                                                                            }
                                                                                            className="w-full"
                                                                                            placeholder="Enter your answer"
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="flex flex-col gap-2">
                                                                                            {(
                                                                                                question.radio_options ||
                                                                                                []
                                                                                            ).map(
                                                                                                (
                                                                                                    option,
                                                                                                    index
                                                                                                ) => (
                                                                                                    <div
                                                                                                        key={
                                                                                                            option.id ||
                                                                                                            index
                                                                                                        }
                                                                                                        className="flex items-center gap-2"
                                                                                                    >
                                                                                                        <RadioButton
                                                                                                            inputId={`option-${
                                                                                                                question.id
                                                                                                            }-${
                                                                                                                option.id ||
                                                                                                                index
                                                                                                            }`}
                                                                                                            name={`question-${question.id}`}
                                                                                                            value={
                                                                                                                option.id
                                                                                                            }
                                                                                                            onChange={(
                                                                                                                e
                                                                                                            ) =>
                                                                                                                handleAnswerChange(
                                                                                                                    question.id,
                                                                                                                    e.value,
                                                                                                                    "radio"
                                                                                                                )
                                                                                                            }
                                                                                                            checked={
                                                                                                                answers[
                                                                                                                    question
                                                                                                                        .id
                                                                                                                ]
                                                                                                                    ?.value ===
                                                                                                                option.id
                                                                                                            }
                                                                                                        />
                                                                                                        <label
                                                                                                            htmlFor={`option-${
                                                                                                                question.id
                                                                                                            }-${
                                                                                                                option.id ||
                                                                                                                index
                                                                                                            }`}
                                                                                                        >
                                                                                                            {option.text ||
                                                                                                                option}
                                                                                                        </label>
                                                                                                    </div>
                                                                                                )
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    {questions.filter(
                                                                        (q) =>
                                                                            q.support_strategy_id ===
                                                                            selectedStrategy.id
                                                                    ).length ===
                                                                        0 && (
                                                                        <p className="text-gray-600">
                                                                            No
                                                                            questions
                                                                            available
                                                                            for
                                                                            this
                                                                            strategy.
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p>
                                                        Please select a student
                                                        to proceed.
                                                    </p>
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
                                                            "Are you sure you want to go back? Any unsaved answers will be lost.",
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
                                                            setAnswers({});
                                                            setSelectedStrategy(
                                                                null
                                                            );
                                                        },
                                                        reject: () => {
                                                            dispatch(
                                                                setToastMessage(
                                                                    {
                                                                        severity:
                                                                            "info",
                                                                        summary:
                                                                            "Tell me, what's your problem?",
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
                                            <Button
                                                label="Submit"
                                                icon="pi pi-check"
                                                iconPos="right"
                                                size="small"
                                                onClick={(event) =>
                                                    confirmPopup({
                                                        target: event.currentTarget,
                                                        message:
                                                            "Are you sure you want to submit your answers?",
                                                        icon: "pi pi-exclamation-triangle",
                                                        accept: () =>
                                                            handleSubmitAnswers(),
                                                        reject: () => {
                                                            dispatch(
                                                                setToastMessage(
                                                                    {
                                                                        severity:
                                                                            "warn",
                                                                        summary:
                                                                            "Action Cancelled",
                                                                        detail: "Answers not submitted.",
                                                                    }
                                                                )
                                                            );
                                                        },
                                                    })
                                                }
                                                disabled={
                                                    !selectedStrategy ||
                                                    questions.filter(
                                                        (q) =>
                                                            q.support_strategy_id ===
                                                            selectedStrategy?.id
                                                    ).length === 0 ||
                                                    loading
                                                }
                                            />
                                        </div>
                                    </StepperPanel>
                                )}

                                {/* facilities reservation */}
                                {activeButton === "facilities" && (
                                    <StepperPanel header="Location">
                                        <div className="flex flex-col h-full">
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-5 flex-grow flex flex-wrap items-center max-h-64 overflow-y-auto">
                                                <div className="justify-start w-full">
                                                    This is your facility
                                                    booking log today (Timezone:{" "}
                                                    {userTimezone}):
                                                </div>
                                                <Accordion className="w-full">
                                                    {bookingLog.map(
                                                        (booking) => (
                                                            <AccordionTab
                                                                key={booking.id}
                                                                header={
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="truncate max-w-[100px] sm:max-w-[200px] inline-block">
                                                                            {
                                                                                booking.facilityName
                                                                            }
                                                                        </span>
                                                                        <Badge
                                                                            value={capitalize(
                                                                                booking.status
                                                                            )}
                                                                            severity={
                                                                                booking.status ===
                                                                                "requested"
                                                                                    ? "info"
                                                                                    : booking.status ===
                                                                                      "reserved"
                                                                                    ? "success"
                                                                                    : booking.status ===
                                                                                      "closed"
                                                                                    ? "secondary"
                                                                                    : "danger"
                                                                            }
                                                                        />
                                                                    </div>
                                                                }
                                                            >
                                                                <div className="flex flex-col gap-2">
                                                                    <p>
                                                                        <strong>
                                                                            Facility:
                                                                        </strong>{" "}
                                                                        {
                                                                            booking.facilityName
                                                                        }
                                                                    </p>
                                                                    <p>
                                                                        <strong>
                                                                            Start
                                                                            Time:
                                                                        </strong>{" "}
                                                                        {formatDateToLocal(
                                                                            booking.startTime
                                                                        )}
                                                                    </p>
                                                                    <p>
                                                                        <strong>
                                                                            End
                                                                            Time:
                                                                        </strong>{" "}
                                                                        {formatDateToLocal(
                                                                            booking.endTime
                                                                        )}
                                                                    </p>
                                                                    <p>
                                                                        <strong>
                                                                            Status:
                                                                        </strong>{" "}
                                                                        {capitalize(
                                                                            booking.status
                                                                        )}
                                                                    </p>
                                                                    {(booking.status ===
                                                                        "requested" ||
                                                                        booking.status ===
                                                                            "reserved") && (
                                                                        <Button
                                                                            label="Cancel"
                                                                            icon="pi pi-times"
                                                                            severity="danger"
                                                                            size="small"
                                                                            onClick={(
                                                                                event
                                                                            ) =>
                                                                                confirmPopup(
                                                                                    {
                                                                                        target: event.currentTarget,
                                                                                        message: `Are you sure you want to cancel your reservation for ${booking.facilityName}?`,
                                                                                        icon: "pi pi-exclamation-triangle",
                                                                                        accept: () =>
                                                                                            handleCancelBooking(
                                                                                                booking.id,
                                                                                                booking.facilityName
                                                                                            ),
                                                                                        reject: () => {
                                                                                            dispatch(
                                                                                                setToastMessage(
                                                                                                    {
                                                                                                        severity:
                                                                                                            "warn",
                                                                                                        summary:
                                                                                                            "Action Cancelled",
                                                                                                        detail: "Reservation not cancelled.",
                                                                                                    }
                                                                                                )
                                                                                            );
                                                                                        },
                                                                                    }
                                                                                )
                                                                            }
                                                                        />
                                                                    )}
                                                                </div>
                                                            </AccordionTab>
                                                        )
                                                    )}
                                                </Accordion>
                                            </div>
                                            <div className="flex flex-col gap-2 overflow-y-auto max-h-64 mt-2">
                                                {_.chunk(
                                                    facilities.filter(
                                                        (f) => !f.parent_id
                                                    ),
                                                    window.innerWidth >= 640
                                                        ? 4
                                                        : 2
                                                ).map((row, rowIndex) => (
                                                    <div
                                                        key={rowIndex}
                                                        className="centered-row"
                                                        style={{
                                                            "--num-columns":
                                                                window.innerWidth >=
                                                                640
                                                                    ? 4
                                                                    : 2,
                                                        }}
                                                    >
                                                        {row.map((location) => (
                                                            <Button
                                                                key={
                                                                    location.id
                                                                }
                                                                label={
                                                                    location.name
                                                                }
                                                                onClick={() => {
                                                                    setSelectedLocation(
                                                                        location.id
                                                                    );
                                                                    setSelectedFacility(
                                                                        null
                                                                    );
                                                                    fetchFacilityBookings(
                                                                        location.id
                                                                    );
                                                                }}
                                                                className={`stretch-button ${
                                                                    selectedLocation ===
                                                                    location.id
                                                                        ? "bg-blue-500 text-white"
                                                                        : "bg-gray-200"
                                                                }`}
                                                                size="small"
                                                                icon={
                                                                    selectedLocation ===
                                                                    location.id
                                                                        ? "pi pi-check"
                                                                        : null
                                                                }
                                                            />
                                                        ))}
                                                    </div>
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
                                                disabled={!selectedLocation}
                                            />
                                        </div>
                                    </StepperPanel>
                                )}
                                {activeButton === "facilities" && (
                                    <StepperPanel header="Facility">
                                        <div className="flex flex-col h-full">
                                            <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
                                                {_.chunk(
                                                    facilities.filter(
                                                        (f) =>
                                                            f.parent_id ===
                                                            selectedLocation
                                                    ),
                                                    window.innerWidth >= 640
                                                        ? 4
                                                        : 2
                                                ).map((row, rowIndex) => (
                                                    <div
                                                        key={rowIndex}
                                                        className="centered-row"
                                                        style={{
                                                            "--num-columns":
                                                                window.innerWidth >=
                                                                640
                                                                    ? 4
                                                                    : 2,
                                                        }}
                                                    >
                                                        {row.map((facility) => (
                                                            <Button
                                                                key={
                                                                    facility.id
                                                                }
                                                                label={
                                                                    facility.name
                                                                }
                                                                onClick={() => {
                                                                    setSelectedFacility(
                                                                        facility
                                                                    );
                                                                    fetchFacilityBookings(
                                                                        facility.id
                                                                    );
                                                                }}
                                                                className={`stretch-button ${
                                                                    selectedFacility?.id ===
                                                                    facility.id
                                                                        ? "bg-blue-500 text-white"
                                                                        : "bg-gray-200"
                                                                }`}
                                                                size="small"
                                                                icon={
                                                                    selectedFacility?.id ===
                                                                    facility.id
                                                                        ? "pi pi-check"
                                                                        : null
                                                                }
                                                            />
                                                        ))}
                                                    </div>
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
                                                disabled={!selectedFacility}
                                            />
                                        </div>
                                    </StepperPanel>
                                )}
                                {activeButton === "facilities" && (
                                    <StepperPanel header="Date">
                                        <div className="flex flex-col h-full">
                                            <div className="flex-grow flex justify-center items-center">
                                                <div className="relative w-full">
                                                    <Calendar
                                                        value={bookingDate}
                                                        onChange={(e) => {
                                                            setBookingDate(
                                                                e.value
                                                            );
                                                            setSelectedTimeSlots(
                                                                []
                                                            );
                                                        }}
                                                        dateFormat="yy-mm-dd"
                                                        minDate={
                                                            new Date().getHours() >=
                                                            17
                                                                ? new Date(
                                                                      new Date().setDate(
                                                                          new Date().getDate() +
                                                                              1
                                                                      )
                                                                  )
                                                                : new Date()
                                                        }
                                                        disabledDates={blockedDate.map(
                                                            (bd) =>
                                                                new Date(
                                                                    bd.date
                                                                )
                                                        )}
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                        placeholder="Select date"
                                                        inline
                                                    />
                                                </div>
                                            </div>
                                            {facilityBookings.length > 0 && (
                                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 bg-gray-50 mt-4">
                                                    <p className="font-semibold">
                                                        Existing Reserved
                                                        Bookings (Timezone:{" "}
                                                        {userTimezone}):
                                                    </p>
                                                    <ul className="list-disc pl-5">
                                                        {facilityBookings.map(
                                                            (booking) => (
                                                                <li
                                                                    key={
                                                                        booking.id
                                                                    }
                                                                >
                                                                    {formatDateToLocal(
                                                                        booking.start_time
                                                                    )}{" "}
                                                                    to{" "}
                                                                    {formatDateToLocal(
                                                                        booking.end_time,
                                                                        "time"
                                                                    )}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
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
                                                disabled={!bookingDate}
                                            />
                                        </div>
                                    </StepperPanel>
                                )}
                                {activeButton === "facilities" && (
                                    <StepperPanel header="Time">
                                        <div className="flex flex-col h-full">
                                            <div className="flex-grow grid grid-cols-1 gap-2">
                                                {!isBooked && (
                                                    <div>
                                                        <p className="text-center">
                                                            Select time slots
                                                            for{" "}
                                                            {
                                                                selectedFacility
                                                                    ?.parent
                                                                    .name
                                                            }
                                                            {" - "}
                                                            {
                                                                selectedFacility?.name
                                                            }
                                                            :
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                                            {updateTimeSlots().map(
                                                                (
                                                                    slot,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex items-center gap-2 justify-center"
                                                                    >
                                                                        <Checkbox
                                                                            inputId={`slot-${index}`}
                                                                            checked={selectedTimeSlots.includes(
                                                                                index
                                                                            )}
                                                                            onChange={() =>
                                                                                handleTimeSlotChange(
                                                                                    index
                                                                                )
                                                                            }
                                                                        />
                                                                        <label
                                                                            htmlFor={`slot-${index}`}
                                                                        >
                                                                            {
                                                                                slot.label
                                                                            }
                                                                        </label>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex pt-2 sm:pt-4 justify-between">
                                            <Button
                                                label="Back"
                                                severity="secondary"
                                                icon="pi pi-arrow-left"
                                                size="small"
                                                onClick={() =>
                                                    stepperRef.current.prevCallback()
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
                                                    isBooked
                                                        ? "Cancel Booking"
                                                        : "Reserve"
                                                }
                                                icon={
                                                    isBooked
                                                        ? "pi pi-times"
                                                        : "pi pi-check"
                                                }
                                                iconPos="right"
                                                severity={
                                                    isBooked
                                                        ? "danger"
                                                        : undefined
                                                }
                                                size="small"
                                                onClick={(event) => {
                                                    if (!isBooked) {
                                                        confirmPopup({
                                                            target: event.currentTarget,
                                                            message: `Are you sure you want to reserve ${selectedFacility?.name}?`,
                                                            icon: "pi pi-exclamation-triangle",
                                                            accept: () =>
                                                                handleReserve(),
                                                            reject: () => {
                                                                dispatch(
                                                                    setToastMessage(
                                                                        {
                                                                            severity:
                                                                                "warn",
                                                                            summary:
                                                                                "Action Cancelled",
                                                                            detail: "Reservation not made.",
                                                                        }
                                                                    )
                                                                );
                                                            },
                                                        });
                                                    } else {
                                                        confirmPopup({
                                                            target: event.currentTarget,
                                                            message: `Are you sure you want to cancel your reservation for ${selectedFacility?.name}?`,
                                                            icon: "pi pi-exclamation-triangle",
                                                            accept: () =>
                                                                handleCancelBooking(
                                                                    bookingId,
                                                                    selectedFacility?.name
                                                                ),
                                                            reject: () => {
                                                                dispatch(
                                                                    setToastMessage(
                                                                        {
                                                                            severity:
                                                                                "warn",
                                                                            summary:
                                                                                "Action Cancelled",
                                                                            detail: "Reservation not cancelled.",
                                                                        }
                                                                    )
                                                                );
                                                            },
                                                        });
                                                    }
                                                }}
                                                disabled={
                                                    (!selectedTimeSlots.length &&
                                                        !isBooked) ||
                                                    loading
                                                }
                                            />
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
