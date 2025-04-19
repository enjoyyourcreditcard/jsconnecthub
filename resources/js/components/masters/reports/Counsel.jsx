import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIsAuthenticated } from "react-auth-kit";
import {
    getRecords,
    createRecord,
    updateRecord,
    setStateData,
} from "../../store/global-slice";
import Header from "../../shared/layout/Header";
import DataTable from "../../shared/misc/DataTable";
import { Card } from "primereact/card";

function Counsel() {
    const dispatch = useDispatch();
    const isAuthenticated = useIsAuthenticated();
    const [timeFilter, setTimeFilter] = useState(null);
    const [rangeFilter, setRangeFilter] = useState(null);
    const {
        counsels: { data: counsels = [], endPoints: counselEndPoints },
    } = useSelector((state) => state.global);

    const myFetch = (params = { timeFilter: "today" }) => {
        let url = counselEndPoints.collection;
        if (params.timeFilter) {
            url += `?time=${params.timeFilter}`;
        } else if (
            params.rangeFilter &&
            params.rangeFilter[0] &&
            params.rangeFilter[1]
        ) {
            const start = params.rangeFilter[0].toISOString().split("T")[0];
            const end = params.rangeFilter[1].toISOString().split("T")[0];
            url += `?range_time[start]=${start}&range_time[end]=${end}`;
        }
        dispatch(getRecords({ type: "counsels", endPoint: url })).then((d) => {
            if (d) {
                const formattedCounsels = d.map((i) => ({
                    id: i.id,
                    student: i.student?.name || "N/A",
                }));
                dispatch(
                    setStateData({
                        type: "counsels",
                        data: formattedCounsels,
                        key: "data",
                        isMerge: false,
                    })
                );
            }
        });
    };

    useEffect(() => {
        myFetch();
    }, [dispatch]);

    return (
        <div>
            <Header />
            <main style={{ padding: "20px" }}>
                <Card>
                    {isAuthenticated() ? (
                        <>
                            <DataTable
                                type="counsels"
                                identifier="id"
                                hasImport={true}
                                onFetch={(params) => myFetch(params)}
                                // onAdd={handleAdd}
                                // onEdit={handleEdit}
                                title="Counsel"
                                timeFilter={timeFilter}
                                setTimeFilter={setTimeFilter}
                                rangeFilter={rangeFilter}
                                setRangeFilter={setRangeFilter}
                            />
                            {/* <Dialog
                                header={
                                    mode === "create"
                                        ? "Add Check In"
                                        : "Edit Check In"
                                }
                                visible={visible}
                                style={{ width: "400px" }}
                                onHide={() => setVisible(false)}
                            ></Dialog> */}
                        </>
                    ) : (
                        <p>Please log in to view and manage counsels.</p>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default Counsel;
