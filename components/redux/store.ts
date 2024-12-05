import {configureStore} from "@reduxjs/toolkit";
import {expandReducer} from "./expand";

export const store = configureStore({
    reducer: {
        expand: expandReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;