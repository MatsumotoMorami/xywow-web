// Layout.tsx
'use client';

import React, { useEffect, useState } from "react";
import { Layout, Menu, Divider, Typography, Modal, message as AntdMessage } from "antd";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    AppstoreOutlined,
    CalendarOutlined,
    CreditCardOutlined,
    DatabaseOutlined,
    UserOutlined,
    MenuOutlined,
    UnorderedListOutlined,
    CloseOutlined
} from '@ant-design/icons';
import '@styles/globals.css';

import { UserCard } from "./UserCard";
import { PlayCard } from "./PlayCard";
import { ContactCard } from "./ContactCard";
import { BaltopCard } from "./BaltopCard";
import { AdminCard } from "./AdminCard";
import { UserManageCard } from "./UserManageCard";
import UserVerifyCard from "./UserVerifyCard";
import Review from "./Review";
import AppointmentComponent from "./booking"; // 导入新组件

const { Header, Sider, Content } = Layout;
const { confirm } = Modal;
const { Text } = Typography;
const SERVER_URL = "https://api.xywow.studio";

interface UserInfoResponse {
    inStore: boolean;
    enterTime: string | null;
    userId: string;
    userName: string;
    auth: number;
    balance: number;
    playcount: number;
    discount: number;
    consumption: number;
}

function getVipLevel(consumption: number): number {
    const level = Math.floor(consumption / 50);
    return level > 100 ? 100 : level;
}

function getVipDiscountFactor(vipLevel: number): number {
    return 1.0 - (vipLevel * 0.005);
}

function calculateBaseCostByHours(hours: number): number {
    let cost = 0;
    for (let h = 1; h <= hours; h++) {
        if (h <= 3) {
            cost += 8;
        } else if (h <= 6) {
            cost += 6;
        } else {
            cost += 5;
        }
    }
    return cost;
}

interface XYwowLogoProps {
    expand: boolean;
}

const XYwowLogo: React.FC<XYwowLogoProps> = ({ expand }) => {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 40"
            width="100"
            height="40"
            style={{ display: 'block', margin: '0 auto' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <rect width="100" height="40" fill="transparent" />

            {/* X 和 Y 字母始终显示 */}
            <motion.text
                x="12"
                y="30"
                fontSize="24"
                fontWeight="bold"
                fill="#4CAF50"
                key="XY"
            >
                XY
            </motion.text>

            {/* "wow" 字母 */}
            <motion.text
                x="45"
                y="30"
                fontSize="24"
                fontWeight="bold"
                fill="#2196F3"
                key="wow"
                initial={{ opacity: 0 }}
                animate={{ opacity: expand ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            >
                {expand ? 'wow' : ''}
            </motion.text>
        </motion.svg>
    );
};

export function DefaultLayout() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [nickname, setNickname] = useState("忆梦");
    const [expand, setExpand] = useState(false);
    const [page, setPage] = useState(1);
    const [auth, setAuth] = useState("STAFF");
    const [playTime, setPlayTime] = useState("");
    const [balance, setBalance] = useState(0);
    const [estimatedCharge, setEstimatedCharge] = useState(0);
    const [playcount, setPlaycount] = useState(0);
    const [discount, setDiscount] = useState(1);
    const [userid, setUserId] = useState("2803355799");
    const [image, setImage] = useState("https://q2.qlogo.cn/headimg_dl?dst_uin=2803355799&spec=640");
    const [inStore, setInStore] = useState(false);
    const [enterTime, setEnterTime] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isPortrait, setIsPortrait] = useState(true);
    const [consumption, setConsumption] = useState(0);

    // 新增状态：存储店内 STAFF 和玩家数量
    const [staffCount, setStaffCount] = useState(0);
    const [playersCount, setPlayersCount] = useState(0);

    const router = useRouter();

    const navItems = [
        { page: 1, label: "首页", icon: <AppstoreOutlined />, show: true },
        { page: 2, label: "预约", icon: <CalendarOutlined />, show: true },
        { page: 3, label: "充值", icon: <CreditCardOutlined />, show: true },
        { page: 4, label: "排行榜", icon: <UnorderedListOutlined />, show: true },
        { page: 5, label: "管理面板", icon: <DatabaseOutlined />, show: auth === "STAFF" },
        { page: 6, label: "个人信息", icon: <UserOutlined />, show: true },
        { page: 7, label: "退出Dashboard", icon:<CloseOutlined />, show: true}
    ];

    const handleMenuClick = (info: any) => {
        const targetPage = parseInt(info.key, 10);
        if(targetPage==7)window.location.href='https://xywow.studio'
        else setPage(targetPage);
    };

    const handleLogout = () => {
        confirm({
            title: "确认登出",
            content: "您确定要登出吗？",
            okText: "确认",
            cancelText: "取消",
            onOk: async () => {
                try {
                    const response = await fetch(`${SERVER_URL}/auth/logout`, {
                        method: 'POST',
                        credentials: 'include'
                    });
                    const data = await response.json();
                    if (response.ok) {
                        AntdMessage.success(data.message || "登出成功");
                        window.location.href = "/";
                    } else {
                        AntdMessage.error(data.error || "登出失败");
                    }
                } catch (error) {
                    console.error('登出错误:', error);
                    AntdMessage.error('登出时发生错误');
                }
            }
        });
    };

    // 获取店内状态函数
    const fetchStoreStatus = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/store/status`, {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('获取店内状态失败');
                return;
            }
            const data = await response.json();
            setStaffCount(data.staff);
            setPlayersCount(data.players);
        } catch (error) {
            console.error('获取店内状态错误:', error);
        }
    };

    // 更新用户状态和店内状态函数
    const handleStatusChange = async () => {
        // 重新获取用户信息
        try {
            const response = await fetch(`${SERVER_URL}/auth/user`, { method: 'GET', credentials: 'include' });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = "/";
                }
                throw new Error('获取用户信息失败');
            }
            const data: UserInfoResponse = await response.json();
            setUserId(data.userId);
            setImage(`https://q2.qlogo.cn/headimg_dl?dst_uin=${data.userId}&spec=640`);
            setNickname(data.userName);
            setAuth(
                data.auth === 0
                    ? "STAFF"
                    : data.auth === 1
                        ? "普通玩家"
                        : data.auth === 2
                            ? "您已被警告"
                            : "您已被封禁"
            );
            setBalance(data.balance);
            setPlaycount(data.playcount);
            setDiscount(data.discount);
            setInStore(data.inStore);
            setEnterTime(data.enterTime);
            setConsumption(data.consumption);
        } catch (error) {
            console.error('获取用户信息错误:', error);
            AntdMessage.error('获取用户信息时发生错误');
        }

        // 用户信息获取完毕后更新店内状态
        await fetchStoreStatus();
    };

    useEffect(() => {
        fetch(`${SERVER_URL}/auth/user`, { method: 'GET', credentials: 'include' })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        window.location.href = "/";
                    }
                    throw new Error('获取用户信息失败');
                }
                setIsAuthenticated(true);
                return response.json();
            })
            .then((data: UserInfoResponse) => {
                setUserId(data.userId);
                setImage(`https://q2.qlogo.cn/headimg_dl?dst_uin=${data.userId}&spec=640`);
                setNickname(data.userName);
                setAuth(
                    data.auth === 0
                        ? "STAFF"
                        : data.auth === 1
                            ? "普通玩家"
                            : data.auth === 2
                                ? "您已被警告"
                                : "您已被封禁"
                );
                setBalance(data.balance);
                setPlaycount(data.playcount);
                setDiscount(data.discount);
                setInStore(data.inStore);
                setEnterTime(data.enterTime);
                setConsumption(data.consumption);
            })
            .catch(error => console.error('获取用户信息错误:', error))
            .finally(async () => {
                // 用户信息获取完成后，加载店内状态
                await fetchStoreStatus();
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const computePlayData = () => {
            if (!isAuthenticated || !inStore || !enterTime) {
                setPlayTime("");
                setEstimatedCharge(0);
                return;
            }

            const enterTimestamp = parseInt(enterTime, 10);
            if (isNaN(enterTimestamp)) {
                setPlayTime("");
                setEstimatedCharge(0);
                return;
            }

            const enterDate = new Date(enterTimestamp);
            if (isNaN(enterDate.getTime())) {
                setPlayTime("");
                setEstimatedCharge(0);
                return;
            }

            const now = new Date();
            let diffMs = now.getTime() - enterDate.getTime();
            if (diffMs < 0) diffMs = 0;

            const diffMinutes = Math.floor(diffMs / 60000);
            const day = Math.floor(diffMinutes / (60 * 24));
            const hour = Math.floor((diffMinutes % (60 * 24)) / 60);
            const minute = diffMinutes % 60;

            let playTimeStr = "";
            if (day > 0) playTimeStr += `${day}天 `;
            if (hour > 0) playTimeStr += `${hour}小时 `;
            if (minute > 0) playTimeStr += `${minute}分钟`;
            if (playTimeStr === "") playTimeStr = "不到1分钟";

            setPlayTime(playTimeStr.trim());

            const totalHours = Math.ceil(diffMs / 3600000);
            const baseCost = calculateBaseCostByHours(totalHours);

            const vipLevel = getVipLevel(consumption);
            const vipDiscountFactor = getVipDiscountFactor(vipLevel);

            const finalCost = baseCost * vipDiscountFactor * discount;
            setEstimatedCharge(finalCost);
        };

        if (isAuthenticated && inStore && enterTime) {
            computePlayData();
            timer = setInterval(computePlayData, 60000);
        } else {
            setPlayTime("");
            setEstimatedCharge(0);
        }

        return () => timer && clearInterval(timer);
    }, [isAuthenticated, inStore, enterTime, discount, consumption]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsPortrait(window.innerHeight > window.innerWidth);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [expand]);

    if (isLoading) return <div className="flex justify-center items-center h-screen">加载中...</div>;
    if (!isAuthenticated) {
        window.location.href = "/";
        return null;
    }

    // 根据当前 page 显示对应的内容组件
    const renderContent = () => {
        if (page === 6) {
            return (
                <div className={`flex flex-col items-center space-y-4 w-full`}>
                    <div className="w-full max-w-4xl">
                        <UserCard
                            userId={userid}
                            nickname={nickname}
                            auth={auth}
                            discount={discount}
                            balance={balance}
                            consumption={consumption}
                            playcount={playcount}
                            playTime={playTime}
                            estimatedCharge={estimatedCharge > 0 ? estimatedCharge : undefined}
                            handleLogout={handleLogout}
                        />
                    </div>
                </div>
            );
        } else if (page === 1) {
            return (
                <div className={`flex flex-col ${isMobile ? 'items-center pb-12 max-w-full' : 'items-start'} space-y-4`}>
                        <PlayCard
                            inStore={inStore}
                            estimatedCharge={estimatedCharge > 0 ? estimatedCharge : undefined}
                            playTime={playTime}
                            onStatusChange={handleStatusChange}
                            staff={staffCount}
                            players={playersCount}
                        />
                        <Review />
                        <ContactCard />
                </div>
            );
        } else if (page === 4) {
            return (
                <div className={`flex flex-col ${isMobile ? 'items-center pb-12' : 'items-start'} space-y-4`}>
                    <div className="w-full max-w-lg">
                        <BaltopCard/>
                    </div>
                </div>
            );
        } else if (page === 5 && auth === "STAFF") {
            return (
                <div className={`flex flex-col ${isMobile ? 'items-center pb-12' : 'items-start'} space-y-4`}>
                    <div className="w-full max-w-4xl">
                        <AdminCard />
                    </div>
                    {/* 插入 UserVerifyCard 组件 */}
                    <div className="w-full max-w-4xl">
                        <UserVerifyCard />
                    </div>
                    <div className="w-full max-w-4xl">
                        <UserManageCard />
                    </div>
                </div>
            );
        } else if(page===2) {
            return <div className={`flex flex-col ${isMobile ? 'items-center pb-12' : 'items-start'} space-y-4`}>
                    <AppointmentComponent />
            </div>
        } else {
            // 其他页面简单返回一个空内容或提醒，这里根据需要自行扩展
            return <div>功能开发中...</div>;
        }
    };

    const siderWidth = expand ? 200 : 80;

    return (
        <Layout style={{minHeight: '100vh'}}>
            {!isMobile && (
                <Sider
                    collapsible
                    collapsed={!expand}
                    onCollapse={(collapsed) => setExpand(!expand)}
                    width={200}  // 展开时的宽度
                    collapsedWidth={56} // 收起时的宽度
                    style={{
                        position: 'fixed', // 固定侧边栏
                        top: 0,            // 顶部对齐
                        left: 0,           // 左侧对齐
                        bottom: 0,         // 底部对齐，确保侧边栏覆盖整个高度
                        zIndex: 1000,      // 确保在内容层之上
                    }}
                >
                    <XYwowLogo expand={expand}></XYwowLogo>
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[String(page)]}
                        onClick={handleMenuClick}
                        style={{ height: '100%', borderRight: 0 }}
                    >
                        {navItems.filter(item => item.show).map(item => (
                            <Menu.Item key={item.page} icon={item.icon}>
                                {item.label}
                            </Menu.Item>
                        ))}
                    </Menu>
                </Sider>
            )}

            <Layout style={{ marginLeft: isMobile ? 0 : expand ? 200 : 56, transition: 'all 0.3s' }}>
                <Content
                    style={{
                        margin: '24px',
                        overflow: 'initial',
                        display: 'flex',            // 使用 flexbox
                        justifyContent: 'center',   // 水平居中
                        alignItems: 'center',       // 垂直居中
                        minHeight: 'calc(100vh - 48px)', // 保证内容区域的高度至少为视口高度减去顶部导航的高度
                    }}
                >
                    {renderContent()}
                </Content>
            </Layout>

            {isMobile && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: '#fff',
                    borderTop: '1px solid #ddd',
                    zIndex: 999
                }}>
                    <Menu
                        mode="horizontal"
                        selectedKeys={[String(page)]}
                        onClick={handleMenuClick}
                        style={{ display: 'flex', justifyContent: 'space-around' }}
                    >
                        {navItems.filter(item => item.show).map(item => (
                            <Menu.Item key={item.page} icon={item.icon}>
                                <Text style={{ fontSize: '12px' }}>{item.label}</Text>
                            </Menu.Item>
                        ))}
                    </Menu>
                </div>
            )}
        </Layout>
    );
}
