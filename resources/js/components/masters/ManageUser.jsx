import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useIsAuthenticated } from "react-auth-kit";
import { getRecords, deleteRecord, createRecord } from "../store/global-slice";
import Header from "../shared/layout/Header";
import Table from "../shared/misc/Table";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";

function ManageUser() {
    const dispatch = useDispatch();
    const isAuthenticated = useIsAuthenticated();
    const [visible, setVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isReady, setIsReady] = useState(false);

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
        console.log(`Edit user with ID: ${id}`);
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete user ${id}?`)) {
            dispatch(deleteRecord({ endPoint: `/api/users/${id}` })).then(
                (success) => {
                    if (success) {
                        dispatch(
                            getRecords({
                                type: "users",
                                endPoint: "/api/users",
                                key: "data",
                            })
                        );
                    }
                }
            );
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreate = async () => {
        setLoading(true);
        setError("");
        try {
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
        } catch (err) {
            setError(err.message || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    const footerContent = (
        <div>
            <Button
                label="Cancel"
                icon="pi pi-times"
                onClick={() => setVisible(false)}
                className="p-button-text"
                disabled={loading}
            />
            <Button
                label="Create"
                icon="pi pi-check"
                onClick={handleCreate}
                disabled={loading}
                autoFocus
            />
        </div>
    );

    return (
        <div>
            <Header />
            <main style={{ padding: "20px" }}>
                <Card>
                    {isAuthenticated() ? (
                        <>
                            <Button
                                label="Add User"
                                icon="pi pi-plus"
                                onClick={() => setVisible(true)}
                                style={{ marginBottom: "20px" }}
                            />
                            <Table
                                type="users"
                                identifier="id"
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                endpoint="/api/users"
                            />
                            <Dialog
                                header="Create New User"
                                visible={visible}
                                style={{ width: "400px" }}
                                onHide={() => setVisible(false)}
                                footer={footerContent}
                            >
                                {loading ? (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: "20px",
                                        }}
                                    >
                                        <ProgressSpinner />
                                        <p>Creating...</p>
                                    </div>
                                ) : (
                                    <div style={{ padding: "20px" }}>
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
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
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
