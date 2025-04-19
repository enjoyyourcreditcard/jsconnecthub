import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIsAuthenticated } from "react-auth-kit";
import {
    getRecords,
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
        support_strategies: {
            data: supportStrategies = [],
            endPoints: strategyEndPoints,
        },
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
                    support_strategies: [
                        ...new Set(
                            i.answers.map((a) => a.question.support_strategy.name)
                        ),
                    ].join(", "),
                    answers: i.answers,
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
        dispatch(
            getRecords({
                type: "support_strategies",
                endPoint: strategyEndPoints.collection,
                key: "data",
            })
        );
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
                                title="Counsel"
                                timeFilter={timeFilter}
                                setTimeFilter={setTimeFilter}
                                rangeFilter={rangeFilter}
                                setRangeFilter={setRangeFilter}
                            />
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
