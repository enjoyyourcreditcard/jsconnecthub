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
    const [userTimezone, setUserTimezone] = useState(null);
    const [timeFilter, setTimeFilter] = useState("month");
    const [dateFilter, setDateFilter] = useState(null);
    const [rangeFilter, setRangeFilter] = useState(null);
    const {
        counsels: { data: counsels = [], endPoints: counselEndPoints },
        support_strategies: {
            data: supportStrategies = [],
            endPoints: strategyEndPoints,
        },
    } = useSelector((state) => state.global);

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

    const myFetch = (params = { timeFilter }) => {
        let url = counselEndPoints.collection;
        if (params.timeFilter) {
            url += `?time=${params.timeFilter}`;
        }
        if (params.rangeFilter) {
            if (params.rangeFilter[0] && params.rangeFilter[1]) {
                const start = params.rangeFilter[0].toISOString();
                const endDate = new Date(params.rangeFilter[1]);
                endDate.setUTCDate(endDate.getUTCDate() + 1);
                const end = endDate.toISOString();
                url += `?range_time[start]=${start}&range_time[end]=${end}`;
            } else if (params.rangeFilter[0]) {
                const start = params.rangeFilter[0].toISOString();
                const endDate = new Date(params.rangeFilter[0]);
                endDate.setUTCDate(endDate.getUTCDate() + 1);
                const end = endDate.toISOString();
                url += `?range_time[start]=${start}&range_time[end]=${end}`;
            }
        }
        if (params.dateFilter) {
            const start = params.dateFilter.toISOString();
            const endDate = new Date(params.dateFilter);
            endDate.setUTCDate(endDate.getUTCDate() + 1);
            const end = endDate.toISOString();
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
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setUserTimezone(timezone);
    }, []);

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
                    {supportStrategies.length > 0 ? (
                        <DataTable
                            type="counsels"
                            identifier="date"
                            onFetch={(params) => myFetch(params)}
                            title="Counsel"
                            timeFilter={timeFilter}
                            setTimeFilter={setTimeFilter}
                            dateFilter={dateFilter}
                            setDateFilter={setDateFilter}
                            rangeFilter={rangeFilter}
                            setRangeFilter={setRangeFilter}
                            hasExpand={true}
                            collection={groupedCounsels}
                            supportStrategies={supportStrategies}
                            isGrouped={true}
                        />
                    ) : (
                        <p>Please wait.</p>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default Counsel;
