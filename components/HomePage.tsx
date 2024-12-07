import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Container, Divider, Modal, Text } from "rsuite";
import { AppDispatch, RootState } from "./redux/store";
import { Login } from "./Login";
import 'rsuite/Modal/styles/index.css';
import '../app/styles/globals.css';
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { Button as AntButton, Spin } from 'antd';

// HomePageSet 组件
export default function HomePageSet({ registerRef }) {
    const expand = useSelector((state: RootState) => state.expand.value);
    const dispatch = useDispatch<AppDispatch>();

    // 加载状态，默认是 true，页面加载时显示 Spin 组件
    const [loading, setLoading] = useState(true);

    // 页面加载完成后切换状态
    useEffect(() => {
        // 在页面加载完成后切换 loading 状态
        const handleLoad = () => setLoading(false);

        // 添加事件监听器，当页面加载完成时触发
        window.addEventListener('load', handleLoad);

        // 清理事件监听器
        return () => {
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    const registerClickHandle = () => {
        if (registerRef.current) {
            registerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // 在页面加载前显示 Spin 组件，加载完成后显示页面内容
    if (loading) {
        return (
            <Container className="w-full h-full flex items-center justify-center">
                <Spin size="large" />
            </Container>
        );
    }

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
                    <AntButton
                        className="ant-btn-gradient"
                        icon={<LoginOutlined />}
                        onClick={handleOpen}
                    >
                        登录
                    </AntButton>
                    <AntButton
                        className="ant-btn-gradient"
                        icon={<UserAddOutlined />}
                        onClick={registerClickHandle}
                    >
                        注册
                    </AntButton>
                </div>
            </Container>

            <Modal open={open} onClose={handleClose}>
                <Modal.Header>
                    <Text className="font-black text-2xl">登录</Text>
                </Modal.Header>
                <Modal.Body>
                    <Login />
                </Modal.Body>
            </Modal>
        </Container>
    );
}

// AboutPageSet 组件
export function AboutPageSet({ registerRef }) {
    const [loading, setLoading] = useState(true);

    // 模拟数据加载完成
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); // 数据加载完成，停止加载状态
        }, 2000); // 模拟加载延迟 2 秒
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <Container className="w-full h-full flex items-center justify-center">
                <Spin size="large" />
            </Container>
        );
    }

    let staffList = [
        {
            name: "xy0v0",
            job: "老大",
            userId: 2507788589
        },
        {
            name: "焊老板",
            job: "设备提供 技术支持",
            userId: 835271418
        },
        {
            name: "忆梦",
            job: "二把手 全栈工程师",
            userId: 2803355799
        },
        {
            name: "松本",
            job: "提供精神支持",
            userId: 3098805300
        },
        {
            name: "Apple.catwaii() # 💤",
            job: "策划",
            userId: 3034582021
        },
        {
            name: "Kcalb",
            job: "全栈GPT工程师",
            userId: 1456917166
        },
        {
            name: "绀霜",
            job: "网页设计",
            userId: 750174883
        }
    ];

    return (
        <Container className="w-[80vw] ml-[10vw] pb-[8vh] pt-[5vh]" ref={registerRef}>
            <Container className="w-full ml-[2vw]">
                <Text className="font-black text-5xl mb-[4vh] text-white overflow-visible">🎮 游玩须知</Text>
                <Container className="font-black leading-loose text-lg w-[80vw] bg-white rounded-3xl p-10">
                    <Text>欢迎各位玩家来到XYwow进行游玩！窝中有舞萌手台*2，舞萌旧改新*1，音击/中二/太鼓/SDVX手台。另有麻将、UNO、NS、FF14可供游玩。</Text>
                    <Text>初次来窝之前请遵循以下步骤进行注册：</Text>
                    <Text>1. 添加STAFF QQ通过初审之后，会将您拉入群聊</Text>
                    <Text>xy0v0: 2507788589 忆梦: 2803355799</Text>
                    <Text>2. 进群之后请填写问卷并催促STAFF将您加入白名单</Text>
                    <Text>3. 群内输入reg进行注册，随后会为您调整游玩的折扣</Text>
                    <Text>4. 详细阅读群公告，游玩前请在群内使用指令预约，游玩时保持窝内整洁，祝您游玩愉快！</Text>
                </Container>
            </Container>
            <Container className="w-full mt-[5vh]">
                <Text className="font-black text-5xl mb-[2vh] ml-[2vw] text-white">👾 职能STAFF一览</Text>
                <Container className="overflow-x-auto flex bg-opacity-50 mb-[5vh] flex-wrap w-[80vw]">
                    {staffList.map(item => {
                        return (
                            <Container
                                className="m-[2vw] px-6 py-2 w-[218px] rounded-3xl bg-white hover:shadow-2xl shadow-md duration-300 flex flex-col"
                                key={item.userId}>
                                <img width="170" height="170"
                                     src={"https://q2.qlogo.cn/headimg_dl?dst_uin=" + item.userId.toString() + "&spec=640"}
                                     className="rounded-3xl mt-3" />
                                <Container className="flex flex-row leading-tight">
                                    <Container className="w-2 h-[60%] mt-[10%] mr-3 rounded-full bg-color" />
                                    <Container
                                        className="flex flex-col overflow-x-auto text-nowrap overflow-hidden scrollbar-hide">
                                        <Text className="text-left mt-3 font-black">{item.name}</Text>
                                        <Text className="text-left my-2 font-black">{item.job}</Text>
                                    </Container>
                                </Container>
                            </Container>
                        );
                    })}
                </Container>
            </Container>
            <Divider />
        </Container>
    );
}
