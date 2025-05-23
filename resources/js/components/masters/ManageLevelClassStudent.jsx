import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIsAuthenticated } from "react-auth-kit";
import {
    getRecords,
    createRecord,
    updateRecord,
    setStateData,
} from "../store/global-slice";
import Header from "../shared/layout/Header";
import DataTable from "../shared/misc/DataTable";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

function ManageLevelClassStudent() {
    const dispatch = useDispatch();
    const isAuthenticated = useIsAuthenticated();
    const [levelDialog, setLevelDialog] = useState(false);
    const [classDialog, setClassDialog] = useState(false);
    const [studentDialog, setStudentDialog] = useState(false);
    const [mode, setMode] = useState("create");
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ name: "" });
    const [classFormData, setClassFormData] = useState({
        name: "",
        level_id: "",
    });
    const [studentFormData, setStudentFormData] = useState({
        name: "",
        class_id: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const {
        levels: { data: levels = [], endPoints: levelEndPoints },
        class: { data: classes = [], endPoints: classEndPoints },
        students: { data: students = [], endPoints: studentEndPoints },
    } = useSelector((state) => state.global);

    const myFetch = () => {
        dispatch(
            getRecords({
                type: "levels",
                endPoint: levelEndPoints.collection,
            })
        ).then((d) => {
            if (d) {
                const formattedLevels = d.map((i) => ({
                    id: i.id,
                    name: i.name,
                }));
                dispatch(
                    setStateData({
                        type: "levels",
                        data: formattedLevels,
                        key: "data",
                        isMerge: false,
                    })
                );
            }
        });
        dispatch(
            getRecords({
                type: "class",
                endPoint: classEndPoints.collection,
            })
        ).then((d) => {
            if (d) {
                const formattedClasses = d.map((i) => ({
                    id: i.id,
                    name: i.name,
                    level_id: i.level_id,
                }));
                dispatch(
                    setStateData({
                        type: "class",
                        data: formattedClasses,
                        key: "data",
                        isMerge: false,
                    })
                );
            }
        });
        dispatch(
            getRecords({
                type: "students",
                endPoint: studentEndPoints.collection,
            })
        ).then((d) => {
            if (d) {
                const formattedStudents = d.map((i) => ({
                    id: i.id,
                    name: i.name,
                    class_id: i.class_id,
                }));
                dispatch(
                    setStateData({
                        type: "students",
                        data: formattedStudents,
                        key: "data",
                        isMerge: false,
                    })
                );
            }
        });
    };

    useEffect(() => {
        myFetch();
    }, [dispatch]);

    const handleEditLevel = (id) => {
        const i = levels.find((u) => u.id === id);
        if (i) {
            setFormData({
                name: i.name,
            });
            setEditId(id);
            setMode("edit");
            setLevelDialog(true);
        }
    };

    const handleEditClass = (id) => {
        const i = classes.find((u) => u.id === id);
        if (i) {
            setFormData({
                name: i.name,
                level_id: i.level_id,
            });
            setEditId(id);
            setMode("edit");
            setClassDialog(true);
        }
    };

    const handleEditStudent = (id) => {
        const i = students.find((u) => u.id === id);
        if (i) {
            setFormData({
                name: i.name,
                class_id: i.class_id,
            });
            setEditId(id);
            setMode("edit");
            setStudentDialog(true);
        }
    };

    const handleAddLevel = () => {
        setMode("create");
        setFormData({ name: "" });
        setLevelDialog(true);
    };

    const handleAddClass = () => {
        setMode("create");
        setClassFormData({ name: "", level_id: "" });
        setLevelDialog(true);
    };

    const handleAddStudent = () => {
        setMode("create");
        setStudentFormData({ name: "", class_id: "" });
        setLevelDialog(true);
    };

    const handleDeleteClass = (id) => {
        dispatch(
            deleteRecord({
                endPoint: `${classEndPoints.delete}${id}`,
            })
        ).then((success) => {
            if (success) {
                myFetch();
            }
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleClassChange = (e) => {
        const { name, value } = e.target;
        setClassFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStudentChange = (e) => {
        const { name, value } = e.target;
        setStudentFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e, formType) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (formType === "levels") {
                if (mode === "create") {
                    const success = dispatch(
                        createRecord({
                            type: "levels",
                            endPoint: levelEndPoints.store,
                            data: formData,
                        })
                    );
                    if (success) {
                        setFormData({ name: "" });
                        setLevelDialog(false);
                        myFetch();
                    }
                } else {
                    const success = dispatch(
                        updateRecord({
                            type: "levels",
                            endPoint: `${levelEndPoints.update}${editId}`,
                            data: formData,
                        })
                    );
                    if (success) {
                        setFormData({ name: "" });
                        setLevelDialog(false);
                        myFetch();
                    }
                }
            } else if (formType === "class") {
                if (mode === "create") {
                    const success = dispatch(
                        createRecord({
                            type: "class",
                            endPoint: classEndPoints.store,
                            data: classFormData,
                        })
                    );
                    if (success) {
                        setClassFormData({ name: "", level_id: "" });
                        setLevelDialog(false);
                        myFetch();
                    }
                } else {
                    const success = dispatch(
                        updateRecord({
                            type: "class",
                            endPoint: `${classEndPoints.update}${editId}`,
                            data: classFormData,
                        })
                    );
                    if (success) {
                        setClassFormData({ name: "", level_id: "" });
                        setLevelDialog(false);
                        myFetch();
                    }
                }
            } else if (formType === "students") {
                if (mode === "create") {
                    const success = dispatch(
                        createRecord({
                            type: "students",
                            endPoint: studentEndPoints.store,
                            data: studentFormData,
                        })
                    );
                    if (success) {
                        setStudentFormData({ name: "", class_id: "" });
                        setLevelDialog(false);
                        myFetch();
                    }
                } else {
                    const success = dispatch(
                        updateRecord({
                            type: "students",
                            endPoint: `${studentEndPoints.update}${editId}`,
                            data: studentFormData,
                        })
                    );
                    if (success) {
                        setStudentFormData({ name: "", class_id: "" });
                        setLevelDialog(false);
                        myFetch();
                    }
                }
            }
        } catch (err) {
            setError(err.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <main style={{ padding: "20px" }}>
                <Card>
                    {isAuthenticated() ? (
                        <>
                            <DataTable
                                type="levels"
                                identifier="id"
                                hasImport={true}
                                hasExpand={true}
                                onFetch={myFetch}
                                onAdd={handleAddLevel}
                                onEdit={handleEditLevel}
                                onAddClass={handleAddClass}
                                onEditClass={handleEditClass}
                                onDeleteClass={handleDeleteClass}
                                onAddStudent={handleAddStudent}
                                onEditStudent={handleEditStudent}
                                title="Level-Class-Student"
                                classes={classes}
                                students={students}
                            />
                            <Dialog
                                header={
                                    mode === "create"
                                        ? `Add Level`
                                        : `Edit Level`
                                }
                                visible={levelDialog}
                                style={{ width: "400px" }}
                                onHide={() => setLevelDialog(false)}
                            >
                                <form
                                    onSubmit={(e) => handleSubmit(e, "levels")}
                                    className="mt-8"
                                >
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
                                            <InputText
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                tooltip="Enter level name"
                                                tooltipOptions={{
                                                    position: "bottom",
                                                    mouseTrack: true,
                                                    mouseTrackTop: 15,
                                                }}
                                            />
                                            <label htmlFor="name">Name</label>
                                        </FloatLabel>
                                    </div>
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
                                            onClick={() =>
                                                setLevelDialog(false)
                                            }
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
                            <Dialog
                                header={
                                    mode === "create"
                                        ? `Add Class`
                                        : `Edit Class`
                                }
                                visible={classDialog}
                                style={{ width: "400px" }}
                                onHide={() => setClassDialog(false)}
                            >
                                <form
                                    onSubmit={(e) => handleSubmit(e, "class")}
                                    className="mt-8"
                                >
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
                                            <InputText
                                                name="name"
                                                value={formData.name}
                                                onChange={handleClassChange}
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
                                    </div>
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
                                            onClick={() =>
                                                setClassDialog(false)
                                            }
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
                            <Dialog
                                header={
                                    mode === "create"
                                        ? `Add Student`
                                        : `Edit Student`
                                }
                                visible={studentDialog}
                                style={{ width: "400px" }}
                                onHide={() => setStudentDialog(false)}
                            >
                                <form
                                    onSubmit={(e) =>
                                        handleSubmit(e, "students")
                                    }
                                    className="mt-8"
                                >
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
                                            <InputText
                                                name="name"
                                                value={formData.name}
                                                onChange={handleStudentChange}
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                tooltip="Enter student name"
                                                tooltipOptions={{
                                                    position: "bottom",
                                                    mouseTrack: true,
                                                    mouseTrackTop: 15,
                                                }}
                                            />
                                            <label htmlFor="name">Name</label>
                                        </FloatLabel>
                                    </div>
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
                                            onClick={() =>
                                                setStudentDialog(false)
                                            }
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
                        <p>
                            Please log in to view and manage levels, class, and
                            students.
                        </p>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default ManageLevelClassStudent;
