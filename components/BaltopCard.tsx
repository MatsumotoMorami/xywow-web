// components/BaltopCard.tsx
import React, { useEffect, useState } from "react";
import { Card, Typography, List, message, Spin, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface BaltopUser {
    name: string;
    spent: number;
}

interface BaltopResponse {
    topUsers: BaltopUser[];
    totalPlayers: number;
}

const url = "https://api.xywow.studio";
export const BaltopCard: React.FC = () => {
    const [data, setData] = useState<BaltopResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBaltop = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("https://api.xywow.studio/store/baltop", {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "获取消费排行榜失败.");
            }
            const result: BaltopResponse = await response.json();
            setData(result);
        } catch (err: any) {
            console.error("Error fetching baltop:", err);
            setError(err.message);
            message.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBaltop();
    }, []);

    if (isLoading) {
        return (
            <Card
                title={<div className="text-xl font-bold">消费排行榜</div>}
                bordered={false}
                className="max-w-md mb-5 w-full"
                extra={
                    <Button icon={<ReloadOutlined />} onClick={fetchBaltop} />
                }
            >
                <Spin />
            </Card>
        );
    }

    if (error) {
        return (
            <Card
                title={<div className="text-xl font-bold">消费排行榜</div>}
                bordered={false}
                className="max-w-md mb-5 w-full"
                extra={
                    <Button icon={<ReloadOutlined />} onClick={fetchBaltop} />
                }
            >
                <Text type="danger">{error}</Text>
            </Card>
        );
    }

    return (
        <Card
            title={<div className="text-xl font-bold">消费排行榜</div>}
            bordered={false}
            className="w-[40vw] min-w-[320px] mb-5"
            extra={
                <Button icon={<ReloadOutlined />} onClick={fetchBaltop} />
            }
        >
            <Text>共有 {data?.totalPlayers} 名玩家</Text>
            <List
                dataSource={data?.topUsers}
                renderItem={(item, index) => (
                    <List.Item>
                        <Text strong>{index + 1}. </Text>
                        <Text>{item.name.padEnd(10, ' ')}</Text>
                        <Text> ￥{item.spent.toFixed(2)}</Text>
                    </List.Item>
                )}
            />
        </Card>
    );
};
