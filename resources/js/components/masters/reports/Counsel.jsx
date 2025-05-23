import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIsAuthenticated } from "react-auth-kit";
import { getRecords, setStateData } from "../../store/global-slice";
import Header from "../../shared/layout/Header";
import DataTable from "../../shared/misc/DataTable";
import { Card } from "primereact/card";
import { DateTime } from "luxon";

function Counsel() {
    const dispatch = useDispatch();
    const isAuthenticated = useIsAuthenticated();
    const [timeFilter, setTimeFilter] = useState("week");
    const [rangeFilter, setRangeFilter] = useState(null);
    const {
        counsels: { data: counsels = [], endPoints: counselEndPoints },
        support_strategies: {
            data: supportStrategies = [],
            endPoints: strategyEndPoints,
        },
    } = useSelector((state) => state.global);

    // Group counsels by created_at date
    const groupCounselsByDate = (counsels) => {
        const grouped = counsels.reduce((acc, counsel) => {
            const date = DateTime.fromISO(counsel.created_at, { zone: "utc" })
                .setZone("local")
                .toFormat("yyyy-MM-dd");
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(counsel);
            return acc;
        }, {});
        return Object.entries(grouped)
            .map(([date, counsels]) => ({
                date,
                formattedDate: DateTime.fromISO(date).toFormat("dd MMMM yyyy"),
                counsels,
                counselCount: counsels.length,
            }))
            .sort(
                (a, b) => DateTime.fromISO(b.date) - DateTime.fromISO(a.date)
            );
    };

    const groupedCounsels = groupCounselsByDate(counsels);

    const myFetch = (params = { timeFilter: "week" }) => {
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
                            i.answers.map(
                                (a) => a.question.support_strategy.name
                            )
                        ),
                    ].join(", "),
                    answers: i.answers,
                    created_at: i.created_at,
                    updated_at: i.updated_at,
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
                        <DataTable
                            type="counsels"
                            identifier="date"
                            onFetch={(params) => myFetch(params)}
                            title="Counsel"
                            timeFilter={timeFilter}
                            setTimeFilter={setTimeFilter}
                            rangeFilter={rangeFilter}
                            setRangeFilter={setRangeFilter}
                            hasExpand={true}
                            collection={groupedCounsels}
                            supportStrategies={supportStrategies}
                            isGrouped={true}
                        />
                    ) : (
                        <p>Please log in to view and manage counsels.</p>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default Counsel;
