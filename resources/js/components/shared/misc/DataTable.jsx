import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { getRecords, deleteRecord } from "../../store/global-slice";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const CustomDataTable = ({
    title,
    type,
    identifier = "id",
    onEdit = () => {},
    onDelete = null,
    onAdd = () => {},
    endpoint = "",
}) => {
    const dispatch = useDispatch();
    const toast = useRef(null);
    const dt = useRef(null);
    const { [type]: { data: collection = [], spinner } = {} } = useSelector(
        (state) => state.global
    );
    const [selectedRecords, setSelectedRecords] = useState(null);
    const [deleteRecordsDialog, setDeleteRecordsDialog] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");

    useEffect(() => {
        dispatch(
            getRecords({
                type,
                endPoint: endpoint || `/api/${type}`,
                key: "data",
            })
        );
    }, [dispatch, type, endpoint]);

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // Single delete with confirmation popup
    const handleDelete = (event, id) => {
        confirmPopup({
            target: event.currentTarget,
            message: `Do you want to delete this ${type} (ID: ${id})?`,
            icon: "pi pi-info-circle",
            acceptClassName: "p-button-danger",
            accept: () => {
                if (onDelete) {
                    onDelete(id);
                } else {
                    dispatch(
                        deleteRecord({ endPoint: `/api/${type}/${id}` })
                    ).then((success) => {
                        if (success) {
                            toast.current.show({
                                severity: "success",
                                summary: "Success",
                                detail: `${capitalize(type)} deleted`,
                                life: 3000,
                            });
                            dispatch(
                                getRecords({
                                    type,
                                    endPoint: endpoint || `/api/${type}`,
                                    key: "data",
                                })
                            );
                        }
                    });
                }
            },
        });
    };

    // Multiple delete confirmation
    const confirmDeleteSelected = () => {
        if (selectedRecords && selectedRecords.length > 0) {
            setDeleteRecordsDialog(true);
        }
    };

    const deleteSelectedRecords = () => {
        if (onDelete) {
            selectedRecords.forEach((record) => onDelete(record[identifier]));
        } else {
            Promise.all(
                selectedRecords.map((record) =>
                    dispatch(
                        deleteRecord({
                            endPoint: `/api/${type}/${record[identifier]}`,
                        })
                    )
                )
            ).then((results) => {
                if (results.every((success) => success)) {
                    toast.current.show({
                        severity: "success",
                        summary: "Success",
                        detail: `${selectedRecords.length} ${type} deleted`,
                        life: 3000,
                    });
                    dispatch(
                        getRecords({
                            type,
                            endPoint: endpoint || `/api/${type}`,
                            key: "data",
                        })
                    );
                }
            });
        }
        setDeleteRecordsDialog(false);
        setSelectedRecords(null);
    };

    // Export functions
    const exportCSV = () => dt.current.exportCSV();
    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(collection);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${type}_data.xlsx`);
    };
    const exportPDF = () => {
        const doc = new jsPDF();
        const columns = generateColumns()
            .filter((col) => col.field !== "actions")
            .map((col) => ({ title: col.header, dataKey: col.field }));
        const data = collection.map((item) =>
            columns.reduce((obj, col) => {
                obj[col.dataKey] = item[col.dataKey] || "";
                return obj;
            }, {})
        );
        doc.autoTable({
            head: [columns.map((col) => col.title)],
            body: data.map((row) => columns.map((col) => row[col.dataKey])),
        });
        doc.save(`${type}_data.pdf`);
    };

    // Toolbar templates
    const leftToolbarTemplate = () => (
        <div className="flex flex-wrap gap-2">
            <Button
                label={`Add`}
                icon="pi pi-plus"
                severity="success"
                onClick={onAdd}
            />
            <Button
                label="Delete"
                icon="pi pi-trash"
                severity="danger"
                onClick={confirmDeleteSelected}
                disabled={!selectedRecords || !selectedRecords.length}
            />
        </div>
    );

    const rightToolbarTemplate = () => (
        <div className="flex flex-wrap gap-2">
            <Button label="CSV" icon="pi pi-file" onClick={exportCSV} />
            <Button
                label="Excel"
                icon="pi pi-file-excel"
                severity="success"
                onClick={exportExcel}
            />
            <Button
                label="PDF"
                icon="pi pi-file-pdf"
                severity="warning"
                onClick={exportPDF}
            />
        </div>
    );

    // Actions column template
    const actionsTemplate = (rowData) => (
        <>
            <Button
                icon="pi pi-pencil"
                rounded
                outlined
                onClick={() => onEdit(rowData[identifier])}
            />
            <Button
                icon="pi pi-trash"
                rounded
                outlined
                className="ml-2"
                severity="danger"
                onClick={(event) => handleDelete(event, rowData[identifier])}
            />
        </>
    );

    // Format data for display
    const formattedData = Array.isArray(collection)
        ? collection.map((item) => ({
              ...item,
              date: item.date
                  ? new Date(item.date).toLocaleDateString("en-US")
                  : "",
          }))
        : [];

    // Generate columns dynamically
    const generateColumns = () => {
        if (!collection.length) return [];

        const firstItem = collection[0];
        const properties = Object.keys(firstItem);

        const dynamicColumns = properties.map((prop) => ({
            field: prop,
            header: prop.charAt(0).toUpperCase() + prop.slice(1),
            sortable: true,
        }));

        return [
            ...dynamicColumns,
            {
                field: "actions",
                body: actionsTemplate,
                exportable: false,
                headerStyle: { minWidth: "12rem"}
            },
        ];
    };

    const columns = generateColumns();

    // Multiple delete dialog footer
    const deleteRecordsDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                outlined
                onClick={() => setDeleteRecordsDialog(false)}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                severity="danger"
                onClick={deleteSelectedRecords}
            />
        </>
    );

    // Spinner for loading state
    if (spinner?.show) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px",
                }}
            >
                <ProgressSpinner />
                <span style={{ marginTop: "10px" }}>{spinner.text}</span>
            </div>
        );
    }

    // Dynamic header with search
    const header = (
        <div className="flex items-center justify-between w-full">
            <h4 className="m-0">Manage {title}</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText
                    type="search"
                    style={{ paddingLeft: "35px" }}
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search..."
                />
            </IconField>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmPopup />
            <Toolbar
                className="mb-6"
                left={leftToolbarTemplate}
                right={rightToolbarTemplate}
            />
            <DataTable
                ref={dt}
                value={formattedData}
                selection={selectedRecords}
                onSelectionChange={(e) => setSelectedRecords(e.value)}
                globalFilter={globalFilter}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 20, 100]}
                tableStyle={{ minWidth: "50rem" }}
                dataKey={identifier}
                stripedRows
                emptyMessage={`No ${type} found.`}
                header={header}
            >
                <Column
                    selectionMode="multiple"
                    headerStyle={{ width: "3rem" }}
                    exportable={false}
                />
                {columns.map((col) => (
                    <Column
                        key={col.field}
                        field={col.field}
                        header={col.header}
                        sortable={col.sortable}
                        body={col.body}
                        exportable={col.exportable !== false}
                        headerStyle={col.headerStyle}
                    />
                ))}
            </DataTable>
            <Dialog
                visible={deleteRecordsDialog}
                style={{ width: "32rem" }}
                header="Confirm"
                modal
                footer={deleteRecordsDialogFooter}
                onHide={() => setDeleteRecordsDialog(false)}
            >
                <div className="confirmation-content">
                    <i
                        className="pi pi-exclamation-triangle mr-3"
                        style={{ fontSize: "2rem" }}
                    />
                    <span>
                        Are you sure you want to delete the selected {type}?
                    </span>
                </div>
            </Dialog>
        </div>
    );
};

CustomDataTable.propTypes = {
    type: PropTypes.string.isRequired,
    identifier: PropTypes.string,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onAdd: PropTypes.func,
    endpoint: PropTypes.string,
};

export default CustomDataTable;
