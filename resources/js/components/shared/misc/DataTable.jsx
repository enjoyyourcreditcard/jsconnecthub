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
        support_strategies: { data: supportStrategies = [] } = {},
    } = useSelector((state) => state.global);
    const [selectedRecords, setSelectedRecords] = useState(null);
    const [deleteRecordsDialog, setDeleteRecordsDialog] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [userTimezone, setUserTimezone] = useState(null);
    const [filters] = useState({
        student: { value: null },
        level: { value: null },
        class: { value: null },
        activity: { value: null },
        support_strategies: { value: null },
    });
    const [filteredDataState, setFilteredDataState] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);

    useEffect(() => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setUserTimezone(timezone);
    }, []);

    useEffect(() => {
        setFilteredDataState(formattedData);
    }, [collection]);

    useEffect(() => {
        if (
            Array.isArray(collection) &&
            collection.length > 0 &&
            collection.every(
                (item) =>
                    typeof item === "object" &&
                    item !== null &&
                    Object.keys(item).length > 0 &&
                    (type === "counsels"
                        ? Object.values(item).every(
                              (value) =>
                                  !Array.isArray(value) ||
                                  value === null ||
                                  value === item.answers
                          )
                        : Object.values(item).every(
                              (value) =>
                                  !Array.isArray(value) &&
                                  (typeof value !== "object" || value === null)
                          ))
            )
        ) {
            const allColumns = generateColumns();
            const defaultHidden = [
                "id",
                "reason",
                "email_verified_at",
                "created_at",
                "updated_at",
                "answers",
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

    const formatAnswersForExport = (item) => {
        if (type !== "counsels" || !item.answers) return "";
        const strategyIds = [
            ...new Set(item.answers.map((a) => a.question.support_strategy_id)),
        ];
        return strategyIds
            .map((strategyId) => {
                const strategy = supportStrategies.find(
                    (s) => s.id === strategyId
                );
                const strategyName = strategy
                    ? strategy.name
                    : `Strategy ${strategyId}`;
                const strategyAnswers = item.answers.filter(
                    (a) => a.question.support_strategy_id === strategyId
                );
                return (
                    `Section: ${strategyName}\n` +
                    strategyAnswers
                        .map(
                            (a) =>
                                `- Question: ${a.question.text} Answer: ${
                                    a.text || "N/A"
                                }`
                        )
                        .join("\n")
                );
            })
            .join("\n\n");
    };

    const exportExcel = () => {
        const dataToExport = filteredDataState.map((item) => {
            const rowData = {};
            visibleColumns.forEach((col) => {
                rowData[col.header] = item[col.field] || "";
            });
            if (type === "counsels") {
                rowData["Questions and Answers"] = formatAnswersForExport(item);
            }
            return rowData;
        });
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${type}_data.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const columns = [
            ...visibleColumns.map((col) => col.header),
            ...(type === "counsels" ? ["Questions and Answers"] : []),
        ];
        const body = filteredDataState.map((item) => [
            ...visibleColumns.map((col) => item[col.field] || ""),
            ...(type === "counsels" ? [formatAnswersForExport(item)] : []),
        ]);
        autoTable(doc, {
            head: [columns],
            body,
            styles: { fontSize: 10 },
            margin: { top: 10 },
            columnStyles:
                type === "counsels"
                    ? { [columns.length - 1]: { cellWidth: 100 } }
                    : {},
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

    const leftToolbarTemplate = () => {
        if (type === "counsels") return null;
        return (
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
    };

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
                {(type === "checkin" || type === "counsels") && (
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
                                        if (
                                            e.value &&
                                            e.value[0] &&
                                            e.value[1]
                                        ) {
                                            onFetch({ rangeFilter: e.value });
                                        }
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

    const actionsTemplate = (rowData) => {
        if (type === "counsels") return null;
        return (
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
                    onClick={(event) =>
                        handleDelete(event, rowData[identifier])
                    }
                />
            </>
        );
    };

    const formattedData = Array.isArray(collection)
        ? collection.map((item) => ({
              ...item,
              checkin_time: item.checkin_time
                  ? formatDateToLocal(item.checkin_time)
                  : "",
              checkout_time: item.checkout_time
                  ? formatDateToLocal(item.checkout_time)
                  : "",
              created_at: item.created_at
                  ? formatDateToLocal(item.created_at)
                  : "",
              updated_at: item.updated_at
                  ? formatDateToLocal(item.updated_at)
                  : "",
          }))
        : [];

    const rowExpansionTemplate = (data) => {
        if (type !== "counsels") return null;
        const strategyIds = [
            ...new Set(data.answers.map((a) => a.question.support_strategy_id)),
        ];

        return (
            <div className="p-3">
                {strategyIds.map((strategyId) => {
                    const strategy = supportStrategies.find(
                        (s) => s.id === strategyId
                    );
                    const strategyName = strategy
                        ? strategy.name
                        : `Strategy ${strategyId}`;
                    const strategyAnswers = data.answers.filter(
                        (a) => a.question.support_strategy_id === strategyId
                    );

                    return (
                        <div key={strategyId} className="mb-4">
                            <h5>Section: {strategyName}</h5>
                            <ul>
                                {strategyAnswers.map((answer) => (
                                    <li key={answer.id}>
                                        <strong>Question:</strong>{" "}
                                        {answer.question.text}
                                        <br />
                                        <strong>Answer:</strong>{" "}
                                        {answer.text || "N/A"}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        );
    };

    const generateColumns = () => {
        if (!collection.length) return [];

        const firstItem = collection[0];
        const properties = Object.keys(firstItem).filter(
            (prop) => prop !== "answers"
        );

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
            } else if (type === "counsels") {
                if (prop === "student") {
                    column.filter = true;
                } else if (prop === "support_strategies") {
                    column.filter = true;
                }
            }

            return column;
        });

        return [
            ...dynamicColumns,
            ...(type !== "counsels"
                ? [
                      {
                          field: "actions",
                          header: "Actions",
                          body: actionsTemplate,
                          exportable: false,
                          headerStyle: { minWidth: "10rem" },
                      },
                  ]
                : []),
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
        <div>
            <ConfirmPopup />
            <Toolbar
                className="mb-4"
                left={leftToolbarTemplate}
                right={rightToolbarTemplate}
            />
            <DataTable
                ref={dt}
                value={formattedData}
                selection={type !== "counsels" ? selectedRecords : null}
                onSelectionChange={
                    type !== "counsels"
                        ? (e) => setSelectedRecords(e.value)
                        : undefined
                }
                globalFilter={globalFilter}
                filters={filters}
                filterDisplay="row"
                paginator
                rows={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                tableStyle={{ minWidth: "50rem" }}
                dataKey={identifier}
                stripedRows
                scrollable
                scrollHeight="720px"
                emptyMessage={`No ${type} found.`}
                header={header}
                onValueChange={(filteredData) =>
                    setFilteredDataState(filteredData)
                }
                expandedRows={type === "counsels" ? expandedRows : null}
                onRowToggle={
                    type === "counsels"
                        ? (e) => setExpandedRows(e.data)
                        : undefined
                }
                rowExpansionTemplate={
                    type === "counsels" ? rowExpansionTemplate : undefined
                }
            >
                {type === "counsels" && (
                    <Column
                        expander
                        style={{ width: "3rem" }}
                        exportable={false}
                    />
                )}
                {type !== "counsels" && (
                    <Column
                        selectionMode="multiple"
                        headerStyle={{ width: "3rem" }}
                        exportable={false}
                    />
                )}
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
                {type !== "counsels" && (
                    <Column
                        field="actions"
                        header="Actions"
                        body={actionsTemplate}
                        exportable={false}
                        headerStyle={{ minWidth: "10rem" }}
                    />
                )}
            </DataTable>
            {type !== "counsels" && (
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
            )}
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
