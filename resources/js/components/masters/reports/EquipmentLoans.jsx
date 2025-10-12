import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getRecords,
    updateRecord,
    deleteRecord,
    setStateData,
    setToastMessage,
    resetStateKeyData,
} from "../../store/global-slice";
import Header from "../../shared/layout/Header";
import DataTable from "../../shared/misc/DataTable";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { InputText } from "primereact/inputtext";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "react-auth-kit";
import _ from "lodash";
import "../../../../css/home.css";

function EquipmentLoans() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = useAuthUser();
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState("view");
    const [editId, setEditId] = useState(null);
    const [timeFilter, setTimeFilter] = useState("month");
    const [dateFilter, setDateFilter] = useState(null);
    const [rangeFilter, setRangeFilter] = useState(null);
    const [rawLoans, setRawLoans] = useState([]);
    const [formData, setFormData] = useState({
        cca_id: null,
        equipment_id: null,
        start_date: null,
        end_date: null,
        status: "pending",
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");
    const [equipmentLoans, setEquipmentLoans] = useState([]);
    const [ccas, setCcas] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [equipmentOptions, setEquipmentOptions] = useState([]);

    const myFetch = (params = {}) => {
        let currentDateFilter =
            params?.dateFilter !== undefined ? params.dateFilter : dateFilter;
        let currentFilter =
            params?.timeFilter !== undefined ? params.timeFilter : timeFilter;
        let currentRange =
            params?.rangeFilter !== undefined
                ? params.rangeFilter
                : rangeFilter;

        let url = "/api/equipment-loans";

        const queryParams = [];
        if (currentFilter) {
            queryParams.push(`time=${currentFilter}`);
        }
        if (currentRange) {
            if (currentRange[0] && currentRange[1]) {
                const start = currentRange[0].toISOString();
                const endDate = new Date(currentRange[1]);
                endDate.setUTCDate(endDate.getUTCDate() + 1);
                const end = endDate.toISOString();
                queryParams.push(`range_time[start]=${start}&range_time[end]=${end}`);
            } else if (currentRange && currentRange[0]) {
                const start = currentRange[0].toISOString();
                const endDate = new Date(currentRange[0]);
                endDate.setUTCDate(endDate.getUTCDate() + 1);
                const end = endDate.toISOString();
                queryParams.push(`range_time[start]=${start}&range_time[end]=${end}`);
            }
        }
        if (currentDateFilter) {
            const start = currentDateFilter.toISOString();
            const endDate = new Date(currentDateFilter);
            endDate.setUTCDate(endDate.getUTCDate() + 1);
            const end = endDate.toISOString();
            queryParams.push(`range_time[start]=${start}&range_time[end]=${end}`);
        }

        if (queryParams.length > 0) {
            url += `?${queryParams.join("&")}`;
        }

        api.get(url)
            .then((response) => {
                const data = response.data?.result || [];
                setRawLoans(data);
                if (data) {
                    const formattedLoans = data.map((i) => ({
                        id: i.id,
                        user: i.user?.name || "N/A",
                        equipment: i.equipment?.name || "N/A",
                        cca: i.equipment?.cca?.name || "N/A",
                        start_date: i.start_date
                            ? new Date(i.start_date).toLocaleDateString()
                            : "N/A",
                        end_date: i.end_date
                            ? new Date(i.end_date).toLocaleDateString()
                            : "N/A",
                        status: i.status || "pending",
                    }));
                    setEquipmentLoans(formattedLoans);
                }
                setLoadingData(false);
            })
            .catch((err) => {
                console.error(err);
                setLoadingData(false);
            });
    };

    useEffect(() => {
        myFetch();
        // Fetch CCAs and Equipment for reference
        api.get("/api/ccas").then((res) => setCcas(res.data?.result || []));
        api.get("/api/equipment").then((res) => setEquipment(res.data?.result || []));
    }, []);

    // Update equipment options when CCA is selected
    useEffect(() => {
        if (formData.cca_id) {
            const filteredEquipment = equipment.filter(eq => eq.cca_id === formData.cca_id);
            setEquipmentOptions(filteredEquipment.map(eq => ({
                label: eq.name,
                value: eq.id
            })));
        } else {
            setEquipmentOptions([]);
        }
    }, [formData.cca_id, equipment]);

    const ccaOptions = ccas.map((c) => ({
        label: c.name,
        value: c.id,
    }));

    const handleEdit = (id) => {
        const loan = rawLoans.find((b) => b.id === id);
        if (loan) {
            setFormData({
                user: loan.user?.name || null,
                equipment: loan.equipment?.name || null,
                start_date: loan.start_date ? new Date(loan.start_date) : null,
                end_date: loan.end_date ? new Date(loan.end_date) : null,
                status: loan.status || "pending",
            });
            setEditId(loan.id);
            setMode("edit");
            setVisible(true);
        }
    };

    // Optional: separate view handler if needed elsewhere
    const handleView = (id) => {
        const loan = rawLoans.find((b) => b.id === id);
        if (loan) {
            setFormData({
                user: loan.user?.name || null,
                equipment: loan.equipment?.name || null,
                start_date: loan.start_date ? new Date(loan.start_date) : null,
                end_date: loan.end_date ? new Date(loan.end_date) : null,
                status: loan.status || "pending",
            });
            setEditId(loan.id);
            setMode("view");
            setVisible(true);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError("");

        try {
            dispatch(
                setStateData({
                    key: "spinner",
                    data: { show: true, text: "Updating..." },
                })
            );

            await api.put(`/api/equipment-loans/${editId}`, {
                status: formData.status,
            });

            dispatch(
                setToastMessage({
                    severity: "success",
                    summary: "Success",
                    detail: "Loan status updated successfully.",
                })
            );

            setVisible(false);
            myFetch();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Update failed";
            setError(msg);
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
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!auth()) {
            dispatch(
                setToastMessage({
                    severity: "warn",
                    summary: "Login Required",
                    detail: "Please login to submit an equipment loan.",
                })
            );
            navigate("/login");
            setLoading(false);
            return;
        }

        if (!formData.cca_id || !formData.equipment_id || !formData.start_date) {
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Missing Information",
                    detail: "Select CCA, equipment, and loan period.",
                })
            );
            setLoading(false);
            return;
        }

        const [start, end] = Array.isArray(formData.start_date) ? formData.start_date : [formData.start_date, formData.start_date];

        const startDate = start
            ? new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()))
                  .toISOString()
                  .slice(0, 10)
            : null;
        const endDate = end
            ? new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()))
                  .toISOString()
                  .slice(0, 10)
            : null;

        try {
            dispatch(
                setStateData({
                    key: "spinner",
                    data: { show: true, text: "Creating..." },
                })
            );
            await api.post("/api/equipment-loans", {
                equipment_id: formData.equipment_id,
                user_id: auth()?.id,
                start_date: startDate,
                end_date: endDate,
            });
            dispatch(
                setToastMessage({
                    severity: "success",
                    summary: "Success",
                    detail: "Equipment loan requested successfully.",
                })
            );
            setFormData({
                cca_id: null,
                equipment_id: null,
                start_date: null,
                end_date: null,
                status: "pending",
            });
            setVisible(false);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Operation failed";
            setError(msg);
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
            setLoading(false);
        }
    };

    const handleClose = () => {
        setVisible(false);
        setFormData({
            user: null,
            equipment: null,
            start_date: null,
            end_date: null,
            status: null,
        });
        setEditId(null);
        setError("");
    };

    const handleAdd = () => {
        setMode("create");
        setFormData({
            user: null,
            equipment: null,
            start_date: null,
            end_date: null,
            status: "pending",
        });
        setVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            dispatch(
                setStateData({
                    key: "spinner",
                    data: { show: true, text: "Deleting..." },
                })
            );

            await api.delete(`/api/equipment-loans/${id}`);

            dispatch(
                setToastMessage({
                    severity: "success",
                    summary: "Success",
                    detail: "Loan deleted successfully.",
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

    const columns = [
        { field: "user", header: "User" },
        { field: "equipment", header: "Equipment" },
        { field: "cca", header: "CCA" },
        { field: "start_date", header: "Start Date" },
        { field: "end_date", header: "End Date" },
        { field: "status", header: "Status" },
    ];

    const statusOptions = [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "Returned", value: "returned" },
    ];

    return (
        <div>
            <Header />
            <main className="admin-container with-color" style={{ padding: "20px" }}>
                <Card>
                    <DataTable
                        type="equipment-loans"
                        identifier="id"
                        title="Equipment Loans"
                        collection={equipmentLoans}
                        onFetch={(params) => myFetch(params)}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        timeFilter={timeFilter}
                        setTimeFilter={setTimeFilter}
                        dateFilter={dateFilter}
                        setDateFilter={setDateFilter}
                        rangeFilter={rangeFilter}
                        setRangeFilter={setRangeFilter}
                    />
                </Card>
            </main>

            <Dialog
                header={mode === "view" ? "View Loan" : mode === "create" ? "Add Loan" : "Edit Loan Status"}
                visible={visible}
                style={{ width: "50vw" }}
                onHide={handleClose}
                breakpoints={{ "960px": "75vw", "641px": "90vw" }}
            >
                {mode === "create" ? (
                    <form onSubmit={handleSubmit} className="mt-8">
                        {error && (
                            <p style={{ color: "red", marginBottom: "2rem" }}>
                                {error}
                            </p>
                        )}
                        <div className="grid grid-cols-1 gap-4">
                            <FloatLabel>
                                <Dropdown
                                    value={formData.cca_id}
                                    onChange={(e) => setFormData({ ...formData, cca_id: e.value })}
                                    options={ccaOptions}
                                    required
                                    style={{ width: "100%" }}
                                />
                                <label>CCA</label>
                            </FloatLabel>
                            <FloatLabel>
                                <Dropdown
                                    value={formData.equipment_id}
                                    onChange={(e) => setFormData({ ...formData, equipment_id: e.value })}
                                    options={equipmentOptions}
                                    required
                                    disabled={!formData.cca_id}
                                    style={{ width: "100%" }}
                                />
                                <label>Equipment</label>
                            </FloatLabel>
                            <FloatLabel>
                                <Calendar
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.value })}
                                    selectionMode="range"
                                    minDate={new Date()}
                                    dateFormat="yy-mm-dd"
                                    style={{ width: "100%" }}
                                    required
                                />
                                <label>Loan Period</label>
                            </FloatLabel>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button label="Cancel" onClick={handleClose} severity="secondary" />
                            <Button label="Submit" type="submit" disabled={loading} />
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        <FloatLabel>
                            <input
                                type="text"
                                value={formData.user || ""}
                                disabled
                                className="p-inputtext p-component"
                                style={{ width: "100%" }}
                            />
                            <label>User</label>
                        </FloatLabel>
                        <FloatLabel>
                            <input
                                type="text"
                                value={formData.equipment || ""}
                                disabled
                                className="p-inputtext p-component"
                                style={{ width: "100%" }}
                            />
                            <label>Equipment</label>
                        </FloatLabel>
                        <FloatLabel>
                            <Calendar
                                value={formData.start_date}
                                disabled
                                dateFormat="yy-mm-dd"
                                style={{ width: "100%" }}
                            />
                            <label>Start Date</label>
                        </FloatLabel>
                        <FloatLabel>
                            <Calendar
                                value={formData.end_date}
                                disabled
                                dateFormat="yy-mm-dd"
                                style={{ width: "100%" }}
                            />
                            <label>End Date</label>
                        </FloatLabel>
                        <FloatLabel>
                            <Dropdown
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.value })}
                                options={statusOptions}
                                disabled={mode === "view"}
                                style={{ width: "100%" }}
                            />
                            <label>Status</label>
                        </FloatLabel>
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button label="Close" onClick={handleClose} severity="secondary" />
                    {mode === "edit" && (
                        <Button label="Save" onClick={handleSave} disabled={loading} />
                    )}
                </div>
            </Dialog>
        </div>
    );
}

export default EquipmentLoans;

// Wizard version (previously in EquipmentLoan.jsx)
export function EquipmentLoan() {
    const dispatch = useDispatch();
    const stepperRef = useRef(null);
    const navigate = useNavigate();
    const toast = useRef(null);
    const auth = useAuthUser();
    const {} = useSelector((state) => state.global);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [loadingLevels, setLoadingLevels] = useState(false);
    const [loadingClass, setLoadingClass] = useState(false);
    const [loadingStudent, setLoadingStudent] = useState(false);
    const [error, setError] = useState("");

    const [ccas, setCcas] = useState([]);
    const [equipment, setEquipment] = useState([]);

    const [ccaId, setCcaId] = useState(null);
    const [equipmentId, setEquipmentId] = useState(null);
    const [dates, setDates] = useState(null);

    useEffect(() => {
        const fetchRefs = async () => {
            try {
                dispatch(
                    setStateData({
                        key: "spinner",
                        data: { show: true, text: "Fetching..." },
                    })
                );
                const [ccaRes, eqRes] = await Promise.all([
                    api.get("/api/ccas"),
                    api.get("/api/equipment"),
                ]);
                setCcas(ccaRes.data?.result || []);
                setEquipment(eqRes.data?.result || []);
            } catch (e) {
                dispatch(
                    setStateData({
                        key: "alert",
                        data: {
                            type: "danger",
                            text: e.message || "Failed to fetch references",
                            show: true,
                        },
                    })
                );
            } finally {
                dispatch(resetStateKeyData({ key: "spinner" }));
                setLoadingData(false);
            }
        };
        fetchRefs();
    }, []);

    const isDataReady =
        !loadingData && !loadingLevels && !loadingClass && !loadingStudent;

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        if (!auth()) {
            dispatch(
                setToastMessage({
                    severity: "warn",
                    summary: "Login Required",
                    detail: "Please login to submit an equipment loan.",
                })
            );
            navigate("/login");
            setLoading(false);
            return;
        }

        if (!equipmentId || !dates) {
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Missing Information",
                    detail: "Select equipment and date range.",
                })
            );
            setLoading(false);
            return;
        }

        const [start, end] = Array.isArray(dates) ? dates : [dates, dates];

        const startDate = start
            ? new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()))
                  .toISOString()
                  .slice(0, 10)
            : null;
        const endDate = end
            ? new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()))
                  .toISOString()
                  .slice(0, 10)
            : null;

        try {
            dispatch(
                setStateData({
                    key: "spinner",
                    data: { show: true, text: "Creating..." },
                })
            );
            await api.post("/api/equipment-loans", {
                equipment_id: equipmentId,
                user_id: auth()?.id,
                start_date: startDate,
                end_date: endDate,
            });
            if (toast.current) {
                toast.current.add({
                    severity: "success",
                    summary: "Success",
                    detail: "Equipment loan requested. Awaiting confirmation.",
                });
            }
            dispatch(
                setToastMessage({
                    severity: "success",
                    summary: "Success",
                    detail: "Equipment loan requested. Awaiting confirmation.",
                })
            );
            dispatch(
                setStateData({
                    key: "alert",
                    data: {
                        type: "success",
                        text: "Equipment loan requested successfully. Returning to Launch Pad.",
                        show: true,
                    },
                })
            );
            setCcaId(null);
            setEquipmentId(null);
            setDates(null);
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Operation failed";
            setError(msg);
            if (toast.current) {
                toast.current.add({ severity: "error", summary: "Error", detail: msg });
            }
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Error",
                    detail: msg,
                })
            );
            dispatch(
                setStateData({
                    key: "alert",
                    data: { type: "danger", text: msg, show: true },
                })
            );
        } finally {
            dispatch(resetStateKeyData({ key: "spinner" }));
            setLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <div className="home-container with-color">
                {auth() === null && (
                    <h4 className="launch-pad-title">Students-Hub</h4>
                )}
                <div className="w-11/12 sm:w-11/12 md:w-10/12 flex flex-col gap-4" style={{ marginTop: "10px" }}>
                    <div style={{ position: "relative" }}>
                        <Button
                            icon="pi pi-home"
                            rounded
                            size="small"
                            onClick={() => {
                                dispatch(
                                    setToastMessage({
                                        severity: "info",
                                        summary: "Returned to Launch Pad",
                                        detail: "Select an option to continue.",
                                    })
                                );
                                navigate("/");
                            }}
                            style={{
                                position: "absolute",
                                left: "-20px",
                                top: "-12px",
                                width: "40px",
                                height: "40px",
                                zIndex: 5,
                            }}
                        />
                        <Card>
                            <Toast ref={toast} />
                            <Stepper
                                ref={stepperRef}
                                className="w-full"
                                linear
                            >
                                <StepperPanel header="CCA">
                                    <div className="flex flex-col h-full">
                                        <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
                                            {_.chunk(
                                                ccas,
                                                window.innerWidth >= 640 ? 3 : 2
                                            ).map((row, rowIndex) => (
                                                <div
                                                    key={rowIndex}
                                                    className="centered-row"
                                                    style={{
                                                        "--num-columns":
                                                            window.innerWidth >= 640 ? 3 : 2,
                                                    }}
                                                >
                                                    {row.map((cca) => (
                                                        <Button
                                                            key={cca.id}
                                                            label={cca.name}
                                                            onClick={() => setCcaId(cca.id)}
                                                            className={`stretch-button ${
                                                                ccaId === cca.id
                                                                    ? "bg-blue-500 text-white"
                                                                    : "bg-blue-200 text-blue-800"
                                                            }`}
                                                            size="small"
                                                            icon={
                                                                ccaId === cca.id ? "pi pi-check" : null
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex pt-4 justify-end">
                                        <Button
                                            label="Next"
                                            icon="pi pi-arrow-right"
                                            iconPos="right"
                                            size="small"
                                            onClick={() => stepperRef.current.nextCallback()}
                                            disabled={!ccaId}
                                        />
                                    </div>
                                </StepperPanel>

                                <StepperPanel header="Equipment">
                                    <div className="flex flex-col h-full">
                                        <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
                                            {_.chunk(
                                                equipment.filter((e) => e.cca_id === ccaId),
                                                window.innerWidth >= 640 ? 3 : 2
                                            ).map((row, rowIndex) => (
                                                <div
                                                    key={rowIndex}
                                                    className="centered-row"
                                                    style={{
                                                        "--num-columns":
                                                            window.innerWidth >= 640 ? 3 : 2,
                                                    }}
                                                >
                                                    {row.map((eq) => (
                                                        <Button
                                                            key={eq.id}
                                                            label={`${eq.name} (${eq.quantity})`}
                                                            onClick={() => setEquipmentId(eq.id)}
                                                            className={`stretch-button ${
                                                                equipmentId === eq.id
                                                                    ? "bg-blue-500 text-white"
                                                                    : "bg-blue-200 text-blue-800"
                                                            }`}
                                                            size="small"
                                                            icon={
                                                                equipmentId === eq.id ? "pi pi-check" : null
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex pt-4 justify-end">
                                        <Button
                                            label="Next"
                                            icon="pi pi-arrow-right"
                                            iconPos="right"
                                            size="small"
                                            onClick={() => stepperRef.current.nextCallback()}
                                            disabled={!equipmentId}
                                        />
                                    </div>
                                </StepperPanel>

                                <StepperPanel header="Date">
                                    <div className="flex flex-col h-full">
                                        <div className="flex-grow flex justify-center items-center">
                                            <div className="relative w-full">
                                                <Calendar
                                                    value={dates}
                                                    onChange={(e) => setDates(e.value)}
                                                    selectionMode="range"
                                                    dateFormat="yy-mm-dd"
                                                    minDate={new Date()}
                                                    style={{
                                                        width: "100%",
                                                    }}
                                                    placeholder="Select date range"
                                                    inline
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex pt-4 justify-between">
                                        <Button
                                            label="Back"
                                            severity="secondary"
                                            icon="pi pi-arrow-left"
                                            size="small"
                                            onClick={() => stepperRef.current.prevCallback()}
                                        />
                                        <Button
                                            label="Submit"
                                            icon="pi pi-check"
                                            size="small"
                                            onClick={handleSubmit}
                                            disabled={!dates || loading}
                                        />
                                    </div>
                                    {error && (
                                        <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>
                                    )}
                                </StepperPanel>
                            </Stepper>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
