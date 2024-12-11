// src/components/UserCard.tsx
import React, { useState } from "react";
import {Card, Progress, Typography, Button, Modal, Form, Input, message, Divider} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import forge from 'node-forge';

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

    // State for Change Password Modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 显示更改密码弹窗
    const showChangePasswordModal = () => {
        setIsModalVisible(true);
    };

    // 关闭更改密码弹窗
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    // 处理更改密码提交
    const handleChangePassword = async (values: { oldPwd: string; newPwd: string; confirmNewPwd: string }) => {
        const { oldPwd, newPwd } = values;
        setIsSubmitting(true);
        try {
            // 获取公钥
            const res = await fetch(`https://api.xywow.studio/auth/public-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!res.ok) {
                if (res.status === 404) {
                    message.error("用户未找到");
                } else {
                    message.error("获取公钥失败");
                }
                setIsSubmitting(false);
                return;
            }

            const { publicKey } = await res.json();
            const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
            const encryptedOldPwd = forge.util.encode64(publicKeyObj.encrypt(oldPwd, 'RSA-OAEP'));
            const encryptedNewPwd = forge.util.encode64(publicKeyObj.encrypt(newPwd, 'RSA-OAEP'));

            // 调用更改密码 API
            const changePwdRes = await fetch(`https://api.xywow.studio/auth/changePassword`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    encryptedOldPwd,
                    encryptedNewPwd
                }),
                credentials: 'include'
            });

            if (changePwdRes.ok) {
                message.success("密码已成功更改");
                setIsModalVisible(false);
                form.resetFields();
            } else {
                const errorData = await changePwdRes.json();
                message.error(errorData.error || "更改密码失败");
            }
        } catch (error) {
            console.error('Error:', error);
            message.error("更改密码失败");
        }
        setIsSubmitting(false);
    };

    return (
        <Card
            title={<div className="text-center">{nickname}</div>}  // 这里修改了标题的渲染方式
            bordered={false}
            className="mb-5 justify-center min-w-[200px] max-w-4xl w-full mx-auto" // mx-auto 用于水平居中
        >
            <div className="flex justify-center p-2">
                <img
                    src={`https://q2.qlogo.cn/headimg_dl?dst_uin=${userId}&spec=640`}
                    className="w-24 h-24 rounded-full"
                    alt="用户头像"
                />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-center">
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
            <Divider></Divider>
            <div className="mt-4 text-left">  {/* 设置 text-left 来让 VIP 等级左对齐 */}
                <Text strong>VIP 等级：</Text> VIP {vipLevel}
                <Progress percent={progressPercent} showInfo={false} className="mt-2" />
                <Text type="secondary">
                    {consumption}/{nextLevelThreshold ?? 'Max'} RMB
                </Text>
            </div>
            {/* 居中按钮容器 */}
            <div className="mt-4 flex justify-center space-x-4">
                <Button onClick={handleLogout} type="primary">登出</Button>
                <Button onClick={showChangePasswordModal} type="default">更改密码</Button>
            </div>

            {/* 更改密码 Modal */}
            <Modal
                title="更改密码"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleChangePassword}
                >
                    <Form.Item
                        label="原密码"
                        name="oldPwd"
                        rules={[{ required: true, message: '请输入原密码' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="新密码"
                        name="newPwd"
                        rules={[
                            { required: true, message: '请输入新密码' },
                            { min: 6, message: '新密码至少为6位' }
                        ]}
                        hasFeedback
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="确认新密码"
                        name="confirmNewPwd"
                        dependencies={['newPwd']}
                        hasFeedback
                        rules={[
                            { required: true, message: '请确认新密码' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPwd') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次密码不一致'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item shouldUpdate>
                        {() => (
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isSubmitting}
                                disabled={
                                    !form.isFieldsTouched(['oldPwd', 'newPwd', 'confirmNewPwd'], true) ||
                                    form.getFieldsError().filter(({ errors }) => errors.length).length > 0
                                }
                                block
                            >
                                提交
                            </Button>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};
