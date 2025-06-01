import api from "../api";
import { createSlice } from "@reduxjs/toolkit";
import {
    APP_STATE,
    USER_STATE,
    ROLE_STATE,
    CLASS_STATE,
    LEVEL_STATE,
    ACTIVITY_STATE,
    STUDENT_STATE,
    SUB_FACILITY_STATE,
    FACILITY_STATE,
    CHECKIN_STATE,
    BOOKING_STATE,
    COUNSEL_STATE,
    SUPPORT_STRATEGY_STATE,
    QUESTION_STATE,
} from "./state";
import { stateKey } from "../utils/constants";

const INITIAL_STATE = {
    [stateKey.app]: APP_STATE,
    [stateKey.users]: USER_STATE,
    [stateKey.roles]: ROLE_STATE,
    [stateKey.class]: CLASS_STATE,
    [stateKey.levels]: LEVEL_STATE,
    [stateKey.activities]: ACTIVITY_STATE,
    [stateKey.students]: STUDENT_STATE,
    [stateKey.sub_facilities]: SUB_FACILITY_STATE,
    [stateKey.facilities]: FACILITY_STATE,
    [stateKey.checkin]: CHECKIN_STATE,
    [stateKey.bookings]: BOOKING_STATE,
    [stateKey.counsels]: COUNSEL_STATE,
    [stateKey.support_strategies]: SUPPORT_STRATEGY_STATE,
    [stateKey.questions]: QUESTION_STATE,
};

const globalSlice = createSlice({
    name: "global",
    initialState: INITIAL_STATE,
    reducers: {
        setStateData: (state, action) => {
            const {
                type = stateKey.app,
                data = {},
                key,
                isMerge = true,
                isReset = false,
            } = action.payload;
            const existingData = state[type][key];
            state[type][key] = !isReset
                ? isMerge
                    ? { ...existingData, ...data }
                    : data
                : INITIAL_STATE[type][key];
        },
        resetStateData: (state, action) => {
            const { type = stateKey.app } = action.payload;
            state[type] = INITIAL_STATE[type];
        },
        resetStateKeyData: (state, action) => {
            const { type = stateKey.app, key } = action.payload;
            state[type][key] = INITIAL_STATE[type][key];
        },
    },
});

export const { setStateData, resetStateData, resetStateKeyData } =
    globalSlice.actions;

export const setToastMessage = (message) => (dispatch) => {
    dispatch(setStateData({ key: "toastMessage", data: message }));
};

export const getRecords =
    ({ type = "", endPoint, key }) =>
    async (dispatch) => {
        dispatch(
            setStateData({
                key: "spinner",
                data: { show: true, text: "Fetching..." },
            })
        );
        try {
            const url = endPoint || (type ? `/api/${type}` : "");
            if (!url) throw new Error("No endpoint or type provided");

            const response = await api.get(url);
            dispatch(resetStateKeyData({ key: "spinner" }));

            if (response.data.status) {
                const result = response.data.result || [];
                dispatch(
                    setStateData({
                        type: type || stateKey.app,
                        data: result,
                        key,
                        isMerge: false,
                    })
                );
                return result;
            }
            return [];
        } catch (error) {
            dispatch(resetStateKeyData({ key: "spinner" }));
            if (error.response?.status === 401) {
                dispatch(
                    setToastMessage({
                        severity: "warn",
                        summary: "Warning!",
                        detail: "Authentication required. Retrying after login...",
                        life: 10000,
                    })
                );
            } else if (error.response?.request.status === 404) {
                dispatch(
                    setStateData({
                        type: type || stateKey.app,
                        data: [],
                        key,
                        isMerge: false,
                    })
                );
                dispatch(
                    setToastMessage({
                        severity: "info",
                        summary: "Not Found",
                        detail: "No data found",
                        life: 3000,
                    })
                );
                return [];
            } else {
                // console.error("Fetch error:", error.message);
            }
            return [];
        }
    };

export const createRecord =
    ({ type = "", endPoint, data, returnData = false }) =>
    async (dispatch) => {
        dispatch(
            setStateData({
                key: "spinner",
                data: { show: true, text: "Creating..." },
            })
        );
        try {
            const response = await api.post(endPoint, data);
            dispatch(resetStateKeyData({ key: "spinner" }));
            if (response.data.status) {
                dispatch(
                    setStateData({
                        type,
                        key: "data",
                        data: response.data.result,
                        isMerge: true,
                    })
                );
                dispatch(
                    setToastMessage({
                        severity: "success",
                        summary: "Success",
                        detail: "Record created successfully",
                    })
                );
                if (returnData === true) {
                    return response.data.result;
                }
                return true;
            }
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to create record",
                })
            );
            return false;
        } catch (error) {
            dispatch(resetStateKeyData({ key: "spinner" }));
            const errorMsg =
                error.response?.data?.message || "Failed to create record";
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Error",
                    detail: errorMsg,
                })
            );
            throw new Error(errorMsg);
        }
    };

export const updateRecord =
    ({ type = "", endPoint, data, returnData = false }) =>
    async (dispatch) => {
        dispatch(
            setStateData({
                key: "spinner",
                data: { show: true, text: "Updating..." },
            })
        );
        try {
            const response = await api.put(endPoint, data);
            dispatch(resetStateKeyData({ key: "spinner" }));
            if (response.data.status) {
                dispatch(
                    setStateData({
                        type,
                        key: "data",
                        data: response.data.result,
                        isMerge: true,
                    })
                );
                dispatch(
                    setToastMessage({
                        severity: "success",
                        summary: "Success",
                        detail: "Record updated successfully",
                    })
                );
                if (returnData === true) {
                    return response.data.result;
                }
                return true;
            }
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to update record",
                })
            );
            return false;
        } catch (error) {
            dispatch(resetStateKeyData({ key: "spinner" }));
            const errorMsg =
                error.response?.data?.message || "Failed to update record";
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Error",
                    detail: errorMsg,
                })
            );
            throw new Error(errorMsg);
        }
    };

export const deleteRecord =
    ({ endPoint }) =>
    async (dispatch) => {
        dispatch(
            setStateData({
                key: "spinner",
                data: { show: true, text: "Deleting..." },
            })
        );
        try {
            const response = await api.delete(endPoint);
            dispatch(resetStateKeyData({ key: "spinner" }));
            if (response.data.status) {
                dispatch(
                    setToastMessage({
                        severity: "success",
                        summary: "Success",
                        detail: "Record deleted successfully",
                    })
                );
                return true;
            }
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to delete record",
                })
            );
            return false;
        } catch (error) {
            dispatch(resetStateKeyData({ key: "spinner" }));
            const errorMsg =
                error.response?.data?.message || "Failed to delete record";
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Error",
                    detail: errorMsg,
                })
            );
            return false;
        }
    };

export const importRecord =
    ({ type = "", endPoint, file, returnData = false, hasExpand = false }) =>
    async (dispatch) => {
        dispatch(
            setStateData({
                key: "spinner",
                data: { show: true, text: "Importing..." },
            })
        );
        try {
            const formData = new FormData();
            formData.append("file", file);
            if (hasExpand) {
                formData.append("has_expand", true);
            }

            const response = await api.post(endPoint, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            dispatch(resetStateKeyData({ key: "spinner" }));
            if (response.data.status) {
                dispatch(
                    setStateData({
                        type,
                        key: "data",
                        data: Array.isArray(response.data.result)
                            ? response.data.result
                            : [response.data.result],
                        isMerge: true,
                    })
                );
                dispatch(
                    setToastMessage({
                        severity: "success",
                        summary: "Success",
                        detail:
                            response.data.message ||
                            `${type} imported successfully`,
                        life: 3000,
                    })
                );
                return returnData ? response.data.result : true;
            }
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Error",
                    detail: response.data.message || "Failed to import data",
                    life: 5000,
                })
            );
            return false;
        } catch (error) {
            dispatch(resetStateKeyData({ key: "spinner" }));
            const errorMsg =
                error.response?.data?.message || "Failed to import data";
            dispatch(
                setToastMessage({
                    severity: "error",
                    summary: "Error",
                    detail: errorMsg,
                    life: 5000,
                })
            );
            throw new Error(errorMsg);
        }
    };

export const globalReducer = globalSlice.reducer;
