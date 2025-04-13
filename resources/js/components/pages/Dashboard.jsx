import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRecords } from "../store/global-slice";
import Header from "../shared/layout/Header";
import { Tree } from "primereact/tree";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

function Dashboard() {
    const dispatch = useDispatch();
    const {
        class: { data: classes = [], endPoints: classEndPoints },
        levels: { data: levels = [], endPoints: levelEndPoints },
        students: { data: students = [], endPoints: studentEndPoints },
    } = useSelector((state) => state.global);

    const [nodes, setNodes] = useState([]);

    useEffect(() => {
        dispatch(
            getRecords({
                type: "class",
                endPoint: classEndPoints.collection,
                key: "data",
            })
        );
        dispatch(
            getRecords({
                type: "levels",
                endPoint: levelEndPoints.collection,
                key: "data",
            })
        );
        dispatch(
            getRecords({
                type: "students",
                endPoint: studentEndPoints.collection,
                key: "data",
            })
        );
    }, [dispatch]);

    useEffect(() => {
        const treeNodes = levels.map((level) => ({
            key: `level-${level.id}`,
            label: level.name,
            data: { name: level.name },
            children: classes
                .filter((cls) => cls.level_id === level.id)
                .map((cls) => ({
                    key: `class-${cls.id}`,
                    label: cls.name,
                    data: { name: cls.name },
                    children: students
                        .filter((student) => student.class_id === cls.id)
                        .map((student) => ({
                            key: `student-${student.id}`,
                            label: student.name,
                            data: { name: student.name },
                            leaf: true,
                        })),
                })),
        }));
        setNodes(treeNodes);
    }, [levels, classes, students]);

    const nodeTemplate = (node) => {
        return <span>{node.label}</span>;
    };

    return (
        <div>
            <Header />
            <main style={{ padding: "20px" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card title="Overview">
                        <Tree
                            value={nodes}
                            filter
                            filterBy="label"
                            filterMode="lenient"
                            filterPlaceholder="Search"
                            nodeTemplate={nodeTemplate}
                            className="border-none overflow-y-auto"
                            style={{ maxHeight: "480px" }}
                        />
                    </Card>
                    <Card></Card>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
