import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIsAuthenticated } from "react-auth-kit";
import {
    getRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    setStateData,
} from "../store/global-slice";
import Header from "../shared/layout/Header";
import DataTable from "../shared/misc/DataTable";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

function ManageSupportAndQuestions() {
    const dispatch = useDispatch();
    const isAuthenticated = useIsAuthenticated();
    const [strategyDialog, setStrategyDialog] = useState(false);
    const [questionDialog, setQuestionDialog] = useState(false);
    const [mode, setMode] = useState("create");
    const [editId, setEditId] = useState(null);
    const [strategyFormData, setStrategyFormData] = useState({ name: "" });
    const [questionFormData, setQuestionFormData] = useState({
        support_strategy_id: null,
        order: "",
        text: "",
        type: "text",
        radio_options: [],
    });
    const [radioOptionInput, setRadioOptionInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const {
        support_strategies: {
            data: supportStrategies = [],
            endPoints: strategyEndPoints,
        },
        questions: { data: questions = [], endPoints: questionEndPoints },
    } = useSelector((state) => state.global);

    const questionTypes = [
        { label: "Text", value: "text" },
        { label: "Multiple Choices", value: "radio" },
    ];

    useEffect(() => {
        fetchSupportStrategies();
        fetchQuestions();
    }, [dispatch]);

    const fetchSupportStrategies = () => {
        dispatch(
            getRecords({
                type: "support_strategies",
                endPoint: strategyEndPoints.collection,
            })
        ).then((d) => {
            if (d) {
                const formattedData = d.map((i) => ({
                    id: i.id,
                    name: i.name,
                    created_at: i.created_at,
                    updated_at: i.updated_at,
                }));
                dispatch(
                    setStateData({
                        type: "support_strategies",
                        data: formattedData,
                        key: "data",
                        isMerge: false,
                    })
                );
            }
        });
    };

    const fetchQuestions = () => {
        dispatch(
            getRecords({
                type: "questions",
                endPoint: questionEndPoints.collection,
            })
        ).then((d) => {
            if (d) {
                const formattedData = d.map((i) => ({
                    id: i.id,
                    support_strategy_id: i.support_strategy_id,
                    order: i.order,
                    text: i.text,
                    type: i.type,
                    radio_options: Array.isArray(i.radio_options)
                        ? i.radio_options.map((opt) => opt.text)
                        : [],
                    created_at: i.created_at,
                    updated_at: i.updated_at,
                }));
                dispatch(
                    setStateData({
                        type: "questions",
                        data: formattedData,
                        key: "data",
                        isMerge: false,
                    })
                );
            }
        });
    };

    const handleAddStrategy = () => {
        setMode("create");
        setStrategyFormData({ name: "" });
        setStrategyDialog(true);
    };

    const handleEditStrategy = (id) => {
        const strategy = supportStrategies.find((s) => s.id === id);
        if (strategy) {
            setStrategyFormData({ name: strategy.name });
            setEditId(id);
            setMode("edit");
            setStrategyDialog(true);
        }
    };

    const handleAddQuestion = (supportStrategyId) => {
        setMode("create");
        setQuestionFormData({
            support_strategy_id: supportStrategyId,
            order: "",
            text: "",
            type: "text",
            radio_options: [],
        });
        setRadioOptionInput("");
        setQuestionDialog(true);
    };

    const handleEditQuestion = (id) => {
        const question = questions.find((q) => q.id === id);
        if (question) {
            setQuestionFormData({
                support_strategy_id: question.support_strategy_id,
                order: question.order,
                text: question.text,
                type: question.type,
                radio_options: question.radio_options || [],
            });
            setEditId(id);
            setMode("edit");
            setRadioOptionInput("");
            setQuestionDialog(true);
        }
    };

    const handleDeleteQuestion = (id) => {
        dispatch(
            deleteRecord({
                endPoint: `${questionEndPoints.delete}${id}`,
            })
        ).then((success) => {
            if (success) {
                fetchQuestions();
            }
        });
    };

    const handleStrategyChange = (e) => {
        const { name, value } = e.target;
        setStrategyFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        setQuestionFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "type" && value === "text"
                ? { radio_options: [] }
                : {}),
        }));
    };

    const addRadioOption = () => {
        if (radioOptionInput.trim()) {
            setQuestionFormData((prev) => ({
                ...prev,
                radio_options: [...prev.radio_options, radioOptionInput.trim()],
            }));
            setRadioOptionInput("");
        }
    };

    const removeRadioOption = (index) => {
        setQuestionFormData((prev) => ({
            ...prev,
            radio_options: prev.radio_options.filter((_, i) => i !== index),
        }));
    };

    const handleStrategySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (mode === "create") {
                dispatch(
                    createRecord({
                        type: "support_strategies",
                        endPoint: strategyEndPoints.store,
                        data: strategyFormData,
                    })
                );
            } else {
                dispatch(
                    updateRecord({
                        type: "support_strategies",
                        endPoint: `${strategyEndPoints.update}${editId}`,
                        data: strategyFormData,
                    })
                );
            }
            setStrategyFormData({ name: "" });
            setStrategyDialog(false);
            fetchSupportStrategies();
        } catch (err) {
            setError(err.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = {
                support_strategy_id: questionFormData.support_strategy_id,
                order: questionFormData.order,
                text: questionFormData.text,
                type: questionFormData.type,
                ...(questionFormData.type === "radio"
                    ? { radio_options: questionFormData.radio_options }
                    : {}),
            };

            if (mode === "create") {
                dispatch(
                    createRecord({
                        type: "questions",
                        endPoint: questionEndPoints.store,
                        data,
                    })
                );
            } else {
                dispatch(
                    updateRecord({
                        type: "questions",
                        endPoint: `${questionEndPoints.update}${editId}`,
                        data,
                    })
                );
            }
            setQuestionFormData({
                support_strategy_id: null,
                order: "",
                text: "",
                type: "text",
                radio_options: [],
            });
            setRadioOptionInput("");
            setQuestionDialog(false);
            fetchQuestions();
        } catch (err) {
            setError(err.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <main style={{ padding: "20px" }}>
                <Card>
                    {isAuthenticated() ? (
                        <>
                            <DataTable
                                type="support_strategies"
                                identifier="id"
                                hasImport={true}
                                onFetch={fetchSupportStrategies}
                                onAdd={handleAddStrategy}
                                onEdit={handleEditStrategy}
                                onAddQuestion={handleAddQuestion}
                                onEditQuestion={handleEditQuestion}
                                onDeleteQuestion={handleDeleteQuestion}
                                title="Form Ask Ms Vi"
                                questions={questions}
                            />
                            <Dialog
                                header={
                                    mode === "create"
                                        ? "Add Support Strategy"
                                        : "Edit Support Strategy"
                                }
                                visible={strategyDialog}
                                style={{ width: "400px" }}
                                onHide={() => setStrategyDialog(false)}
                            >
                                <form
                                    onSubmit={handleStrategySubmit}
                                    className="mt-8"
                                >
                                    {error && (
                                        <p
                                            style={{
                                                color: "red",
                                                marginBottom: "2rem",
                                            }}
                                        >
                                            {error}
                                        </p>
                                    )}
                                    <div style={{ marginBottom: "2rem" }}>
                                        <FloatLabel>
                                            <InputText
                                                name="name"
                                                value={strategyFormData.name}
                                                onChange={handleStrategyChange}
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                tooltip="Enter support strategy name"
                                                tooltipOptions={{
                                                    position: "bottom",
                                                    mouseTrack: true,
                                                    mouseTrackTop: 15,
                                                }}
                                            />
                                            <label htmlFor="name">Name</label>
                                        </FloatLabel>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <Button
                                            label="Cancel"
                                            icon="pi pi-times"
                                            type="button"
                                            onClick={() =>
                                                setStrategyDialog(false)
                                            }
                                            className="p-button-text"
                                            disabled={loading}
                                        />
                                        <Button
                                            label={
                                                mode === "create"
                                                    ? "Create"
                                                    : "Update"
                                            }
                                            icon="pi pi-check"
                                            type="submit"
                                            disabled={loading}
                                            autoFocus
                                        />
                                    </div>
                                </form>
                            </Dialog>
                            <Dialog
                                header={
                                    mode === "create"
                                        ? "Add Question"
                                        : "Edit Question"
                                }
                                visible={questionDialog}
                                style={{ width: "500px" }}
                                onHide={() => setQuestionDialog(false)}
                            >
                                <form
                                    onSubmit={handleQuestionSubmit}
                                    className="mt-8"
                                >
                                    {error && (
                                        <p
                                            style={{
                                                color: "red",
                                                marginBottom: "2rem",
                                            }}
                                        >
                                            {error}
                                        </p>
                                    )}
                                    <div style={{ marginBottom: "2rem" }}>
                                        <FloatLabel>
                                            <InputText
                                                name="order"
                                                value={questionFormData.order}
                                                onChange={handleQuestionChange}
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                type="number"
                                                tooltip="Enter question order"
                                            />
                                            <label htmlFor="order">Order</label>
                                        </FloatLabel>
                                    </div>
                                    <div style={{ marginBottom: "2rem" }}>
                                        <FloatLabel>
                                            <InputTextarea
                                                name="text"
                                                value={questionFormData.text}
                                                onChange={handleQuestionChange}
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                rows={4}
                                                tooltip="Enter question text"
                                            />
                                            <label htmlFor="text">
                                                Question Text
                                            </label>
                                        </FloatLabel>
                                    </div>
                                    <div style={{ marginBottom: "2rem" }}>
                                        <FloatLabel>
                                            <Dropdown
                                                name="type"
                                                value={questionFormData.type}
                                                options={questionTypes}
                                                onChange={handleQuestionChange}
                                                style={{ width: "100%" }}
                                                required
                                                disabled={loading}
                                                tooltip="Select question type"
                                            />
                                            <label htmlFor="type">Type</label>
                                        </FloatLabel>
                                    </div>
                                    {questionFormData.type === "radio" && (
                                        <div style={{ marginBottom: "2rem" }}>
                                            <FloatLabel>
                                                <InputText
                                                    value={radioOptionInput}
                                                    onChange={(e) =>
                                                        setRadioOptionInput(
                                                            e.target.value
                                                        )
                                                    }
                                                    style={{ width: "70%" }}
                                                    disabled={loading}
                                                    tooltip="Enter a answer"
                                                />
                                                <Button
                                                    label="Add"
                                                    icon="pi pi-plus"
                                                    type="button"
                                                    onClick={addRadioOption}
                                                    style={{
                                                        marginLeft: "10px",
                                                        width: "25%",
                                                    }}
                                                    disabled={
                                                        loading ||
                                                        !radioOptionInput.trim()
                                                    }
                                                />
                                                <label htmlFor="radioOption">
                                                    Answer
                                                </label>
                                            </FloatLabel>
                                            <div style={{ marginTop: "1rem" }}>
                                                {questionFormData.radio_options.map(
                                                    (option, index) => (
                                                        <div
                                                            key={index}
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                marginBottom:
                                                                    "0.5rem",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    flex: 1,
                                                                }}
                                                            >
                                                                {option}
                                                            </span>
                                                            <Button
                                                                icon="pi pi-trash"
                                                                className="p-button-text p-button-danger"
                                                                onClick={() =>
                                                                    removeRadioOption(
                                                                        index
                                                                    )
                                                                }
                                                                disabled={
                                                                    loading
                                                                }
                                                            />
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                            {questionFormData.radio_options
                                                .length < 2 && (
                                                <p
                                                    style={{
                                                        color: "red",
                                                        fontSize: "0.9rem",
                                                    }}
                                                >
                                                    At least 2 answers are
                                                    required.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <Button
                                            label="Cancel"
                                            icon="pi pi-times"
                                            type="button"
                                            onClick={() =>
                                                setQuestionDialog(false)
                                            }
                                            className="p-button-text"
                                            disabled={loading}
                                        />
                                        <Button
                                            label={
                                                mode === "create"
                                                    ? "Create"
                                                    : "Update"
                                            }
                                            icon="pi pi-check"
                                            type="submit"
                                            disabled={
                                                loading ||
                                                (questionFormData.type ===
                                                    "radio" &&
                                                    questionFormData
                                                        .radio_options.length <
                                                        2)
                                            }
                                            autoFocus
                                        />
                                    </div>
                                </form>
                            </Dialog>
                        </>
                    ) : (
                        <p>Please log in to view and manage data.</p>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default ManageSupportAndQuestions;
