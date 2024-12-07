import React, { useState } from 'react';
import forge from 'node-forge';
import { Form, Input, Button, Typography } from 'antd';

const { Text } = Typography;
const url = "https://api.xywow.studio";

export const Login: React.FC = () => {
    const [errMsg, setErrMsg] = useState('');
    const [errMsgIsShow, setErrMsgIsShow] = useState(false);

    const handleSubmit = async (values: { userId: string, pwd: string }) => {
        const { userId, pwd } = values;
        try {
            const res = await fetch(`${url}/auth/public-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (res.status === 404) {
                setErrMsg("用户不存在");
                setErrMsgIsShow(true);
                return;
            }

            const { publicKey } = await res.json();
            const encryptedPwd = forge.util.encode64(forge.pki.publicKeyFromPem(publicKey).encrypt(pwd, 'RSA-OAEP'));

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
            }
        } catch (error) {
            console.error('Error:', error);
            setErrMsg("登录失败!");
            setErrMsgIsShow(true);
        }
    };

    return (
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ borderRadius: '8px', marginRight: '10px' }}>
                        LOGIN
                    </Button>
                </Form.Item>
                {errMsgIsShow && <Text type="danger">{errMsg}</Text>}
            </div>
        </Form>
    );
};
