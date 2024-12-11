import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table,
    Button,
    Modal,
    message,
    Card,
    Row,
    Col,
    DatePicker,
    Form,
    Select,
    Space,
} from 'antd';
import moment, { Moment } from 'moment';

const { Option } = Select;

// 定义接口
interface Game {
    id: number;
    name: string;
}

interface Schedule {
    [date: string]: {
        [timeRange: string]: number;
    };
}

interface Appointment {
    id: number;
    games: string[];
    startDateTime: string;
    endDateTime: string;
    createdAt: string;
}

interface MergedAppointment {
    ids: number[];
    games: string[];
    date: string;
    startTime: string;
    endTime: string;
    endDate: string; // 添加结束日期字段
    createdAt: string;
}

const url = "https://api.xywow.studio";

const AppointmentModule: React.FC = () => {
    // 状态管理
    const [games, setGames] = useState<Game[]>([]);
    const [selectedGame, setSelectedGame] = useState<number | null>(null);
    const [schedule, setSchedule] = useState<Schedule>({});
    const [loadingSchedule, setLoadingSchedule] = useState<boolean>(false);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loadingAppointments, setLoadingAppointments] = useState<boolean>(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
    const [deleteIds, setDeleteIds] = useState<number[]>([]);
    const [isBookingModalVisible, setIsBookingModalVisible] = useState<boolean>(false);
    const [bookingForm] = Form.useForm();

    // 组件挂载时获取游戏列表和用户预约
    useEffect(() => {
        fetchGames();
        fetchAppointments();
    }, []);

    // 获取游戏列表
    const fetchGames = async () => {
        try {
            const response = await axios.get<Game[]>(`${url}/games`, { withCredentials: true });
            setGames(response.data);
            if (response.data.length > 0) {
                setSelectedGame(response.data[0].id);
                fetchSchedule(response.data[0].id);
            }
        } catch (error: any) {
            message.error('获取游戏列表失败');
            console.error(error);
        }
    };

    // 获取预约情况
    const fetchSchedule = async (gameId: number) => {
        setLoadingSchedule(true);
        try {
            const response = await axios.get<{ schedule: Schedule }[]>(`${url}/appointments/schedule`, {
                params: { gameId },
                withCredentials: true,
            });

            if (response.data.length > 0) {
                const rawSchedule = response.data[0].schedule;
                // 打印原始数据以便调试
                console.log('Raw schedule:', rawSchedule);
                setSchedule(rawSchedule);
            } else {
                setSchedule({});
            }
        } catch (error: any) {
            message.error('获取预约情况失败');
            console.error(error);
        } finally {
            setLoadingSchedule(false);
        }
    };

    // 获取用户预约
    const fetchAppointments = async () => {
        setLoadingAppointments(true);
        try {
            const response = await axios.get<Appointment[]>(`${url}/my-appointments`, {
                withCredentials: true,
            });
            setAppointments(response.data);
            console.log('Fetched Appointments:', response.data);
        } catch (error: any) {
            message.error('获取预约记录失败');
            console.error(error);
        } finally {
            setLoadingAppointments(false);
        }
    };

    // 处理游戏选择变化
    const handleGameChange = (value: number) => {
        setSelectedGame(value);
        fetchSchedule(value);
    };

    // 显示删除确认模态框
    const showDeleteConfirm = (ids: number[]) => {
        setDeleteIds(ids);
        setIsDeleteModalVisible(true);
    };

    // 处理预约删除
    const handleDelete = async () => {
        try {
            await axios.delete(`${url}/appointments`, {
                data: { ids: deleteIds },
                withCredentials: true,
            });
            message.success('预约已成功取消');
            fetchAppointments();
            if (selectedGame) {
                fetchSchedule(selectedGame);
            }
        } catch (error: any) {
            message.error('取消预约失败');
            console.error(error);
        } finally {
            setIsDeleteModalVisible(false);
            setDeleteIds([]);
        }
    };

    // 取消删除
    const handleDeleteCancel = () => {
        setIsDeleteModalVisible(false);
        setDeleteIds([]);
    };

    // 显示预约模态框
    const showBookingModal = () => {
        setIsBookingModalVisible(true);
    };

    // 处理预约提交
    const handleBookingOk = () => {
        bookingForm.submit();
    };

    // 判断是否跨日
    const doesCrossMidnight = (start: Moment, end: Moment): boolean => {
        return end.isAfter(start, 'day');
    };

    // 禁用日期选择函数
    const disabledDate = (current: Moment) => {
        const now = moment().utcOffset(480);
        const startOfToday = now.clone().startOf('day');
        const endOf7Days = now.clone().add(6, 'days').endOf('day');
        return current < startOfToday || current > endOf7Days;
    };

    // 禁用时间选择函数
    const disabledTimeFunc = (current: Moment | null) => {
        if (!current) return {};

        const now = moment().utcOffset(480);
        if (current.isSame(now, 'day')) {
            const currentHour = now.hour();
            const currentMinute = now.minute();

            return {
                disabledHours: () => {
                    return Array.from({ length: 24 }, (_, i) => i).filter(hour => hour < currentHour);
                },
                disabledMinutes: (selectedHour: number) => {
                    if (selectedHour === currentHour) {
                        if (currentMinute < 30) {
                            return [0];
                        } else {
                            return [0, 30];
                        }
                    }
                    return [];
                }
            };
        }
        return {};
    };

    // 处理预约表单提交
    const onFinishBooking = async (values: any) => {
        const { gameIds, startDateTime, endDateTime } = values;

        const startMoment: Moment = startDateTime;
        const endMoment: Moment = endDateTime;

        if (doesCrossMidnight(startMoment, endMoment)) {
            try {
                await axios.post(
                    `${url}/appointments`,
                    {
                        gameIds,
                        startDateTime: startMoment.toISOString(),
                        endDateTime: endMoment.toISOString(),
                    },
                    {
                        withCredentials: true,
                    }
                );

                message.success('预约成功');
                setIsBookingModalVisible(false);
                bookingForm.resetFields();
                if (selectedGame) {
                    fetchSchedule(selectedGame);
                }
                fetchAppointments();
            } catch (error: any) {
                message.error(error.response?.data?.error || '预约失败');
                console.error(error);
            }
        } else {
            try {
                await axios.post(
                    `${url}/appointments`,
                    {
                        gameIds,
                        startDateTime: startMoment.toISOString(),
                        endDateTime: endMoment.toISOString(),
                    },
                    {
                        withCredentials: true,
                    }
                );

                message.success('预约成功');
                setIsBookingModalVisible(false);
                bookingForm.resetFields();
                if (selectedGame) {
                    fetchSchedule(selectedGame);
                }
                fetchAppointments();
            } catch (error: any) {
                message.error(error.response?.data?.error || '预约失败');
                console.error(error);
            }
        }
    };



    // 构建预约时间表的表格列
    const scheduleColumns = [
        {
            title: '时段',
            dataIndex: 'timeRange',
            key: 'timeRange',
            fixed: 'left' as const,
            render: (text: string) => <div style={{ whiteSpace: 'nowrap' }}>{text}</div>,
        },
        ...Object.keys(schedule).map((date) => {
            const momentDate = moment(date, 'YYYY-MM-DD');
            const formattedDate = momentDate.format('MM/DD');
            const dayOfWeek = momentDate.locale('zh-cn').format('dddd');
            const dayMap: { [key: string]: string } = {
                'Monday': '一',
                'Tuesday': '二',
                'Wednesday': '三',
                'Thursday': '四',
                'Friday': '五',
                'Saturday': '六',
                'Sunday': '日',
                '星期一': '一',
                '星期二': '二',
                '星期三': '三',
                '星期四': '四',
                '星期五': '五',
                '星期六': '六',
                '星期日': '日',
            };
            const dayChar = dayMap[dayOfWeek] || '';

            return {
                title: (
                    <div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                        {formattedDate}<br />({dayChar})
                    </div>
                ),
                dataIndex: date,
                key: date,
                render: (count: number) => <div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{count}</div>,
            };
        }),
    ];

    // 构建预约时间表的表格数据
    // 构建预约时间表的表格数据
    // 构建预约时间表的表格数据
    // 定义时间段数据
    const timeSlots = [
        { key: '凌晨', label: '凌晨' },
        { key: '08:00-10:00', label: '08-10' },
        { key: '10:00-12:00', label: '10-12' },
        { key: '12:00-14:00', label: '12-14' },
        { key: '14:00-16:00', label: '14-16' },
        { key: '16:00-18:00', label: '16-18' },
        { key: '18:00-20:00', label: '18-20' },
        { key: '20:00-22:00', label: '20-22' },
        { key: '22:00-24:00', label: '22-24' }  // 添加 22:00-24:00 时间段
    ];

// 构建预约时间表的表格数据
    const scheduleData = timeSlots.map((slot) => {
        return {
            key: slot.key,
            timeRange: slot.label,
            ...Object.fromEntries(
                Object.entries(schedule).map(([date, slots]) => {
                    let count = 0;

                    if (slot.key === '凌晨') {
                        // 凌晨时段需要合并 0:00-8:00 的所有时间段
                        const earlySlots = [
                            '0:00-2:00',
                            '2:00-4:00',
                            '4:00-6:00',
                            '6:00-8:00'
                        ];
                        // 取这些时间段中的最大值作为凌晨时段的预约数
                        count = Math.max(
                            ...earlySlots.map(timeSlot => slots[timeSlot] || 0)
                        );
                    } else {
                        // 其他时间段需要映射到后端的格式
                        const timeMap: { [key: string]: string } = {
                            '08:00-10:00': '8:00-10:00',
                            '10:00-12:00': '10:00-12:00',
                            '12:00-14:00': '12:00-14:00',
                            '14:00-16:00': '14:00-16:00',
                            '16:00-18:00': '16:00-18:00',
                            '18:00-20:00': '18:00-20:00',
                            '20:00-22:00': '20:00-22:00',
                            '22:00-24:00': '22:00-24:00'  // 添加映射
                        };
                        const apiTimeSlot = timeMap[slot.key];
                        count = slots[apiTimeSlot] || 0;
                    }

                    return [date, count];
                })
            ),
        };
    });
    // 合并预约记录
    const mergedAppointments: MergedAppointment[] = [];

    // 排序预约
    const sortedAppointments = [...appointments].sort((a, b) => {
        if (a.startDateTime !== b.startDateTime) {
            return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
        }
        return 0;
    });

    // 合并同日期、同时间的预约
    sortedAppointments.forEach((appointment) => {
        const startMoment = moment(appointment.startDateTime);
        const endMoment = moment(appointment.endDateTime);
        const date = startMoment.format('YYYY-MM-DD');
        const startTime = startMoment.format('HH:mm:ss');
        const endTime = endMoment.format('HH:mm:ss');
        const endDate = endMoment.format('YYYY-MM-DD');

        const existing = mergedAppointments.find(ma =>
            ma.date === date &&
            ma.startTime === startTime &&
            ma.endTime === endTime &&
            moment(`${ma.date} ${ma.endTime}`).isSame(endMoment)
        );

        if (existing) {
            existing.games.push(...appointment.games);
            existing.ids.push(appointment.id);
        } else {
            mergedAppointments.push({
                ids: [appointment.id],
                games: [...appointment.games],
                date: date,
                startTime: startTime,
                endTime: endTime,
                endDate: endDate, // 添加结束日期
                createdAt: appointment.createdAt,
            });
        }
    });


    // 构建预约卡片数据
    const cardData = mergedAppointments.map((ma, index) => ({
        key: index,
        games: ma.games.join(', '),
        startDateTime: moment(`${ma.date} ${ma.startTime}`).format('YYYY/MM/DD HH:mm:ss'),
        endDateTime: moment(`${ma.endDate} ${ma.endTime}`).format('YYYY/MM/DD HH:mm:ss'),
        ids: ma.ids,
    }));

    return (

        <div className="appointment-container max-w-[80vw]" style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Row gutter={[
                    {xs: 8, sm: 16},
                    {xs: 8, sm: 16}
                ]}>
                    {/* 创建新预约卡片 */}
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Card
                            title={<div className="text-xl font-bold">创建新预约</div>}
                            bordered={false}
                            className="mb-5"
                        >
                            <Button type="primary" onClick={showBookingModal} style={{marginBottom: 20}}>
                                新建预约
                            </Button>
                            {/* 创建预约模态框 */}
                            <Modal
                                title="创建预约"
                                visible={isBookingModalVisible}
                                onOk={handleBookingOk}
                                onCancel={() => setIsBookingModalVisible(false)}
                                okText="提交"
                                cancelText="取消"
                                width={350}
                                centered={true}  // 添加此属性
                                style={{
                                    maxWidth: 'calc(100vw - 16px)'
                                }}
                            >
                                <Form form={bookingForm} layout="vertical" onFinish={onFinishBooking}>
                                    <Form.Item
                                        name="gameIds"
                                        label="游戏"
                                        rules={[{required: true, message: '请选择至少一个游戏'}]}
                                    >
                                        <Select
                                            mode="multiple"
                                            placeholder="请选择游戏"
                                            style={{width: '100%'}}
                                        >
                                            {games.map((game) => (
                                                <Option key={game.id} value={game.id}>
                                                    {game.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        name="startDateTime"
                                        label="开始时间"
                                        rules={[{required: true, message: '请选择开始时间'}]}
                                    >
                                        <DatePicker
                                            showTime={{
                                                format: 'HH:mm',
                                                minuteStep: 30,
                                                // 禁用非00和30的分钟
                                                disabledMinutes: (selectedHour: number) => {
                                                    const allMinutes = Array.from({length: 60}, (_, i) => i);
                                                    return allMinutes.filter(minute => minute !== 0 && minute !== 30);
                                                }
                                            }}
                                            format="YYYY-MM-DD HH:mm"
                                            style={{width: '100%'}}
                                            disabledDate={disabledDate}
                                            disabledTime={disabledTimeFunc}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="endDateTime"
                                        label="结束时间"
                                        rules={[{required: true, message: '请选择结束时间'}]}
                                    >
                                        <DatePicker
                                            showTime={{
                                                format: 'HH:mm',
                                                minuteStep: 30,
                                                // 禁用非00和30的分钟
                                                disabledMinutes: (selectedHour: number) => {
                                                    const allMinutes = Array.from({length: 60}, (_, i) => i);
                                                    return allMinutes.filter(minute => minute !== 0 && minute !== 30);
                                                }
                                            }}
                                            format="YYYY-MM-DD HH:mm"
                                            style={{width: '100%'}}
                                            disabledDate={disabledDate}
                                            disabledTime={disabledTimeFunc}
                                        />
                                    </Form.Item>
                                </Form>
                            </Modal>
                        </Card>
                    </Col>

                    {/* 查看预约情况卡片 */}
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Card
                            title={<div className="text-xl font-bold">游玩预约情况查看</div>}
                            bordered={false}
                            className="mb-5"
                        >
                            <Space direction="horizontal" wrap style={{width: '100%', marginBottom: '16px'}}>
                                {games.map((game) => (
                                    <Button
                                        key={game.id}
                                        onClick={() => handleGameChange(game.id)}
                                        style={{
                                            marginBottom: '8px',
                                            backgroundColor: selectedGame === game.id ? '#1890ff' : '#ffffff',
                                            color: selectedGame === game.id ? '#ffffff' : '#000000',
                                            borderColor: selectedGame === game.id ? '#1890ff' : '#d9d9d9',
                                        }}
                                    >
                                        {game.name}
                                    </Button>
                                ))}
                            </Space>
                            <div style={{overflowX: 'auto'}}>
                                <Table
                                    columns={scheduleColumns}
                                    dataSource={scheduleData}
                                    loading={loadingSchedule}
                                    pagination={false}
                                    bordered
                                    scroll={{x: 'max-content'}}
                                    size="small"
                                    tableLayout="auto"
                                />
                            </div>
                        </Card>
                    </Col>

                    {/* 我的预约卡片 */}
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Card
                            title={<div className="text-xl font-bold">我的预约</div>}
                            bordered={false}
                            className="mb-5"
                        >
                            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                                {cardData.map((record) => (
                                    <Card
                                        key={record.key}
                                        type="inner"
                                        size="small"
                                        style={{width: '100%'}}
                                    >
                                        <Space direction="vertical" style={{width: '100%'}}>
                                            <p><strong>游戏：</strong>{record.games}</p>
                                            <p><strong>开始时间：</strong>{record.startDateTime}</p>
                                            <p><strong>结束时间：</strong>{record.endDateTime}</p>
                                            <Button
                                                type="link"
                                                danger
                                                onClick={() => {
                                                    showDeleteConfirm(record.ids);
                                                }}
                                            >
                                                取消预约
                                            </Button>
                                        </Space>
                                    </Card>
                                ))}
                            </div>

                            {/* 删除预约确认模态框 */}
                            <Modal
                                title="确认取消预约"
                                visible={isDeleteModalVisible}
                                onOk={handleDelete}
                                onCancel={handleDeleteCancel}
                                okText="确认"
                                cancelText="取消"
                                centered={true}  // 添加此属性
                            >
                                <p>您确定要取消此预约吗？</p>
                            </Modal>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
            );
            };

            export default AppointmentModule;
