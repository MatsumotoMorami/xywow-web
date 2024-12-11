// UserManageCard.tsx

import React, { useEffect, useState } from "react";
import { Card, List, Button, Typography, Spin, message, Table, Modal, Form, Input, Select, InputNumber } from "antd";
import {PlusOutlined, DeleteOutlined, EditOutlined, DownOutlined, UpOutlined, ReloadOutlined} from "@ant-design/icons";
import forge from "node-forge";

const { Text } = Typography;
const { Option } = Select;

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

    // 状态变量用于控制“更改用户信息”模态框
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
    const [form] = Form.useForm();

    // 删除白名单确认模态框控制
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);

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

    // 点击箭头时展开/收起并加载 playlog
    const handleUserClick = (userId: string) => {
        if (selectedUserId === userId) {
            setSelectedUserId(null);
            setPlayLogs([]); // 收起时清空 playlog 数据
        } else {
            setSelectedUserId(userId);
            fetchPlayLogs(userId); // 获取用户的 playlog
        }
    };

    // 更改用户信息按钮的处理函数
    const handleChangeUserInfo = (user: UserInfo) => {
        setCurrentUser(user);
        setIsModalVisible(true);
        // 预填充表单
        form.setFieldsValue({
            userId: user.userId,
            name: user.name,
            auth: user.auth,
            discount: user.discount,
            money: user.money,
            pwd: "",
        });
    };

    // 提交更改用户信息表单
    const handleFormSubmit = async (values: any) => {
        const { userId, name, auth, discount, money, pwd } = values;

        let encryptedPwd = undefined;

        if (pwd) {
            try {
                // 获取用户的公钥
                const res = await fetch(`${url}/auth/public-key`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                });

                if (res.status === 404) {
                    message.error("用户不存在");
                    return;
                }

                const { publicKey } = await res.json();

                // 使用公钥加密密码
                const rsa = forge.pki.publicKeyFromPem(publicKey);
                const encrypted = rsa.encrypt(pwd, 'RSA-OAEP');
                encryptedPwd = forge.util.encode64(encrypted);
            } catch (error: any) {
                console.error("Error encrypting password:", error);
                message.error("密码加密失败.");
                return;
            }
        }

        // 构建请求体
        const requestBody: any = {
            userId,
            name,
            auth,
            discount,
            money,
        };

        if (encryptedPwd) {
            requestBody.encryptedPwd = encryptedPwd;
        }

        try {
            const response = await fetch(`${url}/auth/updateUserDetails`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const data = await response.json();
                message.success(data.message || "用户信息已更新.");
                setIsModalVisible(false);
                fetchUsers(); // 重新获取用户列表
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "更新用户信息失败.");
            }
        } catch (error: any) {
            console.error("Error updating user info:", error);
            message.error(error.message || "更新用户信息时发生错误.");
        }
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
                setUserIdToDelete(null);
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
            render: (text: number) => new Date(Number(text)).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
        },
        {
            title: "离店时间",
            dataIndex: "exitTime",
            key: "exitTime",
            sorter: (a: PlayLog, b: PlayLog) => a.exitTime - b.exitTime,
            render: (text: number) => {
                let tempText = new Date(Number(text)).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
                if (tempText === "1970/1/1 07:59:59") return "未离店";
                return tempText;
            },
        },
        {
            title: "消费金额",
            dataIndex: "cost",
            key: "cost",
            sorter: (a: PlayLog, b: PlayLog) => a.cost - b.cost,
            render: (_: any, record: PlayLog) => record.exitTime.toString() === "-1" ? "未正确离店" : record.cost,
        },
        {
            title: "在店时间",
            key: "playTime",
            render: (_: any, record: PlayLog) => {
                // 如果 exitTime 或 cost 为 -1，返回 "未离店"
                if (record.exitTime === -1 || record.cost === -1) {
                    return "未正确离店";
                }

                // 计算在店时间
                const playDuration = (record.exitTime - record.enterTime) / 1000; // 转换为秒
                const days = Math.floor(playDuration / (60 * 60 * 24)); // 计算天数
                const hours = Math.floor((playDuration % (60 * 60 * 24)) / 3600); // 计算小时
                const minutes = Math.floor((playDuration % 3600) / 60); // 计算分钟
                const seconds = Math.floor(playDuration % 60); // 计算秒数

                // 格式化为 x天x小时x分钟x秒
                let result = "";
                if (days > 0) result += `${days}天`;
                if (hours > 0 || days > 0) result += `${hours}小时`; // 当天数不为0时，即使小时为0也显示
                if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}分钟`; // 当小时不为0时，分钟为0也要显示
                result += `${seconds}秒`;

                return result;
            },
            sorter: (a: PlayLog, b: PlayLog) => (a.exitTime - a.enterTime) - (b.exitTime - b.enterTime),
        },
    ];

    return (
        <Card title="用户管理" bordered={false} extra={<Button onClick={async()=>{await fetchUsers()}} icon={<ReloadOutlined />} >刷新</Button>}>
            {isLoading ? (
                <Spin size="large" />
            ) : error ? (
                <Text type="danger">{error}</Text>
            ) : (
                <List
                    itemLayout="horizontal" // 设置为 horizontal 以使 actions 在右侧
                    dataSource={users}
                    renderItem={(user) => (
                        <div key={user.userId}>
                            <List.Item
                                actions={[
                                    <Button
                                        type="link"
                                        onClick={() => handleUserClick(user.userId)}
                                        icon={selectedUserId === user.userId ? <UpOutlined /> : <DownOutlined />}
                                        aria-label={selectedUserId === user.userId ? "收起" : "展开"}
                                    />,
                                ]}
                            >
                                <List.Item.Meta
                                    title={user.name}
                                    description={`ID: ${user.userId}`}
                                />
                            </List.Item>

                            {/* 判断用户tab是否展开，只有在展开时显示按钮和表格 */}
                            {selectedUserId === user.userId && (
                                <div style={{ paddingLeft: '24px', paddingBottom: '16px', paddingTop:'16px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Button
                                            type="primary"
                                            icon={<EditOutlined />}
                                            onClick={() => handleChangeUserInfo(user)}
                                            style={{ marginRight: '8px' }}
                                        >
                                            更改用户信息
                                        </Button>
                                        <Button
                                            type="default"
                                            icon={<DeleteOutlined />}
                                            onClick={() => {
                                                setUserIdToDelete(user.userId);
                                                setIsDeleteModalVisible(true);
                                            }}
                                        >
                                            移除白名单
                                        </Button>
                                    </div>
                                    <Table
                                        dataSource={playLogs}
                                        columns={columns}
                                        rowKey="id"
                                        pagination={false}
                                        size="small"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                />
            )}

            {/* 更改用户信息模态框 */}
            <Modal
                title={currentUser ? `更改用户信息 - ${currentUser.userId}` : "更改用户信息"}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                {currentUser && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFormSubmit}
                        initialValues={{
                            userId: currentUser.userId,
                            name: currentUser.name,
                            auth: currentUser.auth,
                            discount: currentUser.discount,
                            money: currentUser.money,
                            pwd: "",
                        }}
                    >
                        <Form.Item name="userId" label="用户ID" hidden>
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="name"
                            label="用户名"
                            rules={[{ required: true, message: '请输入用户名' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="auth"
                            label="用户权限"
                            rules={[{ required: true, message: '请选择用户权限' }]}
                        >
                            <Select>
                                <Option value={0}>STAFF</Option>
                                <Option value={1}>普通玩家</Option>
                                <Option value={2}>警告</Option>
                                <Option value={3}>封禁</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="discount"
                            label="用户折扣"
                            rules={[{ required: true, message: '请输入用户折扣' }]}
                        >
                            <InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="money"
                            label="用户余额"
                            rules={[{ required: true, message: '请输入用户余额' }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="pwd"
                            label="用户密码"
                            rules={[{ required: false, message: '可选，输入新密码' }]}
                        >
                            <Input.Password placeholder="输入新密码（留空则不更改）" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>
                                提交
                            </Button>
                            <Button onClick={() => setIsModalVisible(false)}>
                                取消
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Modal>

            {/* 移除白名单确认模态框 */}
            <Modal
                title="确认移除白名单"
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                onOk={() => {
                    if (userIdToDelete) {
                        handleDeleteWhitelist(userIdToDelete);
                    }
                }}
                okText="确认"
                cancelText="取消"
            >
                <p>您确定要将用户ID {userIdToDelete} 从白名单中移除吗？</p>
            </Modal>
        </Card>
    );

};

export default UserManageCard;
