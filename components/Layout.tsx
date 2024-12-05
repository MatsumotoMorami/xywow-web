import {Container, Nav, Panel, Sidenav} from "rsuite";
import 'rsuite/sidenav/styles/index.css'
import 'rsuite/nav/styles/index.css'
import 'rsuite/dropdown/styles/index.css'
import 'rsuite/Panel/styles/index.css'
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';
import CalendarIcon from '@rsuite/icons/legacy/Calendar';
import ExitIcon from '@rsuite/icons/Exit';
import {useEffect, useState} from "react";
import {Paypal, Server, SignOut} from "@rsuite/icons/cjs/react/legacy";
import MenuIcon from '@rsuite/icons/Menu';
import {Text} from 'rsuite';
import {motion} from "framer-motion";

const SERVER_URL = "https://api.xywow.studio:12060";

export function DefaultLayout() {
    const [isLoading, setIsLoading] = useState(true); // 跟踪加载状态
    const [isAuthenticated, setIsAuthenticated] = useState(false); // 跟踪鉴权状态
    const [nickname, setNickname] = useState("忆梦");
    const [expand, setExpand] = useState(false);
    const [page, setPage] = useState(1);
    const [auth, setAuth] = useState("STAFF");
    const [playTime, setPlayTime] = useState("");
    const [balance, setBalance] = useState(0);
    const [consumption, setConsumption] = useState(0);
    const [userid, setUserId] = useState(2803355799);
    const [image, setImage] = useState("https://q2.qlogo.cn/headimg_dl?dst_uin=2803355799&spec=640");
    const onclick1 = () => {
        setPage(1)
    }
    const onclick2 = () => {
        setPage(2)
    }
    const onclick3 = () => {
        setPage(3)
    }
    const onclick4 = () => {
        setPage(4)
    }
    const onclick5 = () => {
        setPage(5)
    }
    const onclick6 = () => {
        fetch(`${SERVER_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include' // 确保发送cookie
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user info');
                }
                window.location.href = "/";
                return response.json();
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
            });
    }
    useEffect(() => {
        // 获取用户信息
        fetch(`${SERVER_URL}/auth/user`, {
            method: 'GET',
            credentials: 'include' // 确保发送cookie
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 500) {
                        window.location.href = "/";
                    }
                    throw new Error('Failed to fetch user info');
                }
                return response.json();
            })
            .then(data => {
                console.log(data)
                setUserId(data.userId);
                setImage(`https://q2.qlogo.cn/headimg_dl?dst_uin=${data.userId}&spec=640`);
                setNickname(data.userName);
                if (data.auth === 0) {
                    setAuth("STAFF");
                } else if (data.auth === 1) {
                    setAuth("普通玩家");
                } else if (data.auth === 2) {
                    setAuth("您已被警告");
                } else if (data.auth === 3) {
                    setAuth("您已被封禁");
                }
                setBalance(data.money)
                setConsumption(data.consumption)
                setPlayTime(data.playTime)
                setIsAuthenticated(true);
            }).finally(() => {
            setIsLoading(false); // 完成加载
        })
            .catch(error => {
                console.error('Error fetching user info:', error);
            });
    }, []);
    // if (isLoading) {
    //     // 在鉴权完成之前，显示加载指示器
    //     return <div>加载中...</div>;
    // }
    // if (!isAuthenticated) {
    //     window.location.href = "/";
    // } else
    return (
        <Container>
            <Sidenav className="max-w-[300px] min-h-[100vh] fixed" expanded={expand}>
                <Sidenav.Body>
                    <Nav className={"text-center"}>
                        <Nav.Item icon={<DashboardIcon/>} onClick={onclick1}>首页</Nav.Item>
                        <Nav.Item icon={<CalendarIcon/>} onClick={onclick2}>预约</Nav.Item>
                        <Nav.Item icon={<Paypal/>} onClick={onclick3}>充值</Nav.Item>
                        <Nav.Item icon={<MenuIcon/>} onClick={onclick4}>排行榜</Nav.Item>
                        <Nav.Item icon={<Server/>} onClick={onclick5}>管理面板</Nav.Item>
                    </Nav>
                </Sidenav.Body>
                <Sidenav.Toggle onToggle={setExpand}/>
            </Sidenav>
            <motion.div
                animate={{marginLeft: expand ? "330px" : "86px", paddingTop: "30px", opacity: page === 1 ? 1 : 0}}
                transition={{duration: 0.1}}
            >
                <Container className={"flex fixed"}>
                    <img src="https://q2.qlogo.cn/headimg_dl?dst_uin=2803355799&spec=640"
                         className="w-[30vh] h-[30vh] rounded-xl"
                         alt="头像"
                    ></img>
                    <Panel header={<Text className={"text-3xl"}>个人信息</Text>} shaded
                           className={"bg-white w-[40vw] h-[30vh] ml-5 font-black leading-loose"}>
                        <Text>昵称：{nickname}</Text>
                        <Text>游玩时间：{playTime}</Text>
                        <Text className={"whitespace-pre-wrap"}>预计消费：￥{consumption}</Text>
                        <Text>余额：￥{balance}</Text>
                        <Text>权限组：{auth}</Text>
                    </Panel>
                </Container>
            </motion.div>
            <motion.div
                animate={{marginLeft: expand ? "330px" : "86px", paddingTop: "30px", opacity: page === 2 ? 1 : 0}}
                transition={{duration: 0.1}}
            >
                <Container className={"flex fixed"}>
                    <img src="https://q2.qlogo.cn/headimg_dl?dst_uin=2803355799&spec=640"
                         className="w-[30vh] h-[30vh] rounded-xl"
                         alt="头像"
                    ></img>
                    <Panel header={<Text className={"text-3xl"}>个人信息</Text>} shaded
                           className={"bg-white w-[40vw] h-[30vh] ml-5 font-black leading-loose"}>
                        <Text>昵称：{nickname}</Text>
                        <Text>游玩时间：{playTime}</Text>
                        <Text className={"whitespace-pre-wrap"}>预计消费：￥{consumption} 余额：￥{balance}</Text>
                        <Text>权限组：{auth}</Text>
                    </Panel>
                </Container>
            </motion.div>
            <motion.div
                animate={{marginLeft: expand ? "330px" : "86px", paddingTop: "30px", opacity: page === 3 ? 1 : 0}}
                transition={{duration: 0.1}}
            >
                <Container className={"flex fixed"}>
                    <img src="https://q2.qlogo.cn/headimg_dl?dst_uin=2803355799&spec=640"
                         className="w-[30vh] h-[30vh] rounded-xl"
                         alt="头像"
                    ></img>
                    <Panel header={<Text className={"text-3xl"}>个人信息</Text>} shaded
                           className={"bg-white w-[40vw] h-[30vh] ml-5 font-black leading-loose"}>
                        <Text>昵称：{nickname}</Text>
                        <Text>游玩时间：{playTime}</Text>
                        <Text className={"whitespace-pre-wrap"}>预计消费：￥{consumption} 余额：￥{balance}</Text>
                        <Text>权限组：{auth}</Text>
                    </Panel>
                </Container>
            </motion.div>
            <motion.div
                animate={{marginLeft: expand ? "330px" : "86px", paddingTop: "30px", opacity: page === 4 ? 1 : 0}}
                transition={{duration: 0.1}}
            >
                <Container className={"flex fixed"}>
                    <img src="https://q2.qlogo.cn/headimg_dl?dst_uin=2803355799&spec=640"
                         className="w-[30vh] h-[30vh] rounded-xl"
                         alt="头像"
                    ></img>
                    <Panel header={<Text className={"text-3xl"}>个人信息</Text>} shaded
                           className={"bg-white w-[40vw] h-[30vh] ml-5 font-black leading-loose"}>
                        <Text>昵称：{nickname}</Text>
                        <Text>游玩时间：{playTime}</Text>
                        <Text className={"whitespace-pre-wrap"}>预计消费：￥{consumption} 余额：￥{balance}</Text>
                        <Text>权限组：{auth}</Text>
                    </Panel>
                </Container>
            </motion.div>
            <motion.div
                animate={{marginLeft: expand ? "330px" : "86px", paddingTop: "30px", opacity: page === 5 ? 1 : 0}}
                transition={{duration: 0.1}}
            >
                <Container className={"flex fixed"}>
                    <img src="https://q2.qlogo.cn/headimg_dl?dst_uin=2803355799&spec=640"
                         className="w-[30vh] h-[30vh] rounded-xl"
                         alt="头像"
                    ></img>
                    <Panel header={<Text className={"text-3xl"}>个人信息</Text>} shaded
                           className={"bg-white w-[40vw] h-[30vh] ml-5 font-black leading-loose"}>
                        <Text>昵称：{nickname}</Text>
                        <Text>游玩时间：{playTime}</Text>
                        <Text className={"whitespace-pre-wrap"}>预计消费：￥{consumption} 余额：￥{balance}</Text>
                        <Text>权限组：{auth}</Text>
                    </Panel>
                </Container>
            </motion.div>
            <motion.div
                animate={{marginLeft: expand ? "330px" : "86px", paddingTop: "30px", opacity: page === 6 ? 1 : 0}}
                transition={{duration: 0.1}}
            >
                <Container className={"flex fixed"}>
                    <img src="https://q2.qlogo.cn/headimg_dl?dst_uin=2803355799&spec=640"
                         className="w-[30vh] h-[30vh] rounded-xl"
                         alt="头像"
                    ></img>
                    <Panel header={<Text className={"text-3xl"}>个人信息</Text>} shaded
                           className={"bg-white w-[40vw] h-[30vh] ml-5 font-black leading-loose"}>
                        <Text>昵称：{nickname}</Text>
                        <Text>游玩时间：{playTime}</Text>
                        <Text className={"whitespace-pre-wrap"}>预计消费：￥{consumption} 余额：￥{balance}</Text>
                        <Text>权限组：{auth}</Text>
                    </Panel>
                </Container>
            </motion.div>
        </Container>
    )

}