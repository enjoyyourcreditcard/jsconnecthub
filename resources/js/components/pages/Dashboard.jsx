import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthUser } from "react-auth-kit";
import {
    getRecords,
    setStateData,
    createRecord,
    deleteRecord,
} from "../store/global-slice";
import Header from "../shared/layout/Header";
import { Tree } from "primereact/tree";
import { Badge } from "primereact/badge";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { DateTime } from "luxon";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";

function Dashboard() {
    const dispatch = useDispatch();
    const {
        class: { data: classes = [], endPoints: classEndPoints },
        levels: { data: levels = [], endPoints: levelEndPoints },
        students: { data: students = [], endPoints: studentEndPoints },
        bookings: { data: bookings = [], endPoints: bookingEndPoints },
        facilities: { data: facilities = [], endPoints: facilityEndPoints },
        blocked_dates: {
            data: blockedDate = [],
            endPoints: blockedDateEndPoints,
        },
    } = useSelector((state) => state.global);
    const auth = useAuthUser();
    const [nodes, setNodes] = useState([]);
    const [date, setDate] = useState(new Date());
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [showBlockDialog, setShowBlockDialog] = useState(false);
    const [blockReason, setBlockReason] = useState("");
    const toast = React.useRef(null);

    useEffect(() => {
        const userPermissions = auth()?.permissions || [];
        setPermissions(userPermissions);
        if (userPermissions.includes("dashboard view")) {
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
        }
        if (
            userPermissions.includes("dashboard view") ||
            userPermissions.includes("dashboard-bookings view")
        ) {
            dispatch(
                getRecords({
                    type: "facilities",
                    endPoint: facilityEndPoints.collection,
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

            if (date) {
                setLoading(true);

                const start = DateTime.fromJSDate(date)
                    .startOf("day")
                    .toUTC()
                    .toISO();
                const end = DateTime.fromJSDate(date)
                    .endOf("day")
                    .toUTC()
                    .toISO();

                dispatch(
                    getRecords({
                        type: "bookings",
                        endPoint: `${bookingEndPoints.collection}?range_time[start]=${start}&range_time[end]=${end}`,
                        key: "data",
                    })
                )
                    .then((result) => {
                        if (Array.isArray(result) && result.length === 0) {
                            dispatch(
                                setStateData({
                                    type: "bookings",
                                    data: [],
                                    key: "data",
                                })
                            );
                        }
                    })
                    .catch((err) => {
                        console.error("Error fetching bookings:", err);
                        dispatch(
                            setStateData({
                                type: "bookings",
                                data: [],
                                key: "data",
                            })
                        );
                    })
                    .finally(() => setLoading(false));
            }
        }
    }, [dispatch, date]);

    useEffect(() => {
        const treeNodes = levels.map((level) => ({
            key: `level-${level.id}`,
            label: level.name,
            data: { name: level.name },
            children: classes
                .filter((cls) => cls.level_id === level.id)
                .map((cls) => ({
                    key: `cls-${cls.id}`,
                    label: cls.name,
                    data: { name: cls.name },
                    children: students
                        .filter((student) => student.class_id === cls.id)
                        .map((student) => ({
                            key: `student-${student.id}`,
                            label: student.name,
                            data: { name: student.name },
                            leaf: true,
                        })),
                })),
        }));
        setNodes(treeNodes);
    }, [levels, classes, students]);

    const nodeTemplate = (node) => {
        return <span>{node.label}</span>;
    };

    const facilityOptions = [
        { label: "All Facilities", value: 0 },
        ...facilities
            .filter((i) => i.parent_id)
            .map((facility) => ({
                label: `${facility.parent.name} (${facility.name})`,
                value: facility.id,
            })),
    ];

    const formatDateForMySQL = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return null;
        }
        const pad = (n) => String(n).padStart(2, "0");
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        return `${year}-${month}-${day}`;
    };

    const handleBlockDate = () => {
        if (!blockReason.trim()) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Please provide a reason for blocking the date.",
            });
            return;
        }

        const blockData = {
            date: formatDateForMySQL(date),
            reason: blockReason,
        };

        setLoading(true);
        dispatch(
            createRecord({
                type: "blocked_dates",
                endPoint: blockedDateEndPoints.store,
                data: blockData,
            })
        )
            .then(() => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: `Date ${formatDateForMySQL(
                        date
                    )} has been blocked.`,
                });
                setShowBlockDialog(false);
                setBlockReason("");
                dispatch(
                    getRecords({
                        type: "blocked_dates",
                        endPoint: blockedDateEndPoints.collection,
                        key: "data",
                    })
                );
            })
            .catch((err) => {
                console.error("Error blocking date:", err);
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: err.message || "Failed to block date.",
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const getBookingStyle = (duration) => {
        const minHeight = 40;
        const height = Math.max(minHeight, (duration / 30) * minHeight);
        return {
            backgroundColor: "#e3f2fd",
            borderLeft: "4px solid #1976d2",
            padding: "8px",
            margin: "2px 0",
            borderRadius: "4px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            fontSize: "14px",
            overflow: "hidden",
            position: "relative",
        };
    };

    const populateBookings = () => {
        const bookingsList = [];
        if (Array.isArray(bookings) && bookings.length > 0) {
            bookings
                .filter((booking) =>
                    selectedFacility
                        ? booking.facility_id === selectedFacility
                        : true
                )
                .forEach((booking) => {
                    const start = DateTime.fromISO(booking.start_time);
                    const endTime = DateTime.fromISO(booking.end_time);
                    bookingsList.push({
                        ...booking,
                        duration: endTime.diff(start, "minutes").minutes,
                        startTime: start.toFormat("HH:mm"),
                        endTime: endTime.toFormat("HH:mm"),
                    });
                });
        }
        return bookingsList;
    };

    const bookingsList = populateBookings();

    const dateTemplate = (date) => {
        const dateStr = `${date.year}-${String(date.month + 1).padStart(
            2,
            "0"
        )}-${String(date.day).padStart(2, "0")}`;

        if (blockedDate.length > 0) {
            const blocked = blockedDate?.find((bd) => bd.date === dateStr);
            if (blocked) {
                return (
                    <div className="relative flex flex-col items-center">
                        <Badge
                            value="!"
                            severity="danger"
                            className="absolute text-xs p-1"
                        />
                        <span className="text-gray-400">{date.day}</span>
                    </div>
                );
            }
        }

        return date.day;
    };

    const isDateBlocked =
        formatDateForMySQL(date) &&
        blockedDate.length > 0 &&
        blockedDate.find((bd) => bd.date === formatDateForMySQL(date));

    const handleUnblockDate = () => {
        const blockedEntry = blockedDate.find(
            (bd) => bd.date === formatDateForMySQL(date)
        );
        if (!blockedEntry) return;

        setLoading(true);
        dispatch(
            deleteRecord({
                type: "blocked_dates",
                endPoint: `${blockedDateEndPoints.delete}${blockedEntry.id}`,
            })
        )
            .then(() => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: `Date ${formatDateForMySQL(
                        date
                    )} has been unblocked.`,
                });
                dispatch(
                    getRecords({
                        type: "blocked_dates",
                        endPoint: blockedDateEndPoints.collection,
                        key: "data",
                    })
                );
            })
            .catch((err) => {
                console.error("Error unblocking date:", err);
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: err.message || "Failed to unblock date.",
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div>
            <Header />
            <main
                className="admin-container with-color"
                style={{ padding: "20px" }}
            >
                <Toast ref={toast} />
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {permissions.includes("dashboard view") && (
                        <Card title="Student Overview">
                            <Tree
                                value={nodes}
                                filter
                                filterBy="label"
                                filterMode="lenient"
                                filterPlaceholder="Search"
                                nodeTemplate={nodeTemplate}
                                style={{ padding: "0", maxHeight: "480px" }}
                            />
                        </Card>
                    )}
                    {(permissions.includes("dashboard view") ||
                        permissions.includes("dashboard-bookings view")) && (
                        <Card title="Reservation for Admin">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="md:w-1/2">
                                    <div className="flex flex-row gap-2 mb-4">
                                        <Dropdown
                                            value={selectedFacility}
                                            options={facilityOptions}
                                            onChange={(e) =>
                                                setSelectedFacility(e.value)
                                            }
                                            placeholder="Select Facility"
                                            style={{ width: "100%" }}
                                            showClear
                                        />
                                        <Button
                                            label={
                                                isDateBlocked
                                                    ? "Unblock Date"
                                                    : "Block Date"
                                            }
                                            icon={
                                                isDateBlocked
                                                    ? "pi pi-unlock"
                                                    : "pi pi-ban"
                                            }
                                            severity={
                                                isDateBlocked
                                                    ? "success"
                                                    : "warning"
                                            }
                                            onClick={() =>
                                                isDateBlocked
                                                    ? handleUnblockDate()
                                                    : setShowBlockDialog(true)
                                            }
                                            disabled={loading}
                                            className="min-w-fit"
                                        />
                                    </div>
                                    <Calendar
                                        value={date}
                                        onChange={(e) => setDate(e.value)}
                                        // disabledDates={blockedDate.map(
                                        //     (bd) => new Date(bd.date)
                                        // )}
                                        dateTemplate={dateTemplate}
                                        inline
                                        style={{ width: "100%" }}
                                    />
                                </div>
                                <div className="md:w-1/2">
                                    {loading ? (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                height: "480px",
                                            }}
                                        >
                                            <span>Loading...</span>
                                        </div>
                                    ) : isDateBlocked ? (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                height: "480px",
                                                color: "#666",
                                            }}
                                        >
                                            <span>
                                                This date is blocked because:{" "}
                                                {isDateBlocked.reason}
                                            </span>
                                        </div>
                                    ) : bookingsList.length === 0 ? (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                height: "480px",
                                                color: "#666",
                                            }}
                                        >
                                            <span>
                                                No bookings for this date and
                                                this facility.
                                            </span>
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                padding: "10px",
                                                maxHeight: "480px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            {bookingsList.map(
                                                (booking, index) => (
                                                    <div
                                                        key={index}
                                                        style={getBookingStyle(
                                                            booking.duration
                                                        )}
                                                    >
                                                        <strong>
                                                            {booking.facility
                                                                ?.name ||
                                                                "Unknown Facility"}
                                                        </strong>
                                                        <br />
                                                        {booking.student
                                                            ?.name ||
                                                            "Unknown Student"}{" "}
                                                        ({booking.startTime} -{" "}
                                                        {booking.endTime})
                                                        <br />
                                                        Status:{" "}
                                                        {booking.status.toUpperCase() ||
                                                            "N/A"}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
                <Dialog
                    header="Block Date"
                    visible={showBlockDialog}
                    onHide={() => {
                        setShowBlockDialog(false);
                        setBlockReason("");
                    }}
                    style={{ width: "30vw" }}
                    breakpoints={{ "960px": "75vw", "640px": "90vw" }}
                >
                    <div className="flex flex-col gap-4">
                        <div>
                            <label
                                htmlFor="blockReason"
                                className="block mb-2 font-semibold"
                            >
                                Reason for Blocking
                            </label>
                            <InputText
                                id="blockReason"
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                placeholder="Enter reason"
                                className="w-full"
                                maxLength={100}
                            />
                        </div>
                        <Button
                            label="Submit"
                            icon="pi pi-check"
                            onClick={handleBlockDate}
                            disabled={!blockReason.trim() || loading}
                        />
                    </div>
                </Dialog>
            </main>
        </div>
    );
}

export default Dashboard;
