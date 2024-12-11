// AboutPageSet.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Container, Text, Divider } from "rsuite";
import { AppDispatch, RootState } from "./redux/store";
import { setAboutPageLoading } from "./redux/loadingSlice"; // 导入 action

const staffList = [
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


export function AboutPageSet({ registerRef }) {
    const dispatch = useDispatch<AppDispatch>();
    const isLoading = useSelector((state: RootState) => state.loading.homePage || state.loading.aboutPage);

    useEffect(() => {
        console.log("AboutPageSet mounted, fetching data...");
        const fetchData = async () => {
            dispatch(setAboutPageLoading(true)); // 开始加载
            try {
                // 替换模拟加载为实际的数据获取逻辑
                const response = await fetch('https://api.xywow.studio/auth/user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    // 处理获取的数据
                    console.log("AboutPageSet data fetched successfully:", data);
                } else {
                    console.log("Failed to fetch AboutPageSet data.");
                }
            } catch (error) {
                console.error("Error fetching AboutPageSet data:", error);
            } finally {
                dispatch(setAboutPageLoading(false)); // 结束加载
                console.log("AboutPageSet loading finished.");
            }
        };

        fetchData();
    }, [dispatch]);


    // 页面加载完成后显示内容
    return (
        <Container className="w-[80vw] ml-[10vw] pb-[8vh] pt-[5vh]" ref={registerRef}>
            <Container className="w-full ml-[2vw]">
                <Text className="font-black text-5xl mb-[4vh] text-white overflow-visible">🎮 游玩须知</Text>
                <Container className="font-black leading-loose text-lg w-[80vw] bg-white rounded-3xl p-10">
                    <Text>欢迎各位玩家来到XYwow进行游玩！窝中有舞萌手台*2，舞萌旧改新*1，音击/中二/太鼓/SDVX手台。另有麻将、UNO、NS、FF14可供游玩。</Text>
                    <Text>初次来窝之前请遵循以下步骤进行注册：</Text>
                    <Text>1. 在网页注册用户并等待审核</Text>
                    <Text>2. 通过审核之后，添加STAFF QQ</Text>
                    <Text>xy0v0: 2507788589 忆梦: 2803355799</Text>
                    <Text>3. 进群后详细阅读群公告，游玩前请在群内使用指令预约，游玩时保持窝内整洁，祝您游玩愉快！</Text>
                </Container>
            </Container>
            <Container className="w-full mt-[5vh]">
                <Text className="font-black text-5xl mb-[2vh] ml-[2vw] text-white">👾 职能STAFF一览</Text>
                <Container className="overflow-x-auto flex bg-opacity-50 mb-[5vh] flex-wrap w-[80vw]">
                    {staffList.map(item => (
                        <Container
                            className="m-[2vw] px-6 py-2 w-[218px] rounded-3xl bg-white hover:shadow-2xl shadow-md duration-300 flex flex-col"
                            key={item.userId}>
                            <img width="170" height="170"
                                 src={`https://q2.qlogo.cn/headimg_dl?dst_uin=${item.userId}&spec=640`}
                                 className="rounded-3xl mt-3"/>
                            <Container className="flex flex-row leading-tight">
                                <Container className="w-2 h-[60%] mt-[10%] mr-3 rounded-full bg-color"/>
                                <Container
                                    className="flex flex-col overflow-x-auto text-nowrap overflow-hidden scrollbar-hide">
                                    <Text className="text-left mt-3 font-black">{item.name}</Text>
                                    <Text className="text-left my-2 font-black">{item.job}</Text>
                                </Container>
                            </Container>
                        </Container>
                    ))}
                </Container>
            </Container>
            <Divider/>
        </Container>
    );
}
