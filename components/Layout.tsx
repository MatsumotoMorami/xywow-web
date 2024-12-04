import {Affix, Container, Dropdown, Nav, Sidenav} from "rsuite";
import 'rsuite/sidenav/styles/index.css'
import 'rsuite/nav/styles/index.css'
import 'rsuite/dropdown/styles/index.css'
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';
import CalendarIcon from '@rsuite/icons/legacy/Calendar';
import {useState} from "react";
import {Paypal, Server} from "@rsuite/icons/cjs/react/legacy";
import MenuIcon from '@rsuite/icons/Menu';
export function DefaultLayout() {
    const [expand, setExpand] = useState(true);
    const [page, setPage] = useState(1);
    const onclick1=()=>{setPage(1)}
    const onclick2=()=>{setPage(2)}
    const onclick3=()=>{setPage(3)}
    const onclick4=()=>{setPage(4)}
    const onclick5=()=>{setPage(5)}
    return (
        <Container>
            <Sidenav className="max-w-[300px] min-h-[100vh] fixed" expanded={expand}>
                <Sidenav.Body>
                    <Nav>
                        <Nav.Item icon={<DashboardIcon/>} onClick={onclick1}>首页</Nav.Item>
                        <Nav.Item icon={<CalendarIcon/>} onClick={onclick2}>预约</Nav.Item>
                        <Nav.Item icon={<Paypal/>} onClick={onclick3}>充值</Nav.Item>
                        <Nav.Item icon={<MenuIcon/>} onClick={onclick4}>排行榜</Nav.Item>
                        <Nav.Item icon={<Server/>} onClick={onclick5}>管理面板</Nav.Item>
                    </Nav>
                </Sidenav.Body>
                <Sidenav.Toggle onToggle={setExpand} />
            </Sidenav>
        </Container>
    )
}