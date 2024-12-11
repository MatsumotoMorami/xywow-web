// src/components/PlayCard.tsx
import React, { useState } from "react";
import { Card, Typography, Button, message, Modal } from "antd";
import { PlayCircleOutlined, StopOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { confirm } = Modal;

interface PlayCardProps {
    inStore: boolean;
    estimatedCharge?: number;
    playTime?: string;
    onStatusChange: () => void; // 调用后重新获取用户信息
    staff: number; // 父组件传入的 Staff 数量
    players: number; // 父组件传入的 玩家 数量
}

export const PlayCard: React.FC<PlayCardProps> = ({ inStore, estimatedCharge = 0, playTime, onStatusChange, staff, players }) => {
    const [loading, setLoading] = useState<boolean>(false);

    const handleEnter = () => {
        confirm({
            title: "确认进店",
            content: "确定要进店吗？",
            okText: "进店",
            cancelText: "取消",
            onOk: async () => {
                setLoading(true);
                try {
                    const response = await fetch("https://api.xywow.studio/store/enter", {
                        method: 'POST',
                        credentials: 'include',
                    });
                    const data = await response.json();
                    if (response.ok) {
                        message.success(data.message || "已成功进店.");
                        onStatusChange(); // 通知父组件更新状态(由父组件重新查询/store/status)
                    } else {
                        message.error(data.message || "进店失败.");
                    }
                } catch (error: any) {
                    console.error("Error entering store:", error);
                    message.error("进店时发生错误.");
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleExit = () => {
        confirm({
            title: "确认离店",
            content: "确定要离店吗？",
            okText: "离店",
            cancelText: "取消",
            onOk: async () => {
                setLoading(true);
                try {
                    const response = await fetch("https://api.xywow.studio/store/exit", {
                        method: 'POST',
                        credentials: 'include',
                    });
                    const data = await response.json();
                    if (response.ok) {
                        message.success(data.message || "已成功离店.");
                        onStatusChange(); // 通知父组件更新状态(由父组件重新查询/store/status)
                    } else {
                        message.error(data.message || "离店失败.");
                    }
                } catch (error: any) {
                    console.error("Error exiting store:", error);
                    message.error("离店时发生错误.");
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const title = inStore ? "已入店" : "未入店";

    return (
        <Card
            title={<div className="text-xl font-bold">{title}</div>}
            bordered={false}
            className="w-[40vw] min-w-[320px]  mb-5"
        >
            {/* 显示店内 STAFF 和玩家数量 */}
            <div className="mb-4">
                <Text strong>店内状态：</Text>
                <Text>Staff: {staff} | 玩家: {players}</Text>
            </div>

            {/* 显示游玩信息 */}
            {inStore && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                    <Text strong>预计消费：</Text>
                    <Text>￥{estimatedCharge.toFixed(2)}</Text>
                    <Text strong>游玩时间：</Text>
                    <Text>{playTime}</Text>
                </div>
            )}

            {/* 进店/离店按钮 */}
            <div className="mt-4 flex justify-center">
                {!inStore ? (
                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={handleEnter}
                        loading={loading}
                        style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                    >
                        进店
                    </Button>
                ) : (
                    <Button
                        type="primary"
                        danger
                        icon={<StopOutlined />}
                        onClick={handleExit}
                        loading={loading}
                        style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
                    >
                        离店
                    </Button>
                )}
            </div>
        </Card>
    );
};
