import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Dialog } from "primereact/dialog";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { MultiSelect } from "primereact/multiselect";
import { OverlayPanel } from "primereact/overlaypanel";
import { FileUpload } from "primereact/fileupload";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import {
    deleteRecord,
    importRecord,
    setToastMessage,
} from "../../store/global-slice";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { DateTime } from "luxon";

const CustomDataTable = ({
    title,
    type,
    identifier = "id",
    hasImport,
    onFetch = () => {},
    onAdd = () => {},
    onEdit = () => {},
    onDelete = null,
    timeFilter,
    setTimeFilter,
    rangeFilter,
    setRangeFilter,
}) => {
    const dispatch = useDispatch();
    const dt = useRef(null);
    const overlayPanelRef = useRef(null);
    const timeFilterRef = useRef(null);
    const {
        [type]: {
            data: collection = [],
            spinner,
            endPoints: dataEndPoints,
        } = {},
    } = useSelector((state) => state.global);
    const [selectedRecords, setSelectedRecords] = useState(null);
    const [deleteRecordsDialog, setDeleteRecordsDialog] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [userTimezone, setUserTimezone] = useState(null);
    const [filters, setFilters] = useState({
        student: { value: null },
        level: { value: null },
        class: { value: null },
        activity: { value: null },
    });

    useEffect(() => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setUserTimezone(timezone);
    }, []);

    useEffect(() => {
        if (
            Array.isArray(collection) &&
            collection.length > 0 &&
            collection.every(
                (item) =>
                    typeof item === "object" &&
                    item !== null &&
                    Object.keys(item).length > 0 &&
                    Object.values(item).every(
                        (value) =>
                            !Array.isArray(value) &&
                            (typeof value !== "object" || value === null)
                    )
            )
        ) {
            const allColumns = generateColumns();
            const defaultHidden = [
                "id",
                "reason",
                "email_verified_at",
                "created_at",
                "updated_at",
            ];
            const isHiddenField = (field) => {
                if (defaultHidden.includes(field)) return true;
                return field.endsWith("_id");
            };
            const initialVisible = allColumns.filter(
                (col) => !isHiddenField(col.field) && col.field !== "actions"
            );
            setVisibleColumns(initialVisible);
        }
    }, [collection]);

    const formatDateToLocal = (utcDate) => {
        if (!utcDate || !userTimezone) return "";
        const dt = DateTime.fromISO(utcDate, { zone: "utc" });
        if (!dt.isValid) {
            // console.error("Invalid date:", utcDate);
            return "";
        }
        return dt.setZone(userTimezone).toFormat("dd MMMM yyyy, HH:mm:ss z");
    };

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const handleDelete = (event, id) => {
        confirmPopup({
            target: event.currentTarget,
            message: `Do you want to delete this ${type}?`,
            icon: "pi pi-info-circle",
            acceptClassName: "p-button-danger",
            accept: () => {
                if (onDelete) {
                    onDelete(id);
                } else {
                    dispatch(
                        deleteRecord({
                            endPoint: `${dataEndPoints.delete}${id}`,
                        })
                    ).then((success) => {
                        if (success) {
                            dispatch(
                                setToastMessage({
                                    severity: "success",
                                    summary: "Success",
                                    detail: `${capitalize(type)} deleted`,
                                    life: 3000,
                                })
                            );
                            onFetch();
                        }
                    });
                }
            },
        });
    };

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
                            endPoint: `${dataEndPoints.delete}${record[identifier]}`,
                        })
                    )
                )
            ).then((results) => {
                if (results.every((success) => success)) {
                    dispatch(
                        setToastMessage({
                            severity: "success",
                            summary: "Success",
                            detail: `${selectedRecords.length} ${type} deleted`,
                            life: 3000,
                        })
                    );
                    onFetch();
                }
            });
        }
        setDeleteRecordsDialog(false);
        setSelectedRecords(null);
    };

    // start export
    const exportCSV = () => dt.current.exportCSV();

    const exportExcel = () => {
        const filteredData = formattedData.map((item) => {
            const rowData = {};
            visibleColumns.forEach((col) => {
                rowData[col.header] = item[col.field] || "";
            });
            return rowData;
        });
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${type}_data.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [visibleColumns.map((col) => col.header)],
            body: formattedData.map((item) =>
                visibleColumns.map((col) => item[col.field] || "")
            ),
            styles: { fontSize: 10 },
            margin: { top: 10 },
        });
        doc.save(`${type}_data.pdf`);
    };
    // end export

    const handleFileUpload = (event) => {
        const file = event.files[0];
        if (!file) return;

        dispatch(
            importRecord({
                type,
                endPoint: dataEndPoints.import,
                file,
                returnData: true,
            })
        )
            .then((result) => {
                if (result) onFetch();
            })
            .catch((error) => console.error("Import error:", error.message))
            .finally(() => overlayPanelRef.current.hide());
    };

    const leftToolbarTemplate = () => (
        <div className="flex flex-wrap gap-2">
            <Button
                label="Add"
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

    const rightToolbarTemplate = () => {
        const timeOptions = [
            { label: "Today", value: "today" },
            { label: "This Week", value: "week" },
            { label: "This Month", value: "month" },
            { label: "This Year", value: "year" },
            { label: "Last Year", value: "last-year" },
        ];

        return (
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
                {hasImport && (
                    <Button
                        label="Import"
                        icon="pi pi-upload"
                        severity="info"
                        onClick={(e) => overlayPanelRef.current.toggle(e)}
                    />
                )}
                {type === "checkin" && (
                    <>
                        <Button
                            label="Select"
                            icon="pi pi-calendar"
                            severity="secondary"
                            onClick={(e) => timeFilterRef.current.toggle(e)}
                        />
                        <OverlayPanel ref={timeFilterRef}>
                            <div className="flex flex-column gap-2">
                                <Dropdown
                                    value={timeFilter}
                                    options={timeOptions}
                                    onChange={(e) => {
                                        setTimeFilter(e.value);
                                        setRangeFilter(null);
                                        onFetch({ timeFilter: e.value });
                                    }}
                                    placeholder="Select Time Period"
                                    style={{ width: "200px" }}
                                    showClear
                                />
                                <Calendar
                                    value={rangeFilter}
                                    onChange={(e) => {
                                        setRangeFilter(e.value);
                                        setTimeFilter(null);
                                        onFetch({ rangeFilter: e.value });
                                    }}
                                    selectionMode="range"
                                    dateFormat="yy-mm-dd"
                                    placeholder="Select Date Range"
                                    style={{ width: "200px" }}
                                />
                            </div>
                        </OverlayPanel>
                    </>
                )}
            </div>
        );
    };

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
                style={{ marginLeft: "0.5rem" }}
                severity="danger"
                onClick={(event) => handleDelete(event, rowData[identifier])}
            />
        </>
    );

    const formattedData = Array.isArray(collection)
        ? collection.map((item) => ({
              ...item,
              checkin_time: item.checkin_time
                  ? formatDateToLocal(item.checkin_time)
                  : "",
              checkout_time: item.checkout_time
                  ? formatDateToLocal(item.checkout_time)
                  : "",
          }))
        : [];

    const generateColumns = () => {
        if (!collection.length) return [];

        const firstItem = collection[0];
        const properties = Object.keys(firstItem);

        const dynamicColumns = properties.map((prop) => {
            const column = {
                field: prop,
                header: prop
                    .split("_")
                    .map((word) => capitalize(word))
                    .join(" "),
                sortable: true,
            };

            if (type === "checkin") {
                if (prop === "student") {
                    column.filter = true;
                } else if (prop === "level") {
                    column.filter = true;
                } else if (prop === "class") {
                    column.filter = true;
                } else if (prop === "activity") {
                    column.filter = true;
                }
            }

            return column;
        });

        return [
            ...dynamicColumns,
            {
                field: "actions",
                header: "Actions",
                body: actionsTemplate,
                exportable: false,
                headerStyle: { minWidth: "10rem" },
            },
        ];
    };

    const indexTemplate = (rowData, column) => column.rowIndex + 1;

    const onColumnToggle = (event) => {
        const selectedColumns = event.value;
        const allColumns = generateColumns().filter(
            (col) => col.field !== "actions"
        );
        const orderedSelectedColumns = allColumns.filter((col) =>
            selectedColumns.some((sCol) => sCol.field === col.field)
        );
        setVisibleColumns(orderedSelectedColumns);
    };

    const deleteRecordsDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                severity="secondary"
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

    const header = (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
            <h4 className="m-0">Manage {title}</h4>
            <div className="flex items-center gap-4">
                <MultiSelect
                    value={visibleColumns}
                    options={generateColumns().filter(
                        (col) => col.field !== "actions"
                    )}
                    optionLabel="header"
                    onChange={onColumnToggle}
                    className="w-full sm:w-20rem"
                    display="chip"
                    placeholder="Select Columns"
                />
                <IconField className="flex items-center w-64">
                    <InputIcon className="pi pi-search" />
                    <InputText
                        type="search"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search..."
                        className="w-full"
                    />
                </IconField>
            </div>
        </div>
    );

    return (
        <div className="card">
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
                filters={type === "checkin" ? filters : null}
                filterDisplay={type === "checkin" ? "row" : undefined}
                paginator
                rows={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
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
                <Column
                    header="#"
                    body={indexTemplate}
                    style={{ width: "3rem" }}
                    exportable={false}
                />
                {visibleColumns.map((col) => (
                    <Column
                        key={col.field}
                        field={col.field}
                        header={col.header}
                        sortable={col.sortable}
                        body={col.body}
                        exportable={col.exportable !== false}
                        headerStyle={col.headerStyle}
                        filter={col.filter}
                        filterElement={col.filterElement}
                    />
                ))}
                <Column
                    field="actions"
                    header="Actions"
                    body={actionsTemplate}
                    exportable={false}
                    headerStyle={{ minWidth: "10rem" }}
                />
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
                    <span>
                        Are you sure you want to delete the selected {type}?
                    </span>
                </div>
            </Dialog>
            <OverlayPanel
                ref={overlayPanelRef}
                showCloseIcon
                style={{ width: "600px" }}
            >
                <FileUpload
                    name="file"
                    accept=".csv, .xlsx"
                    maxFileSize={10000000}
                    emptyTemplate={
                        <p className="m-0">
                            Drag and drop files (csv/excel) here to upload (Max
                            10Mb).
                        </p>
                    }
                    customUpload
                    uploadHandler={handleFileUpload}
                />
            </OverlayPanel>
        </div>
    );
};

CustomDataTable.propTypes = {
    title: PropTypes.string,
    type: PropTypes.string.isRequired,
    identifier: PropTypes.string,
    hasImport: PropTypes.bool,
    onFetch: PropTypes.func,
    onAdd: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    timeFilter: PropTypes.string,
    setTimeFilter: PropTypes.func,
    rangeFilter: PropTypes.array,
    setRangeFilter: PropTypes.func,
};

export default CustomDataTable;
