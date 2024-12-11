// components/AdminCard.tsx

import React from "react";
import { Card, Typography, Button, Modal, Form, Input, message } from "antd";
import { ReloadOutlined, PoweroffOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;

const url = "https://api.xywow.studio";
export const AdminCard: React.FC = () => {
    // 服务器控制操作
    const handleServerControl = async (command: string) => {
        Modal.confirm({
            title: `确认执行 "${command}" 命令`,
            content: `您确定要执行 "${command}" 命令吗？`,
            okText: "确认",
            cancelText: "取消",
            onOk: async () => {
                try {
                    const response = await fetch(`https://mai.xywow.studio${command}`, {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                    })

                    if (response.ok) {
                        message.success(await response.text() || `命令 "${command}" 执行成功.`);
                    } else {
                        message.error(response.statusText || `执行命令 "${command}" 失败.`);
                    }
                } catch (error: any) {
                    console.error("Error executing server control:", error);
                    message.error("执行服务器控制命令时发生错误.");
                }
            },
        });
    };

    // 白名单添加操作
    const handleAddWhitelist = async (userId: string) => {
        try {
            const response = await fetch(`${url}/auth/whitelist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userId }),
            });
            if (response.ok) {
                message.success("用户已成功添加至白名单.");
                // 这里可以通过事件或状态提升来通知 UserManageCard 重新获取用户列表
            } else {
                const errorData = await response.json();
                message.error(errorData.error || "添加白名单失败.");
            }
        } catch (error: any) {
            console.error("Error adding to whitelist:", error);
            message.error("添加白名单时发生错误.");
        }
    };

    // 白名单删除操作
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
                // 这里可以通过事件或状态提升来通知 UserManageCard 重新获取用户列表
            } else {
                const errorData = await response.json();
                message.error(errorData.error || "移除白名单失败.");
            }
        } catch (error: any) {
            console.error("Error removing from whitelist:", error);
            message.error("移除白名单时发生错误.");
        }
    };

    return (
        <Card
            title={<div className="text-xl font-bold">管理面板</div>}
            bordered={false}
            className="max-w-4xl mb-5 w-full"
        >
            {/* 服务器控制 */}
            <Title level={4}>服务器控制</Title>
            <div className="flex flex-wrap gap-2 mb-4">
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => handleServerControl("/")}
                    type="primary"
                >
                    测试连通性
                </Button>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => handleServerControl("/shut")}
                    type="primary"
                >
                    关闭HDD
                </Button>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => handleServerControl("/cn")}
                    type="primary"
                >
                    切换国服
                </Button>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => handleServerControl("/jp")}
                    type="primary"
                >
                    切换日服
                </Button>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => handleServerControl("/en")}
                    type="primary"
                >
                    切换国际服
                </Button>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => handleServerControl("/ongeki")}
                    type="primary"
                >
                    切换音击
                </Button>
                <Button
                    icon={<PoweroffOutlined />}
                    onClick={() => handleServerControl("/shutdown")}
                    type="primary"
                    danger
                >
                    关机
                </Button>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => handleServerControl("/restart")}
                    type="primary"
                    danger
                >
                    重启
                </Button>
            </div>

            {/* 白名单管理 */}
            <Title level={4}>白名单管理</Title>
            <div className="flex flex-wrap gap-2 mb-4">
                <Button
                    icon={<PlusOutlined />}
                    onClick={() => {
                        Modal.confirm({
                            title: "添加白名单",
                            content: (
                                <Form onFinish={(values) => handleAddWhitelist(values.userId)}>
                                    <Form.Item
                                        label="用户 QQ号"
                                        name="userId"
                                        rules={[{ required: true, message: "请输入用户 QQ号!" }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit">
                                            添加
                                        </Button>
                                    </Form.Item>
                                </Form>
                            ),
                            okButtonProps: { style: { display: "none" } },
                            cancelText: "取消",
                        });
                    }}
                    type="primary"
                >
                    添加白名单
                </Button>
                <Button
                    icon={<DeleteOutlined />}
                    onClick={() => {
                        Modal.confirm({
                            title: "移除白名单",
                            content: (
                                <Form onFinish={(values) => handleDeleteWhitelist(values.userId)}>
                                    <Form.Item
                                        label="用户 QQ号"
                                        name="userId"
                                        rules={[{ required: true, message: "请输入用户 QQ号!" }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" danger htmlType="submit">
                                            移除
                                        </Button>
                                    </Form.Item>
                                </Form>
                            ),
                            okButtonProps: { style: { display: "none" } },
                            cancelText: "取消",
                        });
                    }}
                    type="primary"
                    danger
                >
                    移除白名单
                </Button>
            </div>
        </Card>
    );
};

export default AdminCard;
