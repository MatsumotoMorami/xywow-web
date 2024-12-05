import {Container, Nav, Panel, Sidenav} from "rsuite";
import 'rsuite/sidenav/styles/index.css'
import 'rsuite/nav/styles/index.css'
import 'rsuite/dropdown/styles/index.css'
import 'rsuite/Panel/styles/index.css'
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';
import CalendarIcon from '@rsuite/icons/legacy/Calendar';
import { useEffect, useState} from "react";
import {Paypal, Server} from "@rsuite/icons/cjs/react/legacy";
import MenuIcon from '@rsuite/icons/Menu';
import { Text } from 'rsuite';
import { motion } from "framer-motion";
export function DefaultLayout() {

    const [nickname, setNickname] = useState("忆梦");
    const [expand, setExpand] = useState(false);
    const [page, setPage] = useState(1);
    const [auth, setAuth] = useState("STAFF");
    const [playTime,setPlayTime] = useState("");
    const [balance,setBalance] = useState(0);
    const [consumption,setConsumption] = useState(0);
    const onclick1=()=>{setPage(1)}
    const onclick2=()=>{setPage(2)}
    const onclick3=()=>{setPage(3)}
    const onclick4=()=>{setPage(4)}
    const onclick5=()=>{setPage(5)}


    const SERVER_URL = "https://api.xywow.studio:12060";

    useEffect(() => {
        // 获取用户信息
        fetch(`${SERVER_URL}/auth/hello`, {
            method: 'GET',
            credentials: 'include' // 确保发送cookie
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user info');
                }
                return response.json();
            })
            .then(data => {
                setNickname(data.userName);
                setAuth(data.auth);
                setBalance(data.money)
                setConsumption(data.consumption)
                setPlayTime(data.playTime)
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
            });
    }, []);
    // @ts-ignore
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
                        <Text className={"whitespace-pre-wrap"}>预计消费：￥{consumption} 余额：￥{balance}</Text>
                        <Text>权限组：{auth}</Text>
                    </Panel>
                </Container>
            </motion.div>
        </Container>
    )
}