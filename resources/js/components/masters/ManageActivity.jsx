import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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

function ManageActivity() {
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState("create");
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [error, setError] = useState("");
    const {
        activities: { data: activities = [], endPoints: activityEndPoints },
    } = useSelector((state) => state.global);

    const myFetch = () => {
        dispatch(
            getRecords({
                type: "activities",
                endPoint: activityEndPoints.collection,
                key: "data",
            })
        ).finally(() => setLoadingActivities(false));
    };

    useEffect(() => {
        myFetch();
    }, [dispatch]);

    const handleEdit = (id) => {
        const activity = activities.find((u) => u.id === id);
        if (activity) {
            setFormData({
                name: activity.name,
                description: activity.description,
            });
            setEditId(id);
            setMode("edit");
            setVisible(true);
        }
    };

    const handleAdd = () => {
        setMode("create");
        setFormData({ name: "", description: "" });
        setVisible(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (mode === "create") {
                dispatch(
                    createRecord({
                        type: "activities",
                        endPoint: activityEndPoints.store,
                        data: formData,
                    })
                ).then((success) => {
                    if (success) {
                        setFormData({ name: "", description: "" });
                        myFetch();
                        setVisible(false);
                    }
                });
            } else {
                dispatch(
                    updateRecord({
                        type: "activities",
                        endPoint: `${activityEndPoints.update}${editId}`,
                        data: formData,
                    })
                ).then((success) => {
                    if (success) {
                        setFormData({ name: "", description: "" });
                        myFetch();
                        setVisible(false);
                    }
                });
            }
        } catch (err) {
            setError(err.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const isDataReady = !loadingActivities;

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
                                type="activities"
                                identifier="id"
                                hasImport={true}
                                onFetch={myFetch}
                                onAdd={handleAdd}
                                onEdit={handleEdit}
                                title="Activity"
                            />
                            <Dialog
                                header={
                                    mode === "create"
                                        ? `Add Activity`
                                        : `Edit Activity`
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
                                            <InputText
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                tooltip="Enter activity name"
                                                tooltipOptions={{
                                                    position: "bottom",
                                                    mouseTrack: true,
                                                    mouseTrackTop: 15,
                                                }}
                                            />
                                            <label htmlFor="name">Name</label>
                                        </FloatLabel>
                                    </div>
                                    <div style={{ marginBottom: "2rem" }}>
                                        <FloatLabel>
                                            <InputText
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                tooltip="Enter activity description"
                                                tooltipOptions={{
                                                    position: "bottom",
                                                    mouseTrack: true,
                                                    mouseTrackTop: 15,
                                                }}
                                            />
                                            <label htmlFor="description">
                                                Description
                                            </label>
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

export default ManageActivity;
