import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIsAuthenticated } from "react-auth-kit";
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
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

function Checkin() {
    const dispatch = useDispatch();
    const isAuthenticated = useIsAuthenticated();
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState("create");
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        student: "",
        activity: "",
        checkin_time: "",
        checkout_time: "",
        other_activity: "",
        reason: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const {
        checkin: { data: checkin = [], endPoints: checkinEndPoints },
        levels: { data: levels = [], endPoints: levelEndPoints },
        class: { data: classes = [], endPoints: classEndPoints },
        students: { data: students = [], endPoints: studentEndPoints },
        activities: { data: activities = [], endPoints: activityEndPoints },
    } = useSelector((state) => state.global);

    const myFetch = () => {
        dispatch(
            getRecords({
                type: "checkin",
                endPoint: checkinEndPoints.collection,
            })
        ).then((d) => {
            if (d) {
                const formattedCheckin = d.map((i) => ({
                    id: i.id,
                    student: i.student?.name || "N/A",
                    level: i.student?.class.level.name || "N/A",
                    class: i.student?.class.name || "N/A",
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
                type: "activities",
                endPoint: activityEndPoints.collection,
                key: "data",
            })
        );
    }, [dispatch]);

    const handleEdit = (id) => {
        const iCheckin = checkin.find((u) => u.id === id);
        if (iCheckin) {
            setFormData({
                student: levelOptions.find((u) => u.id === iCheckin.level_id),
                activity: levelOptions.find((u) => u.id === iCheckin.level_id),
                checkin_time: iCheckin.checkin_time || null,
                checkout_time: iCheckin.checkout_time || null,
                other_activity: iCheckin.reason || null,
                reason: iCheckin.reason || null,
            });
            setEditId(id);
            setMode("edit");
            setVisible(true);
        }
    };

    const handleAdd = () => {
        setMode("create");
        setFormData({
            student: "",
            activity: "",
            checkin_time: "",
            checkout_time: "",
            other_activity: "",
            reason: "",
        });
        setVisible(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target ? e.target : e;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (mode === "create") {
                const success = dispatch(
                    createRecord({
                        type: "checkin",
                        endPoint: checkinEndPoints.store,
                        data: {
                            student: formData.student.id,
                            activity: formData.activity.id || null,
                            other_activity: formData.other_activity || null,
                            checkin_time: formData.checkin_time,
                            checkout_time: formData.checkout_time,
                            reason: formData.reason,
                        },
                    })
                );
                if (success) {
                    setFormData({
                        student: "",
                        activity: "",
                        checkin_time: "",
                        checkout_time: "",
                        other_activity: "",
                        reason: "",
                    });
                    setVisible(false);
                    myFetch();
                }
            } else {
                const success = dispatch(
                    updateRecord({
                        type: "checkin",
                        endPoint: `${checkinEndPoints.update}${editId}`,
                        data: {
                            student: formData.student.id,
                            activity: formData.activity.id || null,
                            other_activity: formData.other_activity || null,
                            checkin_time: formData.checkin_time,
                            checkout_time: formData.checkout_time,
                            reason: formData.reason,
                        },
                    })
                );
                if (success) {
                    setFormData({
                        student: "",
                        activity: "",
                        checkin_time: "",
                        checkout_time: "",
                        other_activity: "",
                        reason: "",
                    });
                    setVisible(false);
                    myFetch();
                }
            }
        } catch (err) {
            setError(err.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const levelOptions = levels.map((i) => ({
        id: i.id,
        label: i.name,
    }));

    const classOptions = classes.map((i) => ({
        id: i.id,
        label: i.name,
    }));

    const studentOptions = students.map((i) => ({
        id: i.id,
        label: i.name,
    }));

    const activityOptions = activities.map((i) => ({
        id: i.id,
        label: i.name,
    }));

    return (
        <div>
            <Header />
            <main style={{ padding: "20px" }}>
                <Card>
                    {isAuthenticated() ? (
                        <>
                            <DataTable
                                type="checkin"
                                identifier="id"
                                hasImport={true}
                                onFetch={myFetch}
                                onAdd={handleAdd}
                                onEdit={handleEdit}
                                title="Check In"
                            />
                            <Dialog
                                header={
                                    mode === "create"
                                        ? `Add Check In`
                                        : `Edit Check In`
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
                                                style={{ width: "100%" }}
                                                required
                                                checkmark={true}
                                                disabled={loading}
                                                placeholder="Select a level"
                                                tooltip="Select class level"
                                                tooltipOptions={{
                                                    position: "bottom",
                                                    mouseTrack: true,
                                                    mouseTrackTop: 15,
                                                }}
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
                                                style={{ width: "100%" }}
                                                required
                                                checkmark={true}
                                                disabled={loading}
                                                placeholder="Select a class"
                                                tooltip="Select a class"
                                                tooltipOptions={{
                                                    position: "bottom",
                                                    mouseTrack: true,
                                                    mouseTrackTop: 15,
                                                }}
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
                                                style={{ width: "100%" }}
                                                required
                                                checkmark={true}
                                                disabled={loading}
                                                placeholder="Select a student"
                                                tooltip="Select a student"
                                                tooltipOptions={{
                                                    position: "bottom",
                                                    mouseTrack: true,
                                                    mouseTrackTop: 15,
                                                }}
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
                                                style={{ width: "100%" }}
                                                required
                                                checkmark={true}
                                                disabled={loading}
                                                placeholder="Select a activity"
                                                tooltip="Select student activity"
                                                tooltipOptions={{
                                                    position: "bottom",
                                                    mouseTrack: true,
                                                    mouseTrackTop: 15,
                                                }}
                                            />
                                            <label htmlFor="activity">
                                                Activity
                                            </label>
                                        </FloatLabel>
                                    </div>
                                    {/* <div style={{ marginBottom: "2rem" }}>
                                        <FloatLabel>
                                            <InputText
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                tooltip="Enter class name"
                                                tooltipOptions={{
                                                    position: "bottom",
                                                    mouseTrack: true,
                                                    mouseTrackTop: 15,
                                                }}
                                            />
                                            <label htmlFor="name">Name</label>
                                        </FloatLabel>
                                    </div> */}
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
                        <p>Please log in to view and manage checkin.</p>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default Checkin;
