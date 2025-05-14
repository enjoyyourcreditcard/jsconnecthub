import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { SplitButton } from "primereact/splitbutton";
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
    onConfirm = () => {},
    onCancel = () => {},
    onDelete = null,
    onAddQuestion = () => {},
    onEditQuestion = () => {},
    onDeleteQuestion = () => {},
    timeFilter,
    setTimeFilter,
    rangeFilter,
    setRangeFilter,
    questions = [],
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
        facility: { value: null },
        support_strategies: { value: null },
        ...(type === "bookings" && { status: { value: null } }),
    });
    const [filteredDataState, setFilteredDataState] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);
    const [questionExpandedRows, setQuestionExpandedRows] = useState([]);

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

    const capitalize = (str) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const handleDelete = (event, id) => {
        confirmPopup({
            target: event.currentTarget,
            message: `Do you want to delete this ${
                type === "support_strategies" ? "support strategy" : type
            }?`,
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

    const handleQuestionDelete = (event, id) => {
        confirmPopup({
            target: event.currentTarget,
            message: `Do you want to delete this question?`,
            icon: "pi pi-info-circle",
            acceptClassName: "p-button-danger",
            accept: () => {
                onDeleteQuestion(id);
            },
        });
    };

    const handleConfirm = (event, id) => {
        confirmPopup({
            target: event.currentTarget,
            message: `Do you want to confirm this booking?`,
            icon: "pi pi-info-circle",
            acceptClassName: "p-button-success",
            accept: () => {
                onConfirm(id);
            },
        });
    };

    const handleCancel = (event, id) => {
        confirmPopup({
            target: event.currentTarget,
            message: `Do you want to cancel this booking?`,
            icon: "pi pi-info-circle",
            acceptClassName: "p-button-danger",
            accept: () => {
                onCancel(id);
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
                                `- ${a.question.text} Answer: ${
                                    a.question.type === "radio"
                                        ? a.radio_option?.text || "N/A"
                                        : a.text || "N/A"
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
                {(type === "checkin" ||
                    type === "bookings" ||
                    type === "counsels") && (
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

        const actions = [
            {
                label: "Edit",
                icon: "pi pi-pencil",
                command: (event) => onEdit(rowData[identifier]),
            },
            {
                label: "Delete",
                icon: "pi pi-trash",
                command: (event) =>
                    handleDelete(event.originalEvent, rowData[identifier]),
            },
            ...(type === "support_strategies"
                ? [
                      {
                          label: "Add Question",
                          icon: "pi pi-plus",
                          command: () => onAddQuestion(rowData[identifier]),
                      },
                  ]
                : []),
        ];

        if (type === "bookings") {
            if (rowData.status === "requested") {
                actions.push({
                    label: "Confirm",
                    icon: "pi pi-check",
                    command: (event) =>
                        handleConfirm(event.originalEvent, rowData[identifier]),
                });
            }
            if (
                rowData.status === "requested" ||
                rowData.status === "reserved"
            ) {
                actions.push({
                    label: "Cancel",
                    icon: "pi pi-times",
                    command: (event) =>
                        handleCancel(event.originalEvent, rowData[identifier]),
                });
            }
        }

        return (
            <SplitButton
                label=""
                icon="pi pi-cog"
                model={actions}
                className="p-button-text"
            />
        );
    };

    const questionActionsTemplate = (rowData) => {
        return (
            <SplitButton
                label=""
                icon="pi pi-cog"
                model={[
                    {
                        label: "Edit",
                        icon: "pi pi-pencil",
                        command: () => onEditQuestion(rowData.id),
                    },
                    {
                        label: "Delete",
                        icon: "pi pi-trash",
                        command: (event) =>
                            handleQuestionDelete(
                                event.originalEvent,
                                rowData.id
                            ),
                    },
                ]}
                className="p-button-text"
            />
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
              start_time: item.start_time
                  ? formatDateToLocal(item.start_time)
                  : "",
              end_time: item.end_time ? formatDateToLocal(item.end_time) : "",
              created_at: item.created_at
                  ? formatDateToLocal(item.created_at)
                  : "",
              updated_at: item.updated_at
                  ? formatDateToLocal(item.updated_at)
                  : "",
          }))
        : [];

    const questionRowExpansionTemplate = (question) => {
        if (question.type !== "radio") return null;

        const radioOptions = Array.isArray(question.radio_options)
            ? question.radio_options
            : [];

        return (
            <div className="p-3">
                <DataTable
                    value={radioOptions.map((opt, index) => ({
                        id: index,
                        text: opt,
                    }))}
                    dataKey="id"
                    tableStyle={{ minWidth: "30rem" }}
                    emptyMessage="No radio options found."
                >
                    <Column
                        field="text"
                        header="Radio Option"
                        sortable
                        style={{ width: "100%" }}
                    />
                </DataTable>
            </div>
        );
    };

    const rowExpansionTemplate = (data) => {
        if (type !== "support_strategies" && type !== "counsels") return null;

        if (type === "counsels") {
            const strategyIds = [
                ...new Set(
                    data.answers.map((a) => a.question.support_strategy_id)
                ),
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
                            <div key={strategyId}>
                                <h5 className="mb-4">
                                    Section: {strategyName}
                                </h5>
                                <ul>
                                    {strategyAnswers.map((answer) => {
                                        const isRadio =
                                            answer.question.type === "radio";
                                        const displayAnswer = isRadio
                                            ? answer.radio_option?.text || "N/A"
                                            : answer.text || "N/A";
                                        return (
                                            <li
                                                key={answer.id}
                                                className="mb-2"
                                            >
                                                <strong>
                                                    {answer.question.text}
                                                </strong>
                                                <br />
                                                Answer: {displayAnswer}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            );
        }
        if (type === "support_strategies") {
            const strategyQuestions = Array.isArray(questions)
                ? questions.filter((q) => q.support_strategy_id === data.id)
                : [];

            return (
                <div className="p-3">
                    <DataTable
                        value={strategyQuestions}
                        dataKey="id"
                        tableStyle={{ minWidth: "50rem" }}
                        emptyMessage="No questions found."
                        expandedRows={questionExpandedRows}
                        onRowToggle={(e) => setQuestionExpandedRows(e.data)}
                        rowExpansionTemplate={questionRowExpansionTemplate}
                    >
                        <Column
                            expander
                            style={{ width: "3rem" }}
                            exportable={false}
                        />
                        <Column
                            field="order"
                            header="Order"
                            sortable
                            style={{ width: "10%" }}
                        />
                        <Column
                            field="text"
                            header="Question Text"
                            sortable
                            style={{ width: "50%" }}
                        />
                        <Column
                            field="type"
                            header="Type"
                            sortable
                            style={{ width: "20%" }}
                            body={(rowData) => capitalize(rowData.type)}
                        />
                        <Column
                            header="Actions"
                            body={questionActionsTemplate}
                            style={{ width: "20%" }}
                        />
                    </DataTable>
                </div>
            );
        }
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
            } else if (type === "bookings") {
                if (prop === "student") {
                    column.filter = true;
                } else if (prop === "level") {
                    column.filter = true;
                } else if (prop === "class") {
                    column.filter = true;
                } else if (prop === "facility") {
                    column.filter = true;
                } else if (prop === "status") {
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
                          headerStyle: { minWidth: "8rem" },
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
                emptyMessage={`No ${
                    type === "support_strategies" ? "support strategy" : type
                } found.`}
                header={header}
                onValueChange={(filteredData) =>
                    setFilteredDataState(filteredData)
                }
                expandedRows={
                    type === "support_strategies" || type === "counsels"
                        ? expandedRows
                        : null
                }
                onRowToggle={
                    type === "support_strategies" || type === "counsels"
                        ? (e) => setExpandedRows(e.data)
                        : undefined
                }
                rowExpansionTemplate={rowExpansionTemplate}
            >
                {(type === "support_strategies" || type === "counsels") && (
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
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    onDelete: PropTypes.func,
    onAddQuestion: PropTypes.func,
    onEditQuestion: PropTypes.func,
    onDeleteQuestion: PropTypes.func,
    timeFilter: PropTypes.string,
    setTimeFilter: PropTypes.func,
    rangeFilter: PropTypes.array,
    setRangeFilter: PropTypes.func,
    questions: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            support_strategy_id: PropTypes.number,
            order: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            text: PropTypes.string,
            type: PropTypes.string,
            radio_options: PropTypes.arrayOf(PropTypes.string),
        })
    ),
};

export default CustomDataTable;
