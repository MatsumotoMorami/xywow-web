// page.tsx

"use client";
import React, { useRef } from "react";
import { Provider, useSelector } from "react-redux";
import { Spin } from "antd";
import { Container } from "rsuite";
import { RootState, store } from "@/components/redux/store"; // 确保路径正确
import HomePageSet from "@/components/HomePageSet";
import { AboutPageSet } from "@/components/AboutPageSet";

const ParentComponent: React.FC = () => {
    const isLoading = useSelector((state: RootState) => state.loading.homePage || state.loading.aboutPage);
    const registerRef = useRef(null);

    return (
        <Container style={{ position: 'relative' }}>
            <HomePageSet registerRef={registerRef} />
            <AboutPageSet registerRef={registerRef} />

            {isLoading && (
                <div className="bg-color" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000, // 确保加载指示器在最上层
                }}>
                    <Spin size="large" />
                </div>
            )}
        </Container>
    );
};

export default function HomePage() {
    return (
        <Provider store={store}>
            <ParentComponent />
        </Provider>
    );
}
