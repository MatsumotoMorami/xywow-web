// src/components/UserCard.tsx
import React from "react";
import { Card, Progress, Typography, Button, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { confirm } = Modal;

interface UserCardProps {
    userId: string;
    nickname: string;
    auth: string | number;
    discount: number;
    balance: number;
    consumption: number;
    playcount: number;
    playTime: string;
    estimatedCharge?: number;
    handleLogout: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
                                                      userId,
                                                      nickname,
                                                      auth,
                                                      discount,
                                                      balance,
                                                      consumption,
                                                      playcount,
                                                      playTime,
                                                      estimatedCharge,
                                                      handleLogout
                                                  }) => {
    const vipLevel = Math.floor(consumption / 50) > 100 ? 100 : Math.floor(consumption / 50);
    const vipDiscountFactor = 1.0 - (vipLevel * 0.005);
    const finalDiscount = vipDiscountFactor * discount;

    let discountText = "无折扣";
    if (finalDiscount === 0) discountText = "免费";
    else if (finalDiscount > 0 && finalDiscount < 1) discountText = `${(finalDiscount * 10).toFixed(1)}折`;

    const nextLevelThreshold = (vipLevel < 100) ? (vipLevel + 1) * 50 : null;
    const progressPercent = vipLevel < 100 && nextLevelThreshold ? (consumption / nextLevelThreshold) * 100 : 100;

    // 修改后的登出处理函数，包含确认弹窗
    const showLogoutConfirm = () => {
        confirm({
            title: '确认登出',
            icon: <ExclamationCircleOutlined />,
            content: '您确定要登出吗？',
            okText: '确认',
            okType: 'primary',
            cancelText: '取消',
            onOk() {
                handleLogout();
            },
            onCancel() {
                // 用户取消登出，可以添加其他逻辑或保持空白
            },
        });
    };

    return (
        <Card
            title={<div className="text-center">{nickname}</div>} // 这里修改了标题的渲染方式
            bordered={false}
            className="max-w-md mb-5 w-full justify-center"
        >
            <div className="flex justify-center p-2">
                <img
                    src={`https://q2.qlogo.cn/headimg_dl?dst_uin=${userId}&spec=640`}
                    className="w-24 h-24 rounded-full"
                    alt="用户头像"
                />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
                <Text strong>QQ号：</Text><Text>{userId}</Text>
                <Text strong>权限组：</Text><Text>{auth}</Text>
                <Text strong>折扣：</Text><Text>{discountText}</Text>
                <Text strong>余额：</Text><Text>￥{balance.toFixed(2)}</Text>
                <Text strong>累计消费：</Text><Text>￥{consumption.toFixed(2)}</Text>
                <Text strong>来店次数：</Text><Text>{playcount}</Text>
                {estimatedCharge !== undefined && (
                    <>
                        <Text strong>预计消费：</Text><Text>￥{estimatedCharge.toFixed(2)}</Text>
                    </>
                )}
                {playTime && (
                    <>
                        <Text strong>游玩时间：</Text><Text>{playTime}</Text>
                    </>
                )}
            </div>
            <div className="mt-4">
                <Text strong>VIP 等级：</Text> VIP {vipLevel}
                <Progress percent={progressPercent} showInfo={false} className="mt-2" />
                <Text type="secondary">
                    {consumption}/{nextLevelThreshold ?? 'Max'} RMB
                </Text>
            </div>
            {/* 居中按钮容器 */}
            <div className="mt-4 flex justify-center">
                <Button onClick={showLogoutConfirm} type="primary">登出</Button>
            </div>
        </Card>
    );
};
