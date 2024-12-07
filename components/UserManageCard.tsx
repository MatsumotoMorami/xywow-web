import React, { useEffect, useState } from "react";
import { Card, List, Button, Typography, Spin, message, Table, Modal } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

const url = "https://api.xywow.studio";
interface PlayLog {
    id: number;
    userId: string;
    enterTime: number; // 使用 number 类型
    exitTime: number;  // 使用 number 类型
    cost: number;
}

interface UserInfo {
    userId: string;
    name: string;
    auth: number;
    discount: number;
    money: number;
    spent: number;
    pc: number;
    billing: boolean;
}

export const UserManageCard: React.FC = () => {
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [playLogs, setPlayLogs] = useState<PlayLog[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    // 获取用户信息
    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("https://api.xywow.studio/prisma/userInfo", {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "获取用户信息失败.");
            }
            const result: UserInfo[] = await response.json();
            setUsers(result);
        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError(err.message);
            message.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 获取用户的 playlog
    const fetchPlayLogs = async (userId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`https://api.xywow.studio/admin/getplaylog?userId=${userId}`, {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "获取用户日志失败.");
            }
            const result: PlayLog[] = await response.json();
            setPlayLogs(result);
        } catch (err: any) {
            console.error("Error fetching play logs:", err);
            setError(err.message);
            message.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 点击用户时展开/收起并加载 playlog
    const handleUserClick = (userId: string) => {
        if (selectedUserId === userId) {
            setSelectedUserId(null);
            setPlayLogs([]); // 收起时清空 playlog 数据
        } else {
            setSelectedUserId(userId);
            fetchPlayLogs(userId); // 获取用户的 playlog
        }
    };

    // 提升用户权限
    const handlePromoteUser = async (userId: string) => {
        Modal.confirm({
            title: `确认提升用户 "${userId}" 的权限`,
            content: `您确定要提升用户 "${userId}" 的权限吗？`,
            okText: "确认",
            cancelText: "取消",
            onOk: async () => {
                try {
                    const response = await fetch("https://api.xywow.studio/admin/promoteUser", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ targetUserId: userId }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        message.success(data.message || "用户权限已提升.");
                        fetchUsers(); // 重新获取用户列表
                    } else {
                        message.error(data.error || "提升用户权限失败.");
                    }
                } catch (error: any) {
                    console.error("Error promoting user:", error);
                    message.error("提升用户权限时发生错误.");
                }
            },
        });
    };

    // 移除白名单
    const handleDeleteWhitelist = async (userId: string) => {
        try {
            const response = await fetch(`${url}/auth/whitelist`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userId }),
            });
            if (response.ok) {
                message.success("用户已成功从白名单移除.");
                fetchUsers(); // 重新获取用户列表
                setIsDeleteModalVisible(false);
            } else {
                const errorData = await response.json();
                message.error(errorData.error || "移除白名单失败.");
            }
        } catch (error: any) {
            console.error("Error removing from whitelist:", error);
            message.error("移除白名单时发生错误.");
        }
    };

    // playlog 表格列定义
    const columns = [
        {
            title: "入店时间",
            dataIndex: "enterTime",
            key: "enterTime",
            sorter: (a: PlayLog, b: PlayLog) => a.enterTime - b.enterTime,
            render: (text: number) => new Date(Number(text)).toLocaleString(),
        },
        {
            title: "离店时间",
            dataIndex: "exitTime",
            key: "exitTime",
            sorter: (a: PlayLog, b: PlayLog) => a.exitTime - b.exitTime,
            render: (text: number) => {
                let tempText = new Date(Number(text)).toLocaleString();
                if(tempText === "01/01/1970, 07:59:59") return "未离店";
                return tempText;
            },
        },
        {
            title: "消费金额",
            dataIndex: "cost",
            key: "cost",
            sorter: (a: PlayLog, b: PlayLog) => a.cost - b.cost,
            render: (_: any, record: PlayLog) => record.exitTime.toString() === "-1" ? "未离店" : record.cost,
        },
        {
            title: "在店时间",
            key: "playTime",
            render: (_: any, record: PlayLog) => {
                // 如果 exitTime 或 cost 为 -1，返回 "未离店"
                if (record.exitTime === -1 || record.cost === -1) {
                    return "未离店";
                }
                return `${(record.exitTime - record.enterTime) / 1000} 秒`;
            },
            sorter: (a: PlayLog, b: PlayLog) => (a.exitTime - a.enterTime) - (b.exitTime - b.enterTime),
        },
    ];
    return (
        <Card title="用户管理" bordered={false}>
            {isLoading ? (
                <Spin />
            ) : error ? (
                <Text type="danger">{error}</Text>
            ) : (
                <>
                    <List
                        itemLayout="horizontal"
                        dataSource={users}
                        renderItem={(user) => (
                            <div key={user.userId}>
                                <List.Item
                                    actions={[
                                        <Button type="link" onClick={() => handlePromoteUser(user.userId)}>
                                            提升权限
                                        </Button>,
                                        <Button type="link" onClick={() => handleDeleteWhitelist(user.userId)}>
                                            移除白名单
                                        </Button>,
                                        <Button type="link" onClick={() => handleUserClick(user.userId)}>
                                            {selectedUserId === user.userId ? "收起" : "展开"}
                                        </Button>,
                                    ]}
                                >
                                    <List.Item.Meta title={user.name} description={`ID: ${user.userId}`} />
                                </List.Item>
                                {selectedUserId === user.userId && (
                                    <Table
                                        dataSource={playLogs}
                                        columns={columns}
                                        rowKey="id"
                                        pagination={false}
                                        title={() => "用户游戏日志"}
                                    />
                                )}
                            </div>
                        )}
                    />
                </>
            )}
        </Card>
    );
};

export default UserManageCard;
