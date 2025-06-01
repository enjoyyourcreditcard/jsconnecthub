import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIsAuthenticated } from "react-auth-kit";
import {
    getRecords,
    createRecord,
    updateRecord,
    setStateData,
    setToastMessage,
} from "../../store/global-slice";
import Header from "../../shared/layout/Header";
import DataTable from "../../shared/misc/DataTable";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";

function FacilityReservations() {
    const dispatch = useDispatch();
    const isAuthenticated = useIsAuthenticated();
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState("create");
    const [editId, setEditId] = useState(null);
    const [timeFilter, setTimeFilter] = useState("week");
    const [dateFilter, setDateFilter] = useState(null);
    const [rangeFilter, setRangeFilter] = useState(null);
    const [formData, setFormData] = useState({
        level: null,
        class: null,
        student: null,
        facility: null,
        start_date: null,
        start_time: null,
        end_date: null,
        end_time: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const {
        bookings: { data: bookings = [], endPoints: bookingEndPoints },
        levels: { data: levels = [], endPoints: levelEndPoints },
        class: { data: classes = [], endPoints: classEndPoints },
        students: { data: students = [], endPoints: studentEndPoints },
        facilities: { data: facilities = [], endPoints: facilityEndPoints },
    } = useSelector((state) => state.global);

    const myFetch = (fetchParams = {}) => {
        let currentDateFilter =
            fetchParams?.dateFilter !== undefined
                ? fetchParams.dateFilter
                : dateFilter;
        let currentFilter =
            fetchParams?.timeFilter !== undefined
                ? fetchParams.timeFilter
                : timeFilter;
        let currentRange =
            fetchParams?.rangeFilter !== undefined
                ? fetchParams.rangeFilter
                : rangeFilter;

        let url = bookingEndPoints.collection;

        if (currentFilter) {
            url += `?time=${currentFilter}`;
        }
        if (currentRange && currentRange[0] && currentRange[1]) {
            const start = currentRange[0].toISOString();
            const endDate = new Date(currentRange[1]);
            endDate.setUTCDate(endDate.getUTCDate() + 1);
            const end = endDate.toISOString();
            url += `?range_time[start]=${start}&range_time[end]=${end}`;
        }
        if (currentDateFilter) {
            const start = currentDateFilter.toISOString();
            const endDate = new Date(currentDateFilter);
            endDate.setUTCDate(endDate.getUTCDate() + 1);
            const end = endDate.toISOString();
            url += `?range_time[start]=${start}&range_time[end]=${end}`;
        }

        dispatch(getRecords({ type: "bookings", endPoint: url })).then((d) => {
            if (d) {
                const formattedBooking = d.map((i) => ({
                    id: i.id,
                    student: i.student?.name || "N/A",
                    level: i.student?.class?.level?.name || "N/A",
                    class: i.student?.class?.name || "N/A",
                    facility: i.facility?.name
                        ? `${i.facility?.parent.name} (${i.facility?.name})`
                        : "N/A",
                    status: i.status,
                    start_time: i.start_time,
                    end_time: i.end_time,
                }));
                dispatch(
                    setStateData({
                        type: "bookings",
                        data: formattedBooking,
                        key: "data",
                        isMerge: false,
                    })
                );
            }
        });
    };

    useEffect(() => {
        myFetch();
        dispatch(
            getRecords({
                type: "levels",
                endPoint: levelEndPoints.collection,
                key: "data",
            })
        );
        dispatch(
            getRecords({
                type: "class",
                endPoint: classEndPoints.collection,
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
                type: "facilities",
                endPoint: facilityEndPoints.collection,
                key: "data",
            })
        );
    }, [dispatch]);

    const handleAdd = () => {
        setMode("create");
        setFormData({
            level: null,
            class: null,
            student: null,
            facility: null,
            start_date: null,
            start_time: null,
            end_date: null,
            end_time: null,
        });
        setEditId(null);
        setVisible(true);
    };

    const handleEdit = (id) => {
        const booking = bookings.find((b) => b.id === id);
        if (booking) {
            const studentData = students.find(
                (s) => s.name === booking.student
            );
            const classData = classes.find((c) => c.name === booking.class);
            const levelData = levels.find((l) => l.name === booking.level);
            const facilityData = facilities.find(
                (f) => f.name === booking.facility
            );

            setFormData({
                level: levelData
                    ? { id: levelData.id, label: levelData.name }
                    : null,
                class: classData
                    ? { id: classData.id, label: classData.name }
                    : null,
                student: studentData
                    ? { id: studentData.id, label: studentData.name }
                    : null,
                facility: facilityData
                    ? { id: facilityData.id, label: facilityData.name }
                    : null,
                start_date: booking.start_time
                    ? new Date(booking.start_time)
                    : null,
                start_time: booking.start_time
                    ? new Date(booking.start_time)
                    : null,
                end_date: booking.end_time ? new Date(booking.end_time) : null,
                end_time: booking.end_time ? new Date(booking.end_time) : null,
            });
            setEditId(id);
            setMode("edit");
            setVisible(true);
        }
    };

    const handleConfirm = (id) => {
        setLoading(true);
        setError("");
        dispatch(
            updateRecord({
                type: "bookings",
                endPoint: `${bookingEndPoints.confirm}${id}`,
                data: { status: "reserved" },
                returnData: true,
            })
        )
            .then(() => {
                dispatch(
                    setStateData({
                        key: "alert",
                        data: {
                            type: "success",
                            text: "Booking confirmed successfully.",
                            show: true,
                        },
                    })
                );
                myFetch();
            })
            .catch((err) => {
                dispatch(
                    setStateData({
                        key: "alert",
                        data: {
                            type: "danger",
                            text: err.message || "Failed to confirm booking.",
                            show: true,
                        },
                    })
                );
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleCancel = (id) => {
        setLoading(true);
        setError("");
        dispatch(
            updateRecord({
                type: "bookings",
                endPoint: `${bookingEndPoints.cancel}${id}`,
                data: { status: "cancelled" },
                returnData: true,
            })
        )
            .then(() => {
                dispatch(
                    setStateData({
                        key: "alert",
                        data: {
                            type: "success",
                            text: "Booking cancelled successfully.",
                            show: true,
                        },
                    })
                );
                myFetch();
            })
            .catch((err) => {
                dispatch(
                    setStateData({
                        key: "alert",
                        data: {
                            type: "danger",
                            text: err.message || "Failed to cancel booking.",
                            show: true,
                        },
                    })
                );
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target ? e.target : e;

        setFormData((prev) => {
            const newData = { ...prev, [name]: value };

            if (name === "level") {
                newData.class = null;
                newData.student = null;
            } else if (name === "class") {
                newData.student = null;
            } else if (name === "start_date" || name === "start_time") {
                const newStartDate =
                    name === "start_date" ? value : prev.start_date;
                const newStartTime =
                    name === "start_time" ? value : prev.start_time;
                const currentEndDate = prev.end_date;
                const currentEndTime = prev.end_time;

                if (
                    newStartDate &&
                    newStartTime &&
                    currentEndDate &&
                    currentEndTime
                ) {
                    const newStartDateTime = combineDateAndTime(
                        newStartDate,
                        newStartTime
                    );
                    const currentEndDateTime = combineDateAndTime(
                        currentEndDate,
                        currentEndTime
                    );

                    if (
                        newStartDateTime &&
                        currentEndDateTime &&
                        newStartDateTime >= currentEndDateTime
                    ) {
                        newData.end_date = null;
                        newData.end_time = null;
                        dispatch(
                            setToastMessage({
                                severity: "info",
                                summary: "Waktu Akhir Direset",
                                detail: "Waktu akhir telah direset karena waktu mulai diubah.",
                            })
                        );
                    }
                }
            }

            if (
                name === "end_date" &&
                newData.start_date &&
                value &&
                new Date(value) < new Date(newData.start_date)
            ) {
                newData.end_date = null;
                dispatch(
                    setToastMessage({
                        severity: "warn",
                        summary: "Tanggal Akhir Tidak Valid",
                        detail: "Tanggal akhir tidak boleh sebelum tanggal mulai.",
                    })
                );
            }

            if (
                name === "end_time" &&
                newData.start_date &&
                newData.start_time &&
                newData.end_date &&
                value
            ) {
                const startDateTime = combineDateAndTime(
                    newData.start_date,
                    newData.start_time
                );
                const endDateTime = combineDateAndTime(newData.end_date, value);
                if (
                    startDateTime &&
                    endDateTime &&
                    endDateTime <= startDateTime
                ) {
                    newData.end_time = null;
                    dispatch(
                        setToastMessage({
                            severity: "warn",
                            summary: "Waktu Akhir Tidak Valid",
                            detail: "Waktu akhir harus setelah waktu mulai.",
                        })
                    );
                }
            }

            return newData;
        });
    };

    const formatDateTimeForMySQL = (date) => {
        if (!date) return null;
        const pad = (n) => String(n).padStart(2, "0");
        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1);
        const day = pad(date.getUTCDate());
        const hours = pad(date.getUTCHours());
        const minutes = pad(date.getUTCMinutes());
        return `${year}-${month}-${day} ${hours}:${minutes}:00`;
    };

    const combineDateAndTime = (date, time) => {
        if (!date || !time) return null;

        const combinedDate = new Date(date);
        const timeDate = new Date(time);

        combinedDate.setHours(
            timeDate.getHours(),
            timeDate.getMinutes(),
            timeDate.getSeconds()
        );

        return combinedDate;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (
            !formData.student?.id ||
            !formData.facility?.id ||
            !formData.start_date ||
            !formData.start_time ||
            !formData.end_date ||
            !formData.end_time
        ) {
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Data Tidak Lengkap",
                    detail: "Semua field harus diisi.",
                })
            );
            setLoading(false);
            return;
        }

        const now = new Date();
        const startDateTime = combineDateAndTime(
            formData.start_date,
            formData.start_time
        );
        const endDateTime = combineDateAndTime(
            formData.end_date,
            formData.end_time
        );

        if (!startDateTime || !endDateTime) {
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Format Tanggal/Waktu Tidak Valid",
                    detail: "Pastikan tanggal dan waktu mulai serta selesai valid.",
                })
            );
            setLoading(false);
            return;
        }

        if (startDateTime <= now) {
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Waktu Tidak Valid",
                    detail: "Waktu mulai harus di masa depan.",
                })
            );
            setLoading(false);
            return;
        }

        if (endDateTime <= startDateTime) {
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Waktu Tidak Valid",
                    detail: "Waktu selesai harus setelah waktu mulai.",
                })
            );
            setLoading(false);
            return;
        }

        const dataToSubmit = {
            student_id: formData.student?.id,
            facility_id: formData.facility?.id,
            start_time: formatDateTimeForMySQL(startDateTime),
            end_time: formatDateTimeForMySQL(endDateTime),
        };

        try {
            const result = dispatch(
                mode === "create"
                    ? createRecord({
                          type: "bookings",
                          endPoint: bookingEndPoints.store,
                          data: dataToSubmit,
                          returnData: true,
                      })
                    : updateRecord({
                          type: "bookings",
                          endPoint: `${bookingEndPoints.update}${editId}`,
                          data: dataToSubmit,
                          returnData: true,
                      })
            );

            if (result) {
                setVisible(false);
                myFetch();
            }
        } catch (err) {
            setError(err.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const levelOptions = levels.map((i) => ({ id: i.id, label: i.name }));
    const classOptions = formData.level
        ? classes
              .filter((c) => c.level_id === formData.level.id)
              .map((i) => ({ id: i.id, label: i.name }))
        : [];
    const studentOptions = formData.class
        ? students
              .filter((s) => s.class_id === formData.class.id)
              .map((i) => ({ id: i.id, label: i.name }))
        : [];
    const facilityOptions = facilities
        .filter((i) => i.parent_id)
        .map((i) => ({
            id: i.id,
            label: `${i.parent.name} (${i.name})`,
        }));

    return (
        <div>
            <Header />
            <main style={{ padding: "20px" }}>
                <Card>
                    {isAuthenticated() ? (
                        <>
                            <DataTable
                                type="bookings"
                                identifier="id"
                                onFetch={(params) => myFetch(params)}
                                onAdd={handleAdd}
                                onEdit={handleEdit}
                                onConfirm={handleConfirm}
                                onCancel={handleCancel}
                                title="Facility Reservations"
                                timeFilter={timeFilter}
                                setTimeFilter={setTimeFilter}
                                dateFilter={dateFilter}
                                setDateFilter={setDateFilter}
                                rangeFilter={rangeFilter}
                                setRangeFilter={setRangeFilter}
                            />
                            <Dialog
                                header={
                                    mode === "create"
                                        ? "Add Facility Reservation"
                                        : "Edit Facility Reservation"
                                }
                                visible={visible}
                                style={{ width: "600px" }}
                                onHide={() => setVisible(false)}
                            >
                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-8 reservation-form"
                                >
                                    {error && (
                                        <p
                                            style={{
                                                color: "red",
                                                marginBottom: "2rem",
                                                backgroundColor: "#fee2e2",
                                                padding: "0.75rem",
                                                borderRadius: "8px",
                                            }}
                                        >
                                            {error}
                                        </p>
                                    )}
                                    <div style={{ marginBottom: "2rem" }}>
                                        <FloatLabel>
                                            <Dropdown
                                                name="level"
                                                value={formData.level}
                                                options={levelOptions}
                                                onChange={handleChange}
                                                filter
                                                optionLabel="label"
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                placeholder="Select a level"
                                            />
                                            <label htmlFor="level">Level</label>
                                        </FloatLabel>
                                    </div>
                                    <div style={{ marginBottom: "2rem" }}>
                                        <FloatLabel>
                                            <Dropdown
                                                name="class"
                                                value={formData.class}
                                                options={classOptions}
                                                onChange={handleChange}
                                                filter
                                                optionLabel="label"
                                                style={{ width: "100%" }}
                                                required
                                                disabled={
                                                    !formData.level || loading
                                                }
                                                placeholder="Select a class"
                                            />
                                            <label htmlFor="class">Class</label>
                                        </FloatLabel>
                                    </div>
                                    <div style={{ marginBottom: "2rem" }}>
                                        <FloatLabel>
                                            <Dropdown
                                                name="student"
                                                value={formData.student}
                                                options={studentOptions}
                                                onChange={handleChange}
                                                filter
                                                optionLabel="label"
                                                style={{ width: "100%" }}
                                                required
                                                disabled={
                                                    !formData.class || loading
                                                }
                                                placeholder="Select a student"
                                            />
                                            <label htmlFor="student">
                                                Student
                                            </label>
                                        </FloatLabel>
                                    </div>
                                    <div style={{ marginBottom: "2rem" }}>
                                        <FloatLabel>
                                            <Dropdown
                                                name="facility"
                                                value={formData.facility}
                                                options={facilityOptions}
                                                onChange={handleChange}
                                                filter
                                                optionLabel="label"
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                placeholder="Select a facility"
                                            />
                                            <label htmlFor="facility">
                                                Facility
                                            </label>
                                        </FloatLabel>
                                    </div>
                                    <div
                                        className="w-full flex justify-between"
                                        style={{ marginBottom: "2rem" }}
                                    >
                                        <FloatLabel>
                                            <Calendar
                                                name="start_date"
                                                value={formData.start_date}
                                                onChange={handleChange}
                                                dateFormat="yy-mm-dd"
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                minDate={new Date()}
                                                touchUI
                                                showButtonBar
                                                readOnlyInput
                                                appendTo={document.body}
                                                panelClassName="date-time-panel"
                                                inputClassName="date-time-input"
                                                monthNavigator
                                                yearNavigator
                                                yearRange={`${new Date().getFullYear()}:${
                                                    new Date().getFullYear() + 5
                                                }`}
                                            />
                                            <label htmlFor="start_date">
                                                Start Date
                                            </label>
                                        </FloatLabel>
                                        <FloatLabel>
                                            <Calendar
                                                name="start_time"
                                                value={formData.start_time}
                                                onChange={handleChange}
                                                timeOnly
                                                hourFormat="12"
                                                style={{ width: "100%" }}
                                                required
                                                disabled={
                                                    loading ||
                                                    !formData.start_date
                                                }
                                                touchUI
                                                showButtonBar
                                                readOnlyInput
                                                appendTo={document.body}
                                                panelClassName="date-time-panel"
                                                inputClassName="date-time-input"
                                                stepMinute={30}
                                            />
                                            <label htmlFor="start_time">
                                                Start Time
                                            </label>
                                        </FloatLabel>
                                    </div>
                                    <div
                                        className="w-full flex justify-between"
                                        style={{ marginBottom: "2rem" }}
                                    >
                                        <FloatLabel>
                                            <Calendar
                                                name="end_date"
                                                value={formData.end_date}
                                                onChange={handleChange}
                                                dateFormat="yy-mm-dd"
                                                style={{ width: "100%" }}
                                                required
                                                disabled={
                                                    loading ||
                                                    !formData.start_date
                                                }
                                                minDate={
                                                    formData.start_date ||
                                                    new Date()
                                                }
                                                touchUI
                                                showButtonBar
                                                readOnlyInput
                                                appendTo={document.body}
                                                panelClassName="date-time-panel"
                                                inputClassName="date-time-input"
                                                monthNavigator
                                                yearNavigator
                                                yearRange={`${new Date().getFullYear()}:${
                                                    new Date().getFullYear() + 5
                                                }`}
                                            />
                                            <label htmlFor="end_date">
                                                End Date
                                            </label>
                                        </FloatLabel>
                                        <FloatLabel>
                                            <Calendar
                                                name="end_time"
                                                value={formData.end_time}
                                                onChange={handleChange}
                                                timeOnly
                                                hourFormat="12"
                                                style={{ width: "100%" }}
                                                required
                                                disabled={
                                                    loading ||
                                                    !formData.end_date
                                                }
                                                touchUI
                                                showButtonBar
                                                readOnlyInput
                                                appendTo={document.body}
                                                panelClassName="date-time-panel"
                                                inputClassName="date-time-input"
                                                stepMinute={30}
                                            />
                                            <label htmlFor="end_time">
                                                End Time
                                            </label>
                                        </FloatLabel>
                                    </div>
                                    <div
                                        className="reservation-form-buttons"
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <Button
                                            label="Cancel"
                                            icon="pi pi-times"
                                            type="button"
                                            onClick={() => setVisible(false)}
                                            className="p-button-text"
                                            disabled={loading}
                                        />
                                        <Button
                                            label={
                                                mode === "create"
                                                    ? "Create"
                                                    : "Update"
                                            }
                                            icon="pi pi-check"
                                            type="submit"
                                            disabled={loading}
                                            className="p-button-outlined"
                                        />
                                    </div>
                                </form>
                            </Dialog>
                        </>
                    ) : (
                        <p>
                            Please log in to view and manage facility
                            reservations.
                        </p>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default FacilityReservations;
