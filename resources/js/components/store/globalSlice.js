import axios from 'axios';
import { createSlice } from '@reduxjs/toolkit';

// Dummy states for now (replace with yours)
const ROLES_STATE = { data: [], spinner: {}, alert: {} };
const USERS_STATE = { data: [], spinner: {}, alert: {} };
// ... add others

export const stateKey = {
  roles: 'roles',
  users: 'users',
  // ... add others
};

const INITIAL_STATE = {
  [stateKey.roles]: ROLES_STATE,
  [stateKey.users]: USERS_STATE,
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

export const getRecords = ({ type, endPoint, key }) => async (dispatch) => {
    dispatch(setStateData({ key: 'spinner', data: { show: true, text: 'Fetching...' } }));
    try {
      const response = await axios.get(`/api/${type}`); // e.g., /api/roles
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
