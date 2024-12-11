// src/components/Login.tsx
'use client';

import React, { useState } from 'react';
import forge from 'node-forge';
import { Form, Input, Button, Typography, Modal, Checkbox, message } from 'antd';

const { Text } = Typography;
const url = "https://api.xywow.studio"; // 或使用环境变量 process.env.NEXT_PUBLIC_SERVER_URL

export const Login: React.FC = () => {
    const [errMsg, setErrMsg] = useState('');
    const [errMsgIsShow, setErrMsgIsShow] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [pendingLoginData, setPendingLoginData] = useState<{ userId: string, pwd: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 处理表单提交
    const handleSubmit = async (values: { userId: string, pwd: string }) => {
        const { userId, pwd } = values;

        // 检查 QQ号和密码是否相同
        if (userId === pwd) {
            setPendingLoginData({ userId, pwd });
            setIsModalVisible(true);
            return;
        }

        // 如果不相同，直接执行登录逻辑
        await performLogin(userId, pwd);
    };

    // 执行登录逻辑的函数
    const performLogin = async (userId: string, pwd: string) => {
        setIsSubmitting(true);
        try {
            // 获取公钥
            const res = await fetch(`${url}/auth/public-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (res.status === 404) {
                setErrMsg("用户不存在");
                setErrMsgIsShow(true);
                setIsSubmitting(false);
                return;
            }

            const { publicKey } = await res.json();
            const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
            const encryptedPwd = forge.util.encode64(publicKeyObj.encrypt(pwd, 'RSA-OAEP'));

            // 发送登录请求
            const loginResponse = await fetch(`${url}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, encryptedPwd }),
                credentials: 'include'
            });

            if (loginResponse.status === 200) {
                setErrMsg("登录成功!");
                setErrMsgIsShow(true);
                window.location.href = "/dashboard";
            } else if (loginResponse.status === 401) {
                setErrMsg("密码错误!");
                setErrMsgIsShow(true);
            } else {
                const errorData = await loginResponse.json();
                setErrMsg(errorData.error || "登录失败!");
                setErrMsgIsShow(true);
            }
        } catch (error) {
            console.error('Error:', error);
            setErrMsg("登录失败!");
            setErrMsgIsShow(true);
        }
        setIsSubmitting(false);
    };

    // 处理确认窗口中的“继续登录”按钮点击
    const handleContinueLogin = async () => {
        if (pendingLoginData) {
            const { userId, pwd } = pendingLoginData;
            setIsModalVisible(false);
            setIsConfirmed(false);
            setPendingLoginData(null);
            await performLogin(userId, pwd);
        }
    };

    return (
        <>
            <Form onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    label="QQ号"
                    name="userId"
                    rules={[{ required: true, message: '请输入QQ号' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="密码"
                    name="pwd"
                    rules={[{ required: true, message: '请输入密码' }]}
                >
                    <Input.Password />
                </Form.Item>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{borderRadius: '8px', marginRight: '10px'}}
                            loading={isSubmitting}
                        >
                            LOGIN
                        </Button>
                    </Form.Item>
                    {errMsgIsShow && (
                        <Text
                            type="danger"
                            style={{
                                marginLeft: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                height: '32px'  // 强制让错误消息的高度和按钮相同
                            }}
                        >
                            {errMsg}
                        </Text>
                    )}
                </div>


            </Form>

            {/* 更改密码提醒 Modal */}
            <Modal
                title="更改密码"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                        取消
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        disabled={!isConfirmed}
                        onClick={handleContinueLogin}
                    >
                        继续登录
                    </Button>,
                ]}
                destroyOnClose
                // 确保 Modal 的 zIndex 高于其他元素
                style={{ zIndex: 1000 }}
                bodyStyle={{ padding: '24px' }}
                maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
                <Text>您目前使用的是默认密码，</Text>
                <br />
                <Text>请前往“个人信息 - 更改密码”对密码进行更改。</Text>
                <br /><br />
                <Checkbox checked={isConfirmed} onChange={(e) => setIsConfirmed(e.target.checked)}>
                    我已确认
                </Checkbox>
            </Modal>
        </>
    );
};
