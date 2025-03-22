import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { getRecords, deleteRecord } from "../../store/global-slice";
import PropTypes from "prop-types";

const Table = ({
    type,
    identifier = "id",
    onEdit = () => {},
    onDelete = () => {},
    endpoint = "",
}) => {
    const dispatch = useDispatch();
    const { [type]: { data: collection = [] } = {} } = useSelector(
        (state) => state.global
    );

    useEffect(() => {
        dispatch(
            getRecords({
                type,
                endPoint: endpoint || `/api/${type}`,
                key: "data",
            })
        );
    }, [dispatch, type, endpoint]);

    const handleDelete = (event, id) => {
        confirmPopup({
            target: event.currentTarget,
            message: "Do you want to delete this record?",
            icon: "pi pi-info-circle",
            acceptClassName: "p-button-danger",
            accept: () => {
                if (onDelete()) {
                    onDelete(id);
                } else {
                    dispatch(
                        deleteRecord({ endPoint: `/api/${type}/${id}` })
                    ).then((success) => {
                        if (success) {
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

    const actionsTemplate = (rowData) => (
        <>
            <ConfirmPopup />
            <Button
                icon="pi pi-pencil"
                className="p-button-sm p-button-text"
                onClick={() => onEdit(rowData[identifier])}
            />
            <Button
                icon="pi pi-trash"
                className="p-button-sm p-button-danger p-button-text"
                onClick={(event) => handleDelete(event, rowData[identifier])}
            />
        </>
    );

    const formattedData = Array.isArray(collection)
        ? collection?.map((item) => ({
              ...item,
              date: item.date
                  ? new Date(item.date).toLocaleDateString("en-US")
                  : "",
          }))
        : [];

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
            { field: "actions", header: "Actions", body: actionsTemplate },
        ];
    };

    const columns = generateColumns();

    return (
        <DataTable
            value={formattedData}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 20]}
            tableStyle={{ minWidth: "50rem" }}
            dataKey="id"
            stripedRows
            emptyMessage={`No ${type} found.`}
        >
            {columns.map((col) => (
                <Column
                    key={col.field}
                    field={col.field}
                    header={col.header}
                    sortable={col.sortable}
                    body={col.body}
                />
            ))}
        </DataTable>
    );
};

Table.propTypes = {
    type: PropTypes.string.isRequired,
    identifier: PropTypes.string,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    endpoint: PropTypes.string,
};

export default Table;
