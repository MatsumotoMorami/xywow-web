// redux/expandSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExpandState {
    value: boolean; // 根据需求定义状态类型
}

const initialState: ExpandState = {
    value: false,
};

const expandSlice = createSlice({
    name: 'expand',
    initialState,
    reducers: {
        setExpand(state, action: PayloadAction<boolean>) {
            state.value = action.payload;
        },
        toggleExpand(state) {
            state.value = !state.value;
        },
    },
});

export const { setExpand, toggleExpand } = expandSlice.actions;
export default expandSlice.reducer;
