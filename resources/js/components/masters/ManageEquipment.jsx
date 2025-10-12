import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createRecord,
    updateRecord,
    setStateData,
    setToastMessage,
    resetStateKeyData,
} from "../store/global-slice";
import Header from "../shared/layout/Header";
import DataTable from "../shared/misc/DataTable";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DateTime } from "luxon";
import api from "../api";
import { Calendar } from "primereact/calendar";
import { Badge } from "primereact/badge";
import { Toast } from "primereact/toast";
import { useAuthUser } from "react-auth-kit";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import _ from "lodash";

function ManageEquipment() {
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState("create");
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        cca_id: null,
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");
    const [ccas, setCcas] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [subEquipment, setSubEquipment] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loansVisible, setLoansVisible] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [loanLoading, setLoanLoading] = useState(false);

    const myFetch = () => {
        Promise.all([
            api.get("/api/ccas"),
            api.get("/api/equipment"),
        ])
            .then(([ccaRes, eqRes]) => {
                console.log("CCA Response:", ccaRes.data);
                console.log("Equipment Response:", eqRes.data);

                const ccaList = (ccaRes.data?.result || []).map((c) => ({
                    id: c.id,
                    name: c.name,
                }));
                setCcas(ccaList);

                const eqList = eqRes.data?.result || [];
                console.log("Equipment List:", eqList);

                // Format equipment as sub-facilities with parent_id relationship
                const formattedEquipment = eqList.map((eq) => ({
                    id: eq.id,
                    name: eq.name,
                    parent_id: eq.cca_id, // This creates the parent-child relationship
                }));
                console.log("Formatted Equipment with parent_id:", formattedEquipment);
                console.log("CCAs:", ccaList);
                console.log("Sample CCA:", ccaList[0]);
                console.log("Sample Equipment:", eqList[0]);
                setSubEquipment(formattedEquipment);
            })
            .catch((error) => {
                console.error("Fetch error:", error.message);
            })
            .finally(() => setLoadingData(false));
    };

    useEffect(() => {
        myFetch();
    }, []);

    const ccaOptions = ccas.map((c) => ({
        label: c.name,
        value: c.id,
    }));

    const isDataReady = !loadingData;

    const handleEdit = (id) => {
        const eq = subEquipment.find((e) => e.id === id);
        if (eq) {
            setFormData({
                name: eq.name,
                cca_id: eq.cca_id,
            });
            setEditId(id);
            setMode("edit");
            setVisible(true);
        }
    };

    const handleAdd = () => {
        setMode("create");
        setFormData({ name: "", cca_id: null });
        setVisible(true);
    };

    const handleEditSubEquipment = (id) => {
        handleEdit(id);
    };

    const handleDelete = async (id) => {
        try {
            dispatch(
                setStateData({
                    key: "spinner",
                    data: { show: true, text: "Deleting..." },
                })
            );

            await api.delete(`/api/equipment/${id}`);

            dispatch(
                setToastMessage({
                    severity: "success",
                    summary: "Success",
                    detail: "Equipment deleted successfully.",
                })
            );

            myFetch();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Delete failed";
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Error",
                    detail: msg,
                })
            );
        } finally {
            dispatch(
                setStateData({
                    key: "spinner",
                    data: { show: false },
                })
            );
        }
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
                await api.post("/api/equipment", formData);
                setFormData({ name: "", cca_id: null });
                myFetch();
                setVisible(false);
            } else {
                await api.put(`/api/equipment/${editId}`, formData);
                setFormData({ name: "", cca_id: null });
                myFetch();
                setVisible(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const fetchLoans = async () => {
        setLoanLoading(true);
        try {
            const response = await api.get("/api/equipment-loans");
            setLoans(response.data?.result || []);
        } catch (error) {
            console.error("Error fetching loans:", error);
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to fetch equipment loans.",
                })
            );
        } finally {
            setLoanLoading(false);
        }
    };

    const handleViewLoans = () => {
        setLoansVisible(true);
        fetchLoans();
    };

    const handleApproveLoan = async (loanId) => {
        try {
            dispatch(
                setStateData({
                    key: "spinner",
                    data: { show: true, text: "Approving loan..." },
                })
            );

            await api.put(`/api/equipment-loans/${loanId}/approve`);

            dispatch(
                setToastMessage({
                    severity: "success",
                    summary: "Success",
                    detail: "Equipment loan approved successfully.",
                })
            );

            fetchLoans(); // Refresh loans list
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Approval failed";
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Error",
                    detail: msg,
                })
            );
        } finally {
            dispatch(
                setStateData({
                    key: "spinner",
                    data: { show: false },
                })
            );
        }
    };

    const handleRejectLoan = async (loanId) => {
        try {
            dispatch(
                setStateData({
                    key: "spinner",
                    data: { show: true, text: "Rejecting loan..." },
                })
            );

            await api.put(`/api/equipment-loans/${loanId}/reject`);

            dispatch(
                setToastMessage({
                    severity: "success",
                    summary: "Success",
                    detail: "Equipment loan rejected successfully.",
                })
            );

            fetchLoans(); // Refresh loans list
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Rejection failed";
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Error",
                    detail: msg,
                })
            );
        } finally {
            dispatch(
                setStateData({
                    key: "spinner",
                    data: { show: false },
                })
            );
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { severity: "warning", text: "Pending" },
            approved: { severity: "success", text: "Approved" },
            rejected: { severity: "danger", text: "Rejected" },
            returned: { severity: "info", text: "Returned" },
        };
        return statusConfig[status] || { severity: "secondary", text: status };
    };

    return (
        <div>
            <Header />
            <main className="admin-container with-color" style={{ padding: "20px" }}>
                <Card>
                    {isDataReady ? (
                        <>
                            <DataTable
                                type="ccas"
                                identifier="id"
                                hasExpand={true}
                                hasImport={true}
                                onFetch={myFetch}
                                onAdd={handleAdd}
                                onEdit={handleEdit}
                                onEditSubFacility={handleEditSubEquipment}
                                title="Equipment"
                                subFacilities={subEquipment}
                                collection={ccas}
                                onViewLoans={handleViewLoans}
                            />
                            <Dialog
                                header={
                                    mode === "create"
                                        ? "Add Equipment"
                                        : "Edit Equipment"
                                }
                                visible={visible}
                                style={{ width: "400px" }}
                                onHide={() => setVisible(false)}
                            >
                                <form onSubmit={handleSubmit} className="mt-8">
                                    {error && (
                                        <p style={{ color: "red", marginBottom: "2rem" }}>
                                            {error}
                                        </p>
                                    )}
                                    <div style={{ marginBottom: "2rem" }}>
                                        <FloatLabel>
                                            <Dropdown
                                                name="cca_id"
                                                value={formData.cca_id}
                                                options={ccaOptions}
                                                onChange={handleChange}
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                            />
                                            <label htmlFor="cca_id">CCA</label>
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
                                            />
                                            <label htmlFor="name">Equipment Name</label>
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
                                            label={mode === "create" ? "Create" : "Update"}
                                            icon="pi pi-check"
                                            type="submit"
                                            disabled={loading}
                                            autoFocus
                                        />
                                    </div>
                                </form>
                            </Dialog>
                            <Dialog
                                header="Equipment Loans"
                                visible={loansVisible}
                                style={{ width: "800px" }}
                                onHide={() => setLoansVisible(false)}
                            >
                                <div className="p-fluid">
                                    {loanLoading ? (
                                        <p>Loading loans...</p>
                                    ) : loans.length === 0 ? (
                                        <p>No equipment loans found.</p>
                                    ) : (
                                        <div className="grid">
                                            {loans.map((loan) => (
                                                <div key={loan.id} className="col-12 md:col-6 lg:col-4">
                                                    <Card>
                                                        <div className="flex flex-column gap-2">
                                                            <div className="flex justify-between align-items-center">
                                                                <strong>{loan.equipment?.name || "Unknown Equipment"}</strong>
                                                                <span
                                                                    className={`p-tag p-tag-${getStatusBadge(loan.status).severity}`}
                                                                >
                                                                    {getStatusBadge(loan.status).text}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <small className="text-muted">
                                                                    Requested by: {loan.user?.name || "Unknown User"}
                                                                </small>
                                                            </div>
                                                            <div>
                                                                <small className="text-muted">
                                                                    Start Date: {loan.start_date}
                                                                </small>
                                                            </div>
                                                            <div>
                                                                <small className="text-muted">
                                                                    End Date: {loan.end_date}
                                                                </small>
                                                            </div>
                                                            {loan.status === "pending" && (
                                                                <div className="flex gap-2 mt-2">
                                                                    <Button
                                                                        label="Approve"
                                                                        icon="pi pi-check"
                                                                        size="small"
                                                                        className="p-button-success"
                                                                        onClick={() => handleApproveLoan(loan.id)}
                                                                    />
                                                                    <Button
                                                                        label="Reject"
                                                                        icon="pi pi-times"
                                                                        size="small"
                                                                        className="p-button-danger"
                                                                        onClick={() => handleRejectLoan(loan.id)}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Card>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
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

export default ManageEquipment;


