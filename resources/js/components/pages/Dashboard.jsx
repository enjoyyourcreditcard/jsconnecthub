import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthUser } from "react-auth-kit";
import { getRecords, setStateData } from "../store/global-slice";
import Header from "../shared/layout/Header";
import { Tree } from "primereact/tree";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { DateTime } from "luxon";
import { ScrollPanel } from "primereact/scrollpanel";

function Dashboard() {
    const dispatch = useDispatch();
    const {
        class: { data: classes = [], endPoints: classEndPoints },
        levels: { data: levels = [], endPoints: levelEndPoints },
        students: { data: students = [], endPoints: studentEndPoints },
        bookings: { data: bookings = [], endPoints: bookingEndPoints },
        facilities: {
            data: facilities = [],
            endPoints: facilityEndPoints,
        } = {},
    } = useSelector((state) => state.global);
    const auth = useAuthUser();
    const [nodes, setNodes] = useState([]);
    const [date, setDate] = useState(new Date());
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);

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
        if (userPermissions.includes("dashboard view")) {
            dispatch(
                getRecords({
                    type: "facilities",
                    endPoint: facilityEndPoints.collection,
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

    const getTimeSlots = () => {
        const slots = [];
        for (let hour = 0; hour < 24; hour++) {
            slots.push({
                time: DateTime.fromObject({ hour, minute: 0 }).toFormat(
                    "HH:mm"
                ),
                bookings: [],
            });
            slots.push({
                time: DateTime.fromObject({ hour, minute: 30 }).toFormat(
                    "HH:mm"
                ),
                bookings: [],
            });
        }
        return slots;
    };

    const populateBookings = () => {
        const slots = getTimeSlots();
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
                    const startHour = start.hour;
                    const startMinute = start.minute;
                    const slotIndex =
                        startMinute < 30 ? startHour * 2 : startHour * 2 + 1;

                    if (slotIndex < slots.length) {
                        slots[slotIndex].bookings.push({
                            ...booking,
                            duration: endTime.diff(start, "minutes").minutes,
                            startTime: start.toFormat("HH:mm"),
                            endTime: endTime.toFormat("HH:mm"),
                        });
                    }
                });
        }
        return slots;
    };

    const timeSlots = populateBookings();

    const getBookingStyle = (duration) => {
        const minHeight = 40;
        const height = Math.max(minHeight, (duration / 30) * minHeight);
        return {
            // height: `${height}px`,
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

    return (
        <div>
            <Header />
            <main style={{ padding: "20px" }}>
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
                    {permissions.includes("dashboard view") && (
                        <Card title="Reservation Overview">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="md:w-1/2">
                                    <div className="mb-4">
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
                                    </div>
                                    <Calendar
                                        value={date}
                                        onChange={(e) => setDate(e.value)}
                                        inline
                                        style={{ width: "100%" }}
                                    />
                                </div>
                                <div className="md:w-1/2">
                                    <ScrollPanel
                                        style={{
                                            height: "480px",
                                            width: "100%",
                                            background: "#f5f5f5",
                                        }}
                                    >
                                        {loading ? (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    height: "100%",
                                                }}
                                            >
                                                <span>Loading...</span>
                                            </div>
                                        ) : timeSlots.every(
                                              (slot) =>
                                                  slot.bookings.length === 0
                                          ) ? (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    height: "100%",
                                                    color: "#666",
                                                }}
                                            >
                                                <span>
                                                    No bookings for this date
                                                    and this facility.
                                                </span>
                                            </div>
                                        ) : (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    padding: "10px",
                                                }}
                                            >
                                                {timeSlots.map(
                                                    (slot, index) => (
                                                        <div
                                                            key={index}
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "flex-start",
                                                                minHeight:
                                                                    "40px",
                                                                borderBottom:
                                                                    "1px solid #e0e0e0",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width: "60px",
                                                                    fontSize:
                                                                        "12px",
                                                                    color: "black",
                                                                    paddingTop:
                                                                        "8px",
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                {slot.time}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    flex: 1,
                                                                    paddingLeft:
                                                                        "10px",
                                                                }}
                                                            >
                                                                {slot.bookings.map(
                                                                    (
                                                                        booking,
                                                                        bIndex
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                bIndex
                                                                            }
                                                                            style={getBookingStyle(
                                                                                booking.duration
                                                                            )}
                                                                        >
                                                                            <strong>
                                                                                {booking
                                                                                    .facility
                                                                                    ?.name ||
                                                                                    "Unknown Facility"}
                                                                            </strong>
                                                                            <br />
                                                                            {booking
                                                                                .student
                                                                                ?.name ||
                                                                                "Unknown Student"}{" "}
                                                                            (
                                                                            {
                                                                                booking.startTime
                                                                            }{" "}
                                                                            -{" "}
                                                                            {
                                                                                booking.endTime
                                                                            }
                                                                            )
                                                                            <br />
                                                                            Status:{" "}
                                                                            {booking.status.toUpperCase() ||
                                                                                "N/A"}
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </ScrollPanel>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
