import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIsAuthenticated } from "react-auth-kit";
import { getRecords, setStateData } from "../../store/global-slice";
import Header from "../../shared/layout/Header";
import DataTable from "../../shared/misc/DataTable";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";

function FacilityReservations() {
    const dispatch = useDispatch();
    const isAuthenticated = useIsAuthenticated();
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState("create");
    const [timeFilter, setTimeFilter] = useState("today");
    const [rangeFilter, setRangeFilter] = useState(null);
    const {
        bookings: { data: bookings = [], endPoints: bookingEndPoints },
    } = useSelector((state) => state.global);

    const myFetch = (params = { timeFilter: "today" }) => {
        let url = bookingEndPoints.collection;
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
        dispatch(getRecords({ type: "checkin", endPoint: url })).then((d) => {
            if (d) {
                const formattedBooking = d.map((i) => ({
                    id: i.id,
                    student: i.student?.name || "N/A",
                    facility: i.facility?.name || "N/A",
                    start_time: i.start_time,
                    end_time: i.end_time,
                }));
                dispatch(
                    setStateData({
                        type: "bookings",
                        data: formattedBooking,
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
                                type="bookings"
                                identifier="id"
                                onFetch={(params) => myFetch(params)}
                                title="Facility Reservations"
                                timeFilter={timeFilter}
                                setTimeFilter={setTimeFilter}
                                rangeFilter={rangeFilter}
                                setRangeFilter={setRangeFilter}
                            />
                            <Dialog
                                header={
                                    mode === "create"
                                        ? "Add Facility Reservation"
                                        : "Edit Facility Reservation"
                                }
                                visible={visible}
                                style={{ width: "400px" }}
                                onHide={() => setVisible(false)}
                            ></Dialog>
                        </>
                    ) : (
                        <p>
                            Please log in to view and manage facility
                            reservations.
                        </p>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default FacilityReservations;
