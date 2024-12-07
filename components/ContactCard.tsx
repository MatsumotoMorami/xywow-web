// src/components/ContactCard.tsx
"use client";

import React from 'react';
import { Card, Typography } from 'antd';
const { Text } = Typography;

interface ContactCardProps {
    userId: string;
}

export const ContactCard: React.FC<ContactCardProps> = ({ userId }) => (
    <Card title="联系我们" bordered={false} className="max-w-md w-full">
        <div className="flex justify-center mb-4">
            <img
                src={`https://q2.qlogo.cn/headimg_dl?dst_uin=${userId}&spec=640`}
                className="w-20 h-20 rounded-full"
                alt="头像"
            />
        </div>
        <Text>欢迎通过以下方式与我们联系：</Text>
        <br />
        <Text>Email: support@xywow.studio</Text>
    </Card>
);
