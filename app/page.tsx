"use client";
import HomePageSet, {AboutPageSet} from "@/components/HomePage";
import {DefaultLayout} from "@/components/Layout";
import {store} from "@/components/redux/store";
import React, {useRef} from "react";
import {Provider} from "react-redux";
import {Divider} from "rsuite";

export default function HomePage() {
    const registerRef = useRef(null);
    return (
        <Provider store={store}>
            <HomePageSet registerRef={registerRef}/>
            <AboutPageSet registerRef={registerRef}/>
        </Provider>
    );
}