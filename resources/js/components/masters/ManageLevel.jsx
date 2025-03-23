import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIsAuthenticated } from "react-auth-kit";
import { getRecords, createRecord, updateRecord } from "../store/global-slice";
import Header from "../shared/layout/Header";
import DataTable from "../shared/misc/DataTable";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

function ManageLevel() {
    const dispatch = useDispatch();
    const isAuthenticated = useIsAuthenticated();
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState("create");
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const {
        levels: { data: levels = [] },
    } = useSelector((state) => state.global);

    const handleEdit = (id) => {
        const level = levels.find((u) => u.id === id);
        if (level) {
            setFormData({
                name: level.name,
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
                        type: "levels",
                        endPoint: "/api/levels",
                        data: formData,
                    })
                );
                if (success) {
                    setFormData({ name: "" });
                    setVisible(false);
                    dispatch(
                        getRecords({
                            type: "levels",
                            endPoint: "/api/levels",
                            key: "data",
                        })
                    );
                }
            } else {
                const success = dispatch(
                    updateRecord({
                        type: "levels",
                        endPoint: `/api/levels/${editId}`,
                        data: formData,
                    })
                );
                if (success) {
                    setFormData({ name: "" });
                    setVisible(false);
                    dispatch(
                        getRecords({
                            type: "levels",
                            endPoint: "/api/levels",
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
                                type="levels"
                                identifier="id"
                                hasImport={true}
                                onEdit={handleEdit}
                                onAdd={handleAdd}
                                endpoint="/api/levels"
                                title="level"
                            />
                            <Dialog
                                header={
                                    mode === "create"
                                        ? `Add Level`
                                        : `Edit Level`
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
                        <p>Please log in to view and manage levels.</p>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default ManageLevel;
