// HomePageSet.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Container, Text } from "rsuite";
import { AppDispatch, RootState } from "./redux/store";
import { Login } from "./Login";
import 'rsuite/Modal/styles/index.css';
import '../app/styles/globals.css';
import { LoginOutlined, UserAddOutlined, DashboardOutlined } from '@ant-design/icons';
import { Button as AntButton, Modal } from 'antd';
import Register from './Register';
import { setHomePageLoading } from "./redux/loadingSlice"; // 导入 action

export default function HomePageSet({ registerRef }) {
    const dispatch = useDispatch<AppDispatch>();

    // 用户登录状态
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState<any>(null);

    // 模态框状态
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);

    // Redux 中的加载状态
    const isLoading = useSelector((state: RootState) => state.loading.homePage || state.loading.aboutPage);

    // 页面加载完成后切换状态并检查用户登录状态
    useEffect(() => {
        console.log("HomePageSet mounted, fetching user info...");
        const fetchUserInfo = async () => {
            dispatch(setHomePageLoading(true)); // 开始加载
            try {
                const response = await fetch('https://api.xywow.studio/auth/user', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setIsLoggedIn(true);
                    setUserInfo(data);
                    console.log("User info fetched successfully:", data);
                } else {
                    setIsLoggedIn(false);
                    setUserInfo(null);
                    console.log("Failed to fetch user info.");
                }
            } catch (error: any) {
                setIsLoggedIn(false);
                setUserInfo(null);
                console.error("Error fetching user info:", error);
            } finally {
                dispatch(setHomePageLoading(false)); // 结束加载
                console.log("HomePageSet loading finished.");
            }
        };

        fetchUserInfo();
    }, [dispatch]);

    // 处理注册按钮点击事件，打开注册模态框
    const handleRegisterClick = () => {
        setIsRegisterModalVisible(true);
    };

    // 处理登录按钮点击事件，打开登录模态框
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // 处理进入 Dashboard 按钮点击事件，重定向到 /dashboard
    const handleEnterDashboard = () => {
        window.location.href = "/dashboard";
    };
    if(!isLoading){
        // 页面加载完成后显示内容
        return (
            <Container className="w-[80vw] h-[100vh] ml-[10vw] flex flex-col items-center justify-center">
                <Container
                    className="font-black bg-gradient-to-r from-[#43dfb2] via-[#00e2ff] to-[#d8b5ff] bg-clip-text [-webkit-text-fill-color:transparent]">
                    <Text className="text-6xl text-center mb-[3vh]">XYwowNET</Text>
                    <Text className="text-center">Powered by KohakuwuTech</Text>
                </Container>

                <Container className="mt-[5vh] w-80 font-black flex justify-evenly">
                    <div style={{
                        marginTop: '5vh',
                        display: 'flex',
                        justifyContent: 'space-evenly',
                        fontWeight: 'bold',
                        gap: '20px'
                    }}>
                        {!isLoggedIn ? (
                            <>
                                <AntButton
                                    className="ant-btn-gradient"
                                    icon={<LoginOutlined/>}
                                    onClick={handleOpen}
                                >
                                    登录
                                </AntButton>
                                <AntButton
                                    className="ant-btn-gradient"
                                    icon={<UserAddOutlined/>}
                                    onClick={handleRegisterClick}
                                >
                                    注册
                                </AntButton>
                            </>
                        ) : (
                            <AntButton
                                className="ant-btn-gradient"
                                icon={<DashboardOutlined/>}
                                onClick={handleEnterDashboard}
                            >
                                进入 Dashboard
                            </AntButton>
                        )}
                    </div>
                </Container>

                {/* 登录模态框 */}
                <Modal
                    open={open}
                    onCancel={handleClose}
                    title={<Text className="font-black text-2xl">登录</Text>}
                    footer={null}
                >
                    <Login/>
                </Modal>

                {/* 注册模态框 */}
                <Modal
                    open={isRegisterModalVisible}
                    onCancel={() => setIsRegisterModalVisible(false)}
                    title={<Text className="font-black text-2xl">注册</Text>}
                    footer={null}
                >
                    <Register/>
                </Modal>
            </Container>
        );
    }
}
