import { createSlice } from "@reduxjs/toolkit";
import api from "../api";

const APP_STATE = { data: [], spinner: { show: false, text: "" }, alert: {} };
const USERS_STATE = { data: [], spinner: { show: false, text: "" }, alert: {} };
const ROLES_STATE = { data: [], spinner: { show: false, text: "" }, alert: {} };
const LEVEL_STATE = { data: [], spinner: { show: false, text: "" }, alert: {} };
const CLASS_STATE = { data: [], spinner: { show: false, text: "" }, alert: {} };

export const stateKey = {
    app: "app",
    users: "users",
    roles: "roles",
    levels: "levels",
    class: "class",
};

const INITIAL_STATE = {
    [stateKey.app]: APP_STATE,
    [stateKey.users]: USERS_STATE,
    [stateKey.roles]: ROLES_STATE,
    [stateKey.levels]: LEVEL_STATE,
    [stateKey.class]: CLASS_STATE,
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
                dispatch(
                    setStateData({
                        type: type || stateKey.app,
                        data: response.data.result,
                        key,
                        isMerge: false,
                    })
                );
                return response.data.result;
            }
            return false;
        } catch (error) {
            dispatch(resetStateKeyData({ key: "spinner" }));
            console.error("Fetch error:", error.message);
            return false;
        }
    };

export const createRecord =
    ({ type = "", endPoint, data }) =>
    async (dispatch) => {
        dispatch(
            setStateData({
                type,
                key: "spinner",
                data: { show: true, text: "Creating..." },
            })
        );
        try {
            const response = await api.post(endPoint, data);
            dispatch(resetStateKeyData({ type, key: "spinner" }));
            if (response.data.status) {
                dispatch(
                    setStateData({
                        type,
                        key: "data",
                        data: response.data.result,
                        isMerge: true,
                    })
                );
                return true;
            }
            return false;
        } catch (error) {
            dispatch(resetStateKeyData({ type, key: "spinner" }));
            const errorMsg =
                error.response?.data?.message || "Failed to create record";
            console.error("Create error:", errorMsg);
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
                return true;
            }
            return false;
        } catch (error) {
            dispatch(resetStateKeyData({ key: "spinner" }));
            console.error("Delete error:", error.message);
            return false;
        }
    };

export const globalReducer = globalSlice.reducer;
