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
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

function ManageFacility() {
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState("create");
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        parent_id: null,
    });
    const [loading, setLoading] = useState(false);
    const [loadingFacilities, setLoadingFacilities] = useState(true);
    const [error, setError] = useState("");
    const {
        facilities: { data: facilities = [], endPoints: facilityEndPoints },
        sub_facilities: { data: subFacilities = [] },
    } = useSelector((state) => state.global);

    const myFetch = () => {
        dispatch(
            getRecords({
                type: "facilities",
                endPoint: facilityEndPoints.collection,
                key: "data",
            })
        )
            .then((d) => {
                if (d) {
                    const formattedFacilities = d
                        .filter((i) => !i.parent_id)
                        .map((i) => ({
                            id: i.id,
                            name: i.name,
                        }));
                    dispatch(
                        setStateData({
                            type: "facilities",
                            data: formattedFacilities,
                            key: "data",
                            isMerge: false,
                        })
                    );
                    const formattedSubFacilities = d
                        .filter((i) => i.parent_id)
                        .map((i) => ({
                            id: i.id,
                            name: i.name,
                            parent_id: i.parent_id,
                        }));
                    dispatch(
                        setStateData({
                            type: "sub_facilities",
                            data: formattedSubFacilities,
                            key: "data",
                            isMerge: false,
                        })
                    );
                }
            })
            .catch((error) => {
                console.error("Fetch error:", error.message);
            })
            .finally(() => setLoadingFacilities(false));
    };

    useEffect(() => {
        myFetch();
    }, [dispatch]);

    const handleEdit = (id) => {
        const facility = [...facilities, ...subFacilities].find(
            (u) => u.id === id
        );
        if (facility) {
            setFormData({
                name: facility.name,
                parent_id: facility.parent_id || null,
            });
            setEditId(id);
            setMode("edit");
            setVisible(true);
        }
    };

    const handleAdd = () => {
        setMode("create");
        setFormData({ name: "", parent_id: null });
        setVisible(true);
    };

    const handleEditSubFacility = (id) => {
        handleEdit(id);
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
                        type: "facilities",
                        endPoint: facilityEndPoints.store,
                        data: formData,
                    })
                ).then((success) => {
                    if (success) {
                        setFormData({ name: "", parent_id: null });
                        myFetch();
                        setVisible(false);
                        setLoading(false);
                    }
                });
            } else {
                dispatch(
                    updateRecord({
                        type: "facilities",
                        endPoint: `${facilityEndPoints.update}${editId}`,
                        data: formData,
                    })
                ).then((success) => {
                    if (success) {
                        setFormData({ name: "", parent_id: null });
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

    const parentFacilityOptions =
        facilities.length > 0
            ? facilities
                  .filter((f) => !f.parent_id)
                  .map((f) => ({
                      label: f.name,
                      value: f.id,
                  }))
            : [];

    const isDataReady = !loadingFacilities;

    return (
        <div>
            <Header />
            <main style={{ padding: "20px" }}>
                <Card>
                    {isDataReady ? (
                        <>
                            <DataTable
                                type="facilities"
                                identifier="id"
                                hasExpand={true}
                                onFetch={myFetch}
                                onAdd={handleAdd}
                                onEdit={handleEdit}
                                onEditSubFacility={handleEditSubFacility}
                                title="Facility"
                                subFacilities={subFacilities}
                            />
                            <Dialog
                                header={
                                    mode === "create"
                                        ? "Add Facility"
                                        : "Edit Facility"
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
                                                tooltip="Enter facility name"
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
                                            <Dropdown
                                                name="parent_id"
                                                value={formData.parent_id}
                                                options={parentFacilityOptions}
                                                onChange={handleChange}
                                                style={{ width: "100%" }}
                                                placeholder="Select Parent Facility"
                                                disabled={loading}
                                                tooltip="Select parent facility (optional)"
                                                tooltipOptions={{
                                                    position: "bottom",
                                                    mouseTrack: true,
                                                    mouseTrackTop: 15,
                                                }}
                                                showClear
                                            />
                                            <label htmlFor="parent_id">
                                                Parent Facility
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

export default ManageFacility;
