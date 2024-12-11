// components/UserVerifyCard.tsx
import React, { useEffect, useState } from 'react';
import { Divider, Table, Button, message as AntMessage, Spin, Modal, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;
const SERVER_URL = "https://api.xywow.studio"; // 确保此 URL 与您的后端 API 地址匹配

interface UnverifiedUser {
    userId: string;
    userName: string;
    message?: string;
}

const UserVerifyCard: React.FC = () => {
    const [users, setUsers] = useState<UnverifiedUser[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null);

    // 获取未验证的用户列表
    const fetchUnverifiedUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${SERVER_URL}/auth/unverifiedUsers`, {
                method: 'GET',
                credentials: 'include', // 如果需要发送 cookies
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data: UnverifiedUser[] = await response.json();
                setUsers(data);
            } else {
                const errorData = await response.json();
                AntMessage.error(`获取未验证用户失败: ${errorData.error || '未知错误'}`);
            }
        } catch (error) {
            console.error('获取未验证用户错误:', error);
            AntMessage.error('获取未验证用户时发生错误');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnverifiedUsers();
    }, []);

    // 验证用户
    const verifyUser = (userId: string) => {
        Modal.confirm({
            title: '确认验证用户',
            icon: <ExclamationCircleOutlined />,
            content: `您确定要验证并注册用户 ${userId} 吗？`,
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                setVerifyingUserId(userId);
                try {
                    const response = await fetch(`${SERVER_URL}/auth/verifyAndRegisterUser`, {
                        method: 'POST',
                        credentials: 'include', // 如果需要发送 cookies
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        AntMessage.success(`用户 ${userId} 已成功注册。`);
                        // 移除已验证的用户
                        setUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));
                    } else {
                        AntMessage.error(`验证失败: ${data.error || '未知错误'}`);
                    }
                } catch (error) {
                    console.error('验证用户错误:', error);
                    AntMessage.error('验证用户时发生错误');
                } finally {
                    setVerifyingUserId(null);
                }
            },
        });
    };

    const columns = [
        {
            title: 'QQ号',
            dataIndex: 'userId',
            key: 'userId',
            render: (text: string) => <Text>{text}</Text>,
        },
        {
            title: '用户名',
            dataIndex: 'userName',
            key: 'userName',
            render: (text: string) => <Text>{text}</Text>,
        },
        {
            title: '验证消息',
            dataIndex: 'message',
            key: 'message',
            render: (text: string | undefined) => <Text>{text || '无'}</Text>,
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: UnverifiedUser) => (
                <Button
                    type="primary"
                    onClick={() => verifyUser(record.userId)}
                    loading={verifyingUserId === record.userId}
                >
                    验证
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
            <Text strong style={{ fontSize: '18px' }}>注册审核</Text>
            <Divider />
            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin tip="加载中..." />
                </div>
            ) : (
                <Table
                    dataSource={users}
                    columns={columns}
                    rowKey="userId"
                    pagination={{ pageSize: 5 }}
                />
            )}
        </div>
    );
};

export default UserVerifyCard;
