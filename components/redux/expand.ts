import { createSlice } from "@reduxjs/toolkit";

const expandSlice = createSlice({
    name: 'expand',
    initialState: {value:false},
    reducers: {
        rev: (state) => {
            state.value = !state.value;
        }
    }
})

export const { rev } = expandSlice.actions;
export const expandReducer = expandSlice.reducer;