// Register.tsx
import React, { useState } from 'react';
import { Form, Input, Button, message as AntMessage } from 'antd';
import { LockOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';

interface RegisterProps {}

const Register: React.FC<RegisterProps> = () => {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const { userId, userName, password, message } = values;

            const response = await fetch('https://api.xywow.studio/auth/register', {
                method: 'POST',
                credentials: 'include', // 如果需要发送 cookies
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    userName,
                    password,
                    message: message || '',
                }),
            });

            const data = await response.json();

            if (response.status === 201) {
                AntMessage.success('注册请求已提交，等待管理员验证。');
            } else {
                AntMessage.error(`注册请求失败: ${data.error || '请稍后再试。'}`);
            }
        } catch (error: any) {
            AntMessage.error('注册请求失败，请稍后再试。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '2vh' }}>
            <Form
                name="register"
                onFinish={onFinish}
                layout="vertical"
                initialValues={{ remember: true }}
            >
                <Form.Item
                    label="QQ号"
                    name="userId"
                    rules={[
                        { required: true, message: '请输入您的 QQ号!' },
                        { pattern: /^\d+$/, message: 'QQ号必须为数字!' },
                    ]}
                >
                    <Input prefix={<UserOutlined />} placeholder="请输入您的 QQ号" />
                </Form.Item>

                <Form.Item
                    label="用户名"
                    name="userName"
                    rules={[{ required: true, message: '请输入您的用户名!' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="请输入您的用户名" />
                </Form.Item>

                <Form.Item
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: '请输入您的密码!' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="请输入您的密码" />
                </Form.Item>

                <Form.Item
                    label="验证消息"
                    name="message"
                    rules={[{ required: false }]}
                >
                    <Input prefix={<MessageOutlined />} placeholder="请输入验证消息 (可选)" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        注册
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Register;
