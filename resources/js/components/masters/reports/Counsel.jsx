import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRecords, setStateData } from "../../store/global-slice";
import Header from "../../shared/layout/Header";
import DataTable from "../../shared/misc/DataTable";
import { Card } from "primereact/card";
import { DateTime } from "luxon";

function Counsel() {
    const dispatch = useDispatch();
    const [userTimezone, setUserTimezone] = useState(null);
    const [timeFilter, setTimeFilter] = useState("month");
    const [dateFilter, setDateFilter] = useState(null);
    const [rangeFilter, setRangeFilter] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [loadingSupportStrategies, setLoadingSupportStrategies] =
        useState(true);
    const {
        counsels: { data: rawCounsels = [], endPoints: counselEndPoints },
        support_strategies: {
            data: supportStrategies = [],
            endPoints: strategyEndPoints,
        },
    } = useSelector((state) => state.global);

    const counsels = Array.isArray(rawCounsels)
        ? rawCounsels
        : rawCounsels && typeof rawCounsels === "object"
        ? Object.values(rawCounsels).filter(
              (item) => typeof item === "object" && item.id
          )
        : [];

    const myFetch = (params = { timeFilter }) => {
        let currentDateFilter =
            params?.dateFilter !== undefined ? params.dateFilter : dateFilter;
        let currentFilter =
            params?.timeFilter !== undefined ? params.timeFilter : timeFilter;
        let currentRange =
            params?.rangeFilter !== undefined
                ? params.rangeFilter
                : rangeFilter;

        let url = counselEndPoints.collection;
        if (currentFilter) {
            url += `?time=${currentFilter}`;
        }
        if (currentRange) {
            if (currentRange[0] && currentRange[1]) {
                const start = currentRange[0].toISOString();
                const endDate = new Date(currentRange[1]);
                endDate.setUTCDate(endDate.getUTCDate() + 1);
                const end = endDate.toISOString();
                url += `?range_time[start]=${start}&range_time[end]=${end}`;
            } else if (currentRange[0]) {
                const start = currentRange[0].toISOString();
                const endDate = new Date(currentRange[0]);
                endDate.setUTCDate(endDate.getUTCDate() + 1);
                const end = endDate.toISOString();
                url += `?range_time[start]=${start}&range_time[end]=${end}`;
            }
        }
        if (currentDateFilter) {
            const start = currentDateFilter.toISOString();
            const endDate = new Date(currentDateFilter);
            endDate.setUTCDate(endDate.getUTCDate() + 1);
            const end = endDate.toISOString();
            url += `?range_time[start]=${start}&range_time[end]=${end}`;
        }
        dispatch(getRecords({ type: "counsels", endPoint: url }))
            .then((d) => {
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
            })
            .finally(() => setLoadingData(false));
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
        ).finally(() => setLoadingSupportStrategies(false));
        myFetch();
    }, [dispatch]);

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

    const isDataReady = !loadingData && !loadingSupportStrategies;

    return (
        <div>
            <Header />
            <main
                className="admin-container with-color"
                style={{ padding: "20px" }}
            >
                <Card>
                    {isDataReady ? (
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
