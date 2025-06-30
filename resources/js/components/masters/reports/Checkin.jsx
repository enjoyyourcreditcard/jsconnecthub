import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getRecords,
    createRecord,
    updateRecord,
    setStateData,
} from "../../store/global-slice";
import Header from "../../shared/layout/Header";
import DataTable from "../../shared/misc/DataTable";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";

function Checkin() {
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState("create");
    const [editId, setEditId] = useState(null);
    const [rawCheckin, setRawCheckin] = useState([]);
    const [formData, setFormData] = useState({
        level: null,
        class: null,
        student: null,
        activity: null,
        checkin_time: null,
        checkout_time: null,
        hasReason: false,
        reason: "",
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [loadingLevels, setLoadingLevels] = useState(true);
    const [loadingClass, setLoadingClass] = useState(true);
    const [loadingStudent, setLoadingStudent] = useState(true);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [error, setError] = useState("");
    const [timeFilter, setTimeFilter] = useState("today");
    const [dateFilter, setDateFilter] = useState(null);
    const [rangeFilter, setRangeFilter] = useState(null);
    const {
        checkin: { data: checkin = [], endPoints: checkinEndPoints },
        levels: { data: levels = [], endPoints: levelEndPoints },
        class: { data: classes = [], endPoints: classEndPoints },
        students: { data: students = [], endPoints: studentEndPoints },
        activities: { data: activities = [], endPoints: activityEndPoints },
    } = useSelector((state) => state.global);

    const myFetch = (params = {}) => {
        let currentDateFilter =
            params?.dateFilter !== undefined ? params.dateFilter : dateFilter;
        let currentFilter =
            params?.timeFilter !== undefined ? params.timeFilter : timeFilter;
        let currentRange =
            params?.rangeFilter !== undefined
                ? params.rangeFilter
                : rangeFilter;

        let url = checkinEndPoints.collection;
        if (currentFilter) {
            url += `?time=${currentFilter}`;
        }
        if (currentRange) {
            if (currentRange[0] && currentRange[1]) {
                const start = currentRange[0].toISOString();
                const endDate = new Date(currentRange[1]);
                endDate.setUTCDate(endDate.getUTCDate() + 1);
                const end = endDate.toISOString();
                url += `?range_time[start]=${start}&range_time[end]=${end}`;
            } else if (rangeFilter[0]) {
                const start = currentRange[0].toISOString();
                const endDate = new Date(currentRange[0]);
                endDate.setUTCDate(endDate.getUTCDate() + 1);
                const end = endDate.toISOString();
                url += `?range_time[start]=${start}&range_time[end]=${end}`;
            }
        }
        if (currentDateFilter) {
            const start = currentDateFilter.toISOString();
            const endDate = new Date(currentDateFilter);
            endDate.setUTCDate(endDate.getUTCDate() + 1);
            const end = endDate.toISOString();
            url += `?range_time[start]=${start}&range_time[end]=${end}`;
        }

        dispatch(getRecords({ type: "checkin", endPoint: url }))
            .then((d) => {
                setRawCheckin(d);
                if (d) {
                    const formattedCheckin = d.map((i) => ({
                        id: i.id,
                        student: i.student?.name || "N/A",
                        level: i.student?.class?.level?.name || "N/A",
                        class: i.student?.class?.name || "N/A",
                        activity: i.activity?.name || i.other_activity || "N/A",
                        checkin_time: i.checkin_time,
                        checkout_time: i.checkout_time,
                        reason: i.reason,
                    }));
                    dispatch(
                        setStateData({
                            type: "checkin",
                            data: formattedCheckin,
                            key: "data",
                            isMerge: false,
                        })
                    );
                }
            })
            .finally(() => setLoadingData(false));
    };

    useEffect(() => {
        myFetch();
        dispatch(
            getRecords({
                type: "levels",
                endPoint: levelEndPoints.collection,
                key: "data",
            })
        ).finally(() => setLoadingLevels(false));
        dispatch(
            getRecords({
                type: "class",
                endPoint: classEndPoints.collection,
                key: "data",
            })
        ).finally(() => setLoadingClass(false));
        dispatch(
            getRecords({
                type: "students",
                endPoint: studentEndPoints.collection,
                key: "data",
            })
        ).finally(() => setLoadingStudent(false));
        dispatch(
            getRecords({
                type: "activities",
                endPoint: activityEndPoints.collection,
                key: "data",
            })
        ).finally(() => setLoadingActivities(false));
    }, [dispatch]);

    const handleEdit = (id) => {
        const iCheckin = rawCheckin.find((u) => u.id === id);
        if (iCheckin) {
            const studentData = students.find(
                (s) => s.id === iCheckin.student.id
            );
            const classData = classes.find(
                (c) => c.id === iCheckin.student.class.id
            );
            const levelData = levels.find(
                (l) => l.id === iCheckin.student.class.level.id
            );
            const activityData = activities.find(
                (a) => a.id === iCheckin.activity_id
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
                activity: activityData
                    ? { id: activityData.id, label: activityData.name }
                    : iCheckin.activity !== "N/A"
                    ? iCheckin.activity
                    : null,
                checkin_time: iCheckin.checkin_time
                    ? new Date(iCheckin.checkin_time)
                    : null,
                checkout_time: iCheckin.checkout_time
                    ? new Date(iCheckin.checkout_time)
                    : null,
                hasReason: !!iCheckin.reason,
                reason: iCheckin.reason || "",
            });
            setEditId(id);
            setMode("edit");
            setVisible(true);
        }
    };

    const handleAdd = () => {
        setMode("create");
        setFormData({
            level: null,
            class: null,
            student: null,
            activity: null,
            checkin_time: null,
            checkout_time: null,
            hasReason: false,
            reason: "",
        });
        setVisible(true);
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
        const seconds = pad(date.getUTCSeconds());
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const isCustomActivity =
            typeof formData.activity === "string" || !formData.activity?.id;
        const dataToSubmit = {
            student_id: formData.student?.id,
            activity_id: isCustomActivity ? null : formData.activity?.id,
            other_activity:
                isCustomActivity && formData.activity
                    ? formData.activity
                    : null,
            checkin_time: formatDateTimeForMySQL(formData.checkin_time),
            checkout_time: formatDateTimeForMySQL(formData.checkout_time),
            reason: formData.hasReason ? formData.reason : null,
        };

        try {
            if (mode === "create") {
                dispatch(
                    createRecord({
                        type: "checkin",
                        endPoint: checkinEndPoints.store,
                        data: dataToSubmit,
                        returnData: true,
                    })
                ).then((success) => {
                    if (success) {
                        setVisible(false);
                        myFetch();
                    }
                });
            } else {
                dispatch(
                    updateRecord({
                        type: "checkin",
                        endPoint: `${checkinEndPoints.update}${editId}`,
                        data: dataToSubmit,
                        returnData: true,
                    })
                ).then((success) => {
                    if (success) {
                        setVisible(false);
                        myFetch();
                    }
                });
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
    const activityOptions = activities.map((i) => ({
        id: i.id,
        label: i.name,
    }));

    const isDataReady =
        !loadingData &&
        !loadingLevels &&
        !loadingClass &&
        !loadingStudent &&
        !loadingActivities;

    return (
        <div>
            <Header />
            <main
                className="admin-container with-color"
                style={{ padding: "20px" }}
            >
                <Card>
                    {isDataReady ? (
                        <>
                            <DataTable
                                type="checkin"
                                identifier="id"
                                onFetch={(params) => myFetch(params)}
                                onAdd={handleAdd}
                                onEdit={handleEdit}
                                title="Check In"
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
                                        ? "Add Check In"
                                        : "Edit Check In"
                                }
                                visible={visible}
                                style={{ width: "400px" }}
                                onHide={() => setVisible(false)}
                            >
                                <form onSubmit={handleSubmit} className="mt-8">
                                    {error && (
                                        <p
                                            style={{
                                                color: "red",
                                                marginBottom: "2rem",
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
                                                name="activity"
                                                value={formData.activity}
                                                options={activityOptions}
                                                onChange={handleChange}
                                                filter
                                                editable
                                                optionLabel="label"
                                                style={{ width: "100%" }}
                                                disabled={loading}
                                                placeholder="Select or type an activity"
                                            />
                                            <label htmlFor="activity">
                                                Activity
                                            </label>
                                        </FloatLabel>
                                    </div>
                                    <div style={{ marginBottom: "2rem" }}>
                                        <FloatLabel>
                                            <Calendar
                                                name="checkin_time"
                                                value={formData.checkin_time}
                                                onChange={handleChange}
                                                showTime
                                                hourFormat="24"
                                                dateFormat="yy-mm-dd"
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                placeholder="Select check-in time"
                                            />
                                            <label htmlFor="checkin_time">
                                                Check-In Time
                                            </label>
                                        </FloatLabel>
                                    </div>
                                    <div style={{ marginBottom: "2rem" }}>
                                        <FloatLabel>
                                            <Calendar
                                                name="checkout_time"
                                                value={formData.checkout_time}
                                                onChange={handleChange}
                                                showTime
                                                hourFormat="24"
                                                dateFormat="yy-mm-dd"
                                                style={{ width: "100%" }}
                                                disabled={loading}
                                                placeholder="Select check-out time"
                                            />
                                            <label htmlFor="checkout_time">
                                                Check-Out Time
                                            </label>
                                        </FloatLabel>
                                    </div>
                                    <div style={{ marginBottom: "2rem" }}>
                                        <Checkbox
                                            inputId="hasReason"
                                            name="hasReason"
                                            checked={formData.hasReason}
                                            onChange={(e) =>
                                                handleChange({
                                                    name: "hasReason",
                                                    value: e.checked,
                                                })
                                            }
                                            disabled={loading}
                                        />
                                        <label
                                            htmlFor="hasReason"
                                            style={{ marginLeft: "8px" }}
                                        >
                                            Add Reason
                                        </label>
                                    </div>
                                    {formData.hasReason && (
                                        <div style={{ marginBottom: "2rem" }}>
                                            <FloatLabel>
                                                <InputText
                                                    name="reason"
                                                    value={formData.reason}
                                                    onChange={handleChange}
                                                    style={{ width: "100%" }}
                                                    required={
                                                        formData.hasReason
                                                    }
                                                    disabled={loading}
                                                    placeholder="Enter reason"
                                                />
                                                <label htmlFor="reason">
                                                    Reason
                                                </label>
                                            </FloatLabel>
                                        </div>
                                    )}
                                    <div
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
                                            autoFocus
                                        />
                                    </div>
                                </form>
                            </Dialog>
                        </>
                    ) : (
                        <p>Please wait.</p>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default Checkin;
