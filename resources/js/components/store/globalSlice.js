import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';

// Dummy states for now (replace with yours)
const APP_STATE = { data: {}, spinner: {}, alert: {} };
const ROLES_STATE = { data: [], spinner: {}, alert: {} };
// ... add others

export const stateKey = {
  app: 'app',
  roles: 'roles',
  // ... add others
};

const INITIAL_STATE = {
  [stateKey.app]: APP_STATE,
  [stateKey.roles]: ROLES_STATE,
  // ... add others
};

const GlobalSlice = createSlice({
  name: 'global',
  initialState: INITIAL_STATE,
  reducers: {
    setStateData: (state, action) => {
      const { type = stateKey.app, data = {}, key, isMerge = true, isReset = false } = action.payload;
      const existingData = state[type][key];
      state[type][key] = !isReset ? (isMerge ? { ...existingData, ...data } : data) : INITIAL_STATE[type][key];
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

export const { setStateData, resetStateData, resetStateKeyData } = GlobalSlice.actions;

export const getRecords = ({ type = stateKey.app, endPoint, key }) => async (dispatch) => {
  dispatch(setStateData({ key: 'spinner', data: { show: true, text: 'Fetching...' } }));
  try {
    const response = await axios.get(endPoint);
    dispatch(resetStateKeyData({ key: 'spinner' }));
    if (response.data.status) {
      dispatch(setStateData({ type, data: response.data.result, key, isMerge: false }));
      return response.data.result;
    }
    return false;
  } catch (error) {
    dispatch(resetStateKeyData({ key: 'spinner' }));
    return false;
  }
};

export const globalReducer = GlobalSlice.reducer;
