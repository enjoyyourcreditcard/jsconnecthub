import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    setToastMessage,
    setStateData,
} from "../store/global-slice";
import Header from "../shared/layout/Header";
import DataTable from "../shared/misc/DataTable";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

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
    const [loadingEquipment, setLoadingEquipment] = useState(true);
    const [error, setError] = useState("");
    const {
        ccas: { data: ccas = [], endPoints: ccaEndPoints },
        equipment: { data: equipment = [], endPoints: equipmentEndPoints },
    } = useSelector((state) => state.global);

    const myFetch = () => {
        dispatch(
            getRecords({
                type: "ccas",
                endPoint: ccaEndPoints.collection,
                key: "data",
            })
        )
            .then((d) => {
                if (d) {
                    const formattedCcas = d.map((i) => ({
                        id: i.id,
                        name: i.name,
                    }));
                    dispatch(
                        setStateData({
                            type: "ccas",
                            data: formattedCcas,
                            key: "data",
                            isMerge: false,
                        })
                    );
                }
            })
            .then(() => {
                return dispatch(
                    getRecords({
                        type: "equipment",
                        endPoint: equipmentEndPoints.collection,
                        key: "data",
                    })
                );
            })
            .then((d) => {
                if (d) {
                    const formattedEquipment = d
                        .filter((i) => i.cca_id)
                        .map((i) => ({
                            id: i.id,
                            name: i.name,
                            parent_id: i.cca_id,
                        }));
                    dispatch(
                        setStateData({
                            type: "equipment",
                            data: formattedEquipment,
                            key: "data",
                            isMerge: false,
                        })
                    );
                }
            })
            .catch((error) => {
                console.error("Fetch error:", error.message);
            })
            .finally(() => setLoadingEquipment(false));
    };

    useEffect(() => {
        myFetch();
    }, [dispatch]);

    const handleEdit = (id) => {
        const eq = equipment.find((e) => e.id === id);
        if (eq) {
            setFormData({
                name: eq.name,
                cca_id: eq.parent_id || null,
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

    const handleDeleteEquipment = (id) => {
        dispatch(
            deleteRecord({
                endPoint: `${equipmentEndPoints.delete}${id}`,
            })
        ).then((result) => {
            if (result?.success || result === true) {
                dispatch(
                    setToastMessage({
                        severity: "success",
                        summary: "Success",
                        detail: result?.message || "Equipment deleted",
                        life: 3000,
                    })
                );
                myFetch();
            }
        });
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
                        type: "equipment",
                        endPoint: equipmentEndPoints.store,
                        data: formData,
                    })
                ).then((success) => {
                    if (success) {
                        setFormData({ name: "", cca_id: null });
                        myFetch();
                        setVisible(false);
                        setLoading(false);
                    }
                });
            } else {
                dispatch(
                    updateRecord({
                        type: "equipment",
                        endPoint: `${equipmentEndPoints.update}${editId}`,
                        data: formData,
                    })
                ).then((success) => {
                    if (success) {
                        setFormData({ name: "", cca_id: null });
                        myFetch();
                        setVisible(false);
                        setLoading(false);
                    }
                });
            }
        } catch (err) {
            setError(err.message || "Operation failed");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const ccaOptions =
        ccas.length > 0
            ? ccas.map((c) => ({
                  label: c.name,
                  value: c.id,
              }))
            : [];

    const isDataReady = !loadingEquipment;

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
                                type="ccas"
                                identifier="id"
                                hasExpand={true}
                                hasImport={true}
                                onFetch={myFetch}
                                onAdd={handleAdd}
                                onEdit={handleEdit}
                                onEditSubFacility={handleEditSubEquipment}
                                onDeleteSubFacility={handleDeleteEquipment}
                                title="Equipment"
                                subFacilities={equipment}
                                collection={ccas}
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
                                                name="cca_id"
                                                value={formData.cca_id}
                                                options={ccaOptions}
                                                onChange={handleChange}
                                                style={{ width: "100%" }}
                                                placeholder="Select CCA"
                                                disabled={loading}
                                                tooltip="Select CCA"
                                                tooltipOptions={{
                                                    position: "bottom",
                                                    mouseTrack: true,
                                                    mouseTrackTop: 15,
                                                }}
                                                required
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
                                                tooltip="Enter equipment name"
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
                        <p>Please wait.</p>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default ManageEquipment;
