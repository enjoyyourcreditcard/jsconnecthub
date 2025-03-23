import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIsAuthenticated } from "react-auth-kit";
import { getRecords, createRecord, updateRecord, setStateData } from "../store/global-slice";
import Header from "../shared/layout/Header";
import DataTable from "../shared/misc/DataTable";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

function ManageClass() {
    const dispatch = useDispatch();
    const isAuthenticated = useIsAuthenticated();
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState("create");
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        level_id: "",
        name: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const {
        class: { data: classes = [], endPoints: classEndPoints },
    } = useSelector((state) => state.global);

    useEffect(() => {
        dispatch(
            getRecords({
                type: "class",
                endPoint: classEndPoints.collection,
                key: "data",
            })
        ).then((d) => {
            if (d) {
                const formattedClasses = d.map((i) => ({
                    id: i.id,
                    level: i.level?.name || "N/A",
                    name: i.name,
                    // level_id: i.level_id,
                    created_at: i.created_at,
                    updated_at: i.updated_at,
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
    }, [dispatch]);

    const handleEdit = (id) => {
        const iClass = classes.find((u) => u.id === id);
        if (iClass) {
            setFormData({
                level_id: iClass.level_id,
                name: iClass.name,
            });
            setEditId(id);
            setMode("edit");
            setVisible(true);
        }
    };

    const handleAdd = () => {
        setMode("create");
        setFormData({ name: "" });
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
                const success = dispatch(
                    createRecord({
                        type: "class",
                        endPoint: "/api/class",
                        data: formData,
                    })
                );
                if (success) {
                    setFormData({ name: "" });
                    setVisible(false);
                    dispatch(
                        getRecords({
                            type: "class",
                            endPoint: "/api/class",
                            key: "data",
                        })
                    );
                }
            } else {
                const success = dispatch(
                    updateRecord({
                        type: "class",
                        endPoint: `/api/class/${editId}`,
                        data: formData,
                    })
                );
                if (success) {
                    setFormData({ name: "" });
                    setVisible(false);
                    dispatch(
                        getRecords({
                            type: "class",
                            endPoint: "/api/class",
                            key: "data",
                        })
                    );
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
                                type="class"
                                identifier="id"
                                hasImport={true}
                                onEdit={handleEdit}
                                onAdd={handleAdd}
                                endpoint="/api/class"
                                title="Class"
                            />
                            <Dialog
                                header={
                                    mode === "create"
                                        ? `Add Class`
                                        : `Edit Class`
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
                                                name="level"
                                                value={formData.level_id}
                                                onChange={handleChange}
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                tooltip="Enter class level"
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
                        <p>Please log in to view and manage class.</p>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default ManageClass;
