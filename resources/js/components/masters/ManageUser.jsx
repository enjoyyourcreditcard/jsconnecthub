import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIsAuthenticated } from "react-auth-kit";
import {
    getRecords,
    deleteRecord,
    createRecord,
    updateRecord,
} from "../store/global-slice";
import Header from "../shared/layout/Header";
import DataTable from "../shared/misc/DataTable";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

function ManageUser() {
    const dispatch = useDispatch();
    const isAuthenticated = useIsAuthenticated();
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState("create");
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isReady, setIsReady] = useState(false);
    const {
        users: { data: users = [] },
    } = useSelector((state) => state.global);

    useEffect(() => {
        if (isAuthenticated()) {
            setIsReady(true);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isReady) {
            dispatch(
                getRecords({
                    type: "users",
                    endPoint: "/api/users",
                    key: "data",
                })
            );
        }
    }, [dispatch, isReady]);

    const handleEdit = (id) => {
        const user = users.find((u) => u.id === id);
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: "",
            });
            setEditId(id);
            setMode("edit");
            setVisible(true);
        }
    };

    const handleAdd = () => {
        setMode("create");
        setFormData({ name: "", email: "", password: "" });
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
                        type: "users",
                        endPoint: "/api/users",
                        data: formData,
                    })
                );
                if (success) {
                    setFormData({ name: "", email: "", password: "" });
                    setVisible(false);
                    dispatch(
                        getRecords({
                            type: "users",
                            endPoint: "/api/users",
                            key: "data",
                        })
                    );
                }
            } else {
                const success = dispatch(
                    updateRecord({
                        type: "users",
                        endPoint: `/api/users/${editId}`,
                        data: formData,
                    })
                );
                if (success) {
                    setFormData({ name: "", email: "", password: "" });
                    setVisible(false);
                    dispatch(
                        getRecords({
                            type: "users",
                            endPoint: "/api/users",
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
                                type="users"
                                identifier="id"
                                onEdit={handleEdit}
                                onAdd={handleAdd}
                                endpoint="/api/users"
                                title="User"
                            />
                            <Dialog
                                header={
                                    mode === "create" ? `Add User` : `Edit User`
                                }
                                visible={visible}
                                style={{ width: "400px" }}
                                onHide={() => setVisible(false)}
                            >
                                <form
                                    onSubmit={handleSubmit}
                                    style={{ padding: "20px" }}
                                >
                                    {error && (
                                        <p
                                            style={{
                                                color: "red",
                                                marginBottom: "15px",
                                            }}
                                        >
                                            {error}
                                        </p>
                                    )}
                                    <div style={{ marginBottom: "15px" }}>
                                        <InputText
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Name"
                                            style={{ width: "100%" }}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <InputText
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Email"
                                            type="email"
                                            style={{ width: "100%" }}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <InputText
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Password"
                                            type="password"
                                            style={{ width: "100%" }}
                                            required={mode === "create"}
                                            disabled={loading}
                                        />
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
                        <p>Please log in to view and manage users.</p>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default ManageUser;
