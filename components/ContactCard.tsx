// src/components/ContactCard.tsx
"use client";

import React from 'react';
import {Button, Card, notification, Typography} from 'antd';
import {CopyOutlined} from "@ant-design/icons";
const { Text } = Typography;

interface ContactCardProps {
    userId: string;
}

const handleCopy = (qq: string) => {
    navigator.clipboard.writeText(qq);
    notification.success({
        message: '复制成功',
        description: `已复制QQ号: ${qq}`,
        placement: 'topRight', // 顶部显示
    });
};

const contactData = [
    {
        name: "xy0v0",
        qq: "2507788589",
        qqNickname: "xy0v0",
    },
    {
        name: "忆梦",
        qq: "2803355799",
        qqNickname: "忆梦",
    },
];

export function ContactCard() {
    return (
        <Card title="联系我们" bordered={false} className="w-[40vw] min-w-[320px]">
            <div className="flex justify-around">
                {contactData.map((contact, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <img
                            src={`https://q2.qlogo.cn/headimg_dl?dst_uin=${contact.qq}&spec=640`}
                            className="w-20 h-20 rounded-full"
                            alt="头像"
                        />
                        <Text className="text-gray-500">{contact.qqNickname}</Text>
                        <Text className="text-gray-400">{contact.qq}</Text>
                        <Button
                            icon={<CopyOutlined />}
                            className="mt-2"
                            onClick={() => handleCopy(contact.qq)}
                            type="link"
                        >
                            复制QQ号
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );
}