import React, { useEffect, useState } from 'react';
import { Card, Table, message } from 'antd';
import moment from 'moment';
import axios from 'axios';

const title = '预约情况';
interface Game {
    id: number;
    name: string;
}

interface Schedule {
    [date: string]: {
        [timeRange: string]: number;
    };
}

const url = "https://api.xywow.studio";

const Review: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [scheduleData, setScheduleData] = useState<{ [gameId: number]: Schedule }>({});
    const [loading, setLoading] = useState<boolean>(false);

    // 定义要显示的时间段
    const TIME_SLOTS = [
        { key: '10:00-12:00', label: '10:00-12:00' },
        { key: '12:00-14:00', label: '12:00-14:00' },
        { key: '14:00-16:00', label: '14:00-16:00' },
        { key: '16:00-18:00', label: '16:00-18:00' },
    ];

    // 获取游戏列表
    const fetchGames = async () => {
        try {
            const response = await axios.get<Game[]>(`${url}/games`, { withCredentials: true });
            setGames(response.data);
            // 获取所有游戏的预约情况
            await Promise.all(response.data.map(game => fetchSchedule(game.id)));
        } catch (error: any) {
            message.error('获取游戏列表失败');
            console.error(error);
        }
    };

    // 获取预约情况
    const fetchSchedule = async (gameId: number) => {
        setLoading(true);
        try {
            const response = await axios.get<{ schedule: Schedule }[]>(
                `${url}/appointments/schedule`,
                {
                    params: { gameId },
                    withCredentials: true,
                }
            );

            if (response.data.length > 0) {
                setScheduleData(prev => ({
                    ...prev,
                    [gameId]: response.data[0].schedule
                }));
            }
        } catch (error: any) {
            message.error('获取预约情况失败');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    // 构建表格列
    const columns = [
        {
            title: '时段',
            dataIndex: 'timeSlot',
            key: 'timeSlot',
            fixed: 'left' as const,
        },
        ...games.map(game => ({
            title: game.name,
            dataIndex: game.id.toString(),
            key: game.id.toString(),
            align: 'center' as const,
        }))
    ];

    // 构建表格数据
    const today = moment().format('YYYY-MM-DD');
    const tableData = TIME_SLOTS.map(slot => ({
        key: slot.key,
        timeSlot: slot.label,
        ...games.reduce((acc, game) => ({
            ...acc,
            [game.id]: scheduleData[game.id]?.[today]?.[slot.key] || 0
        }), {})
    }));

    return (
        <Card
            title={<div className="text-xl font-bold">{title}</div>}
            bordered={false}
            className="mb-5 w-full"
        >
            <Table
                columns={columns}
                dataSource={tableData}
                loading={loading}
                pagination={false}
                bordered
                scroll={{ x: 'max-content' }}
                size="small"
                className={"max-w-[70vw]"}
            />
        </Card>
    );
};

export default Review;