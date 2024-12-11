// redux/loadingSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoadingState {
    homePage: boolean;
    aboutPage: boolean;
}

const initialState: LoadingState = {
    homePage: false,  // 初始为 false，表示不在加载状态
    aboutPage: false,
};

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        setHomePageLoading(state, action: PayloadAction<boolean>) {
            state.homePage = action.payload;
        },
        setAboutPageLoading(state, action: PayloadAction<boolean>) {
            state.aboutPage = action.payload;
        },
        resetLoading(state) {
            state.homePage = false;
            state.aboutPage = false;
        },
    },
});

export const { setHomePageLoading, setAboutPageLoading, resetLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
